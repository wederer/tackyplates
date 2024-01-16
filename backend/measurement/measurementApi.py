import os
from asgiref.sync import sync_to_async
import threading
from datetime import datetime
from measurement import updateTask
import asyncio
from threading import Thread

from infra.logger import logger

from hardware.measurer import measure

# lock? => https://stackoverflow.com/a/40016435/1772368
queue_lock = threading.RLock()
measurements_queue = [] # TODO add typings (import measurementtask here will break, because URLs module is not loaded yet)
def add_to_queue(measurement_tasks):
    logger.debug('%s tasks to add: %s', len(measurement_tasks), measurement_tasks)
    with queue_lock:
        global measurements_queue

        def add_and_sort(m_tasks):
            measurements_queue.extend(m_tasks)
            logger.debug('after adding len %s: %s', len(measurements_queue), measurements_queue)
            measurements_queue.sort(key=lambda mt: mt.time)
            logger.debug('after sorting: %s', measurements_queue)

        # if no measurements are in queue then we start the loop
        # if the last measurement was taken we end the loop
        if len(measurements_queue) == 0:
            add_and_sort(measurement_tasks)
            logger.debug("starting updateTask")
            daemon = Thread(target=updateTask.start, daemon=True, name='Background')
            daemon.start()
        else:
            add_and_sort(measurement_tasks)


@sync_to_async
def get_experiment_async(exp_id):
    from main.models import Experiment
    logger.debug(f"getting experiment with number {exp_id}")
    return Experiment.objects.get(id=exp_id)

@sync_to_async
def save_raw_measurements(meas_data_df, meas_id):
    from main.models import RawMeasurement
    logger.debug(f"saving raw measurement data with id {meas_id}: {meas_data_df}")
    raw_measurements = [RawMeasurement(
        value=measurement['values'],
        measurement_id=meas_id,
    ) for measurement in meas_data_df.to_dict('records')]
    RawMeasurement.objects.bulk_create(raw_measurements)

@sync_to_async
def save_measurement(measurement):
    logger.debug(f"saving measurement {measurement}")
    measurement.save()
    logger.debug(f"returning id {measurement.id}")
    return measurement.id

async def measure_if_needed():
    try:
        from tackyplates.urls import global_experiments, global_experiments_lock
        from main.models import Measurement

        with queue_lock:
            global measurements_queue
            if len(measurements_queue) == 0:
                # nothing to do => stop the loop until we have measurements to take, then we start it up again
                logger.debug("ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ")
                logger.debug("ZZZZZZZZZZZZZZZZZZZZ STOP UPDATE TASK ZZZZZZZZZZZZZZZZZZ")
                logger.debug("ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ")
                await updateTask.stop()
                return

            measurement_task = measurements_queue[0]

        if datetime.now() < measurement_task.time:
            # task is not due yet (queue is sorted by time)
            return

        logger.debug('TAKING MEASUREMENT NOW: %s, measurement_time %s', datetime.now(), measurement_task)
        meas_data = await measure(measurement_task.position)

        mean_value = meas_data['values'].mean()
        logger.debug(f"GOT DATA: {meas_data}. Saving mean {mean_value}")

        new_measurement = Measurement()
        new_measurement.value = mean_value
        experiment = await get_experiment_async(measurement_task.experiment.id)
        new_measurement.experiment = experiment
        logger.debug(f"saving measurement {new_measurement}")
        with queue_lock:
            meas_id = await save_measurement(new_measurement)
            logger.debug(f"saving raw measurements")
            await save_raw_measurements(meas_data, meas_id)
            logger.debug("saved measurement: %s", new_measurement)

            # remove first item from queue
            measurements_queue.pop(0)
        with global_experiments_lock:
            exp = next((exp for exp in global_experiments if exp.id == measurement_task.experiment.id), None)
            if exp is None:
                raise ValueError("Experiment not found - this should not happen.")
            remaining = len([elem for elem in measurements_queue if elem.experiment.id == measurement_task.experiment.id])
            total = len(exp.measurement_times)
            exp.progress = (total - remaining) / len(exp.measurement_times)
            logger.debug(f"progress {exp.progress}")


    except Exception as e:
        logger.critical(e, exc_info=True)

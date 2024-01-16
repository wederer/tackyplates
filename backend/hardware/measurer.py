from hardware.distance_sensor.distance_sensor_class import DistanceMeasurement
from hardware.hardware import get_settings_async
import asyncio
from infra.logger import logger
import time

MEASUREMENT_TIMEOUT = 10
async def measure(position):
    from hardware.hardware import plate_mover, ball_dropper, guide
    setting = await get_settings_async()

    plate_mover.move_to_position(position)
    guide.down()
    ball_dropper.drop_ball()

    # sleep for a short time otherwise pin initialization for the distance sensor does sometimes not work
    time.sleep(0.05)
    better_measurer = DistanceMeasurement(
        5,
        threshold_distance=0.5,
        interval=0.05,
        board_length = setting.board_length,
        ball_diameter = setting.ball_diameter
    )
    meas_data = None
    try:
        meas_data = await asyncio.wait_for(better_measurer.measure(), MEASUREMENT_TIMEOUT)
    except asyncio.TimeoutError:
        logger.error(f"Measurement took longer than {MEASUREMENT_TIMEOUT} seconds and ran into a timeout.")

    guide.up()

    return meas_data

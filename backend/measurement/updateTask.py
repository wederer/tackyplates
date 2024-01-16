from measurement import measurementApi
from hardware import hardware
import asyncio
from time import sleep
from threading import Thread, RLock
from infra.logger import logger


TIMEOUT = 30
SLEEP_TIME = 5
def _measure_if_needed():
    async def measure():
        try:
            await asyncio.wait_for(measurementApi.measure_if_needed(), TIMEOUT)
        except asyncio.TimeoutError:
            logger.error(f"Measurement took longer than {TIMEOUT} seconds and ran into a timeout.")

    global run_measurement_loop
    with run_measurement_lock:
        while run_measurement_loop is True:
            asyncio.run(measure())
            sleep(SLEEP_TIME)
            logger.debug(f"loop running {run_measurement_loop}")
        logger.debug("XXXXXXXXXXXXXXXXXXXXXX")
        logger.debug("MEASUREMENT_LOOP_ENDED")
        logger.debug("XXXXXXXXXXXXXXXXXXXXXX")


run_measurement_lock = RLock()
run_measurement_loop = False
def start():
    asyncio.run(hardware.initialize())

    # create and start the daemon thread
    logger.debug('Starting measure_if_needed background loop...')
    with run_measurement_lock:
        global run_measurement_loop
        run_measurement_loop = True
        daemon = Thread(target=_measure_if_needed, daemon=True, name='Background')
        daemon.start()
    logger.debug('measure_if_needed background loop started.')

async def stop():
    # create and start the daemon thread
    with run_measurement_lock:
        global run_measurement_loop
        run_measurement_loop = False
        logger.debug(f"set run_measurement_loop to false: {run_measurement_loop}")
    logger.debug('measure_if_needed background loop stopped.')


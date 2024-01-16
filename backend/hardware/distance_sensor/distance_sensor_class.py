import datetime
import pandas as pd
from datetime import datetime, timedelta
import time
import asyncio
import os
from infra.logger import logger

# by running the server with environment variable MOCK=1 we use the mock sensor
# e.g. MOCK=1 ./start.sh => sensor always returns 10 for now
if int(os.getenv('MOCK_DISTANCE', 0)) == 0 and int(os.getenv('MOCK', 0)) == 0 :
    from gpiozero import DistanceSensor
else:
    from hardware.distance_sensor.distance_sensor_mock import DistanceSensor


# thread-safe Event
class Event_ts(asyncio.Event):
    def set(self):
        self._loop.call_soon_threadsafe(super().set)

class DistanceMeasurement:

    def __init__(self, t_max, threshold_distance=0.2, interval=.1, board_length=50.0, ball_diameter=4.0):
        self.t_max = t_max
        self.interval = interval
        self.sensor = DistanceSensor(
            5,  # echo
            6,  # trig
            threshold_distance=threshold_distance
        )
        self.start_event = Event_ts()
        self.end_time = None
        self.board_length = board_length
        self.ball_diameter = ball_diameter

    def __del__(self):
        logger.debug("DESTRUCTOR CALLED")

    async def _measure(self, event):
        _d_cm = []
        _dt = []

        while self.end_time > datetime.now():
            d_cm = self.board_length - self.sensor.distance * 100 - 0.5 * self.ball_diameter  # take measurement from sensor
            dt = datetime.now()
            logger.debug("measured %s at %s", d_cm, dt)
            _d_cm.append(d_cm)
            _dt.append(dt)
            time.sleep(self.interval)

        data = pd.DataFrame({
            "times": _dt,
            "values": _d_cm
        })
        del self.sensor
        return data

    async def measure(self):
        self.end_time = datetime.now() + timedelta(seconds=self.t_max)
        return await asyncio.create_task(self._measure(self.start_event))

    def cleanup(self):
        self.sensor.close()


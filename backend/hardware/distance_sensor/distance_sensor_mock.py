from threading import Timer
import random
"""
    Mock of DistanceSensor from gpiozero
"""
class DistanceSensor():
    def __init__(self, echo, trig, threshold_distance=20):
        self._when_in_range = None
        self.mock_distance = random.randint(0,50) / 100.0

    @property
    def when_in_range(self):
        return self._when_in_range

    @when_in_range.setter
    def when_in_range(self, value):
        self._when_in_range = value
        Timer(2.0, self._when_in_range).start()


    @property
    def distance(self):
        return self.mock_distance  # this is in meters

    def cleanup(self):
        print("cleaned up distance_sensor pins")

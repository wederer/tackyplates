import RPi.GPIO as GPIO
import time
from infra.logger import logger


class Solenoid:
    """
    Moves the Solenoid to drop a ball
    """

    def __init__(self, drop_time):
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(21, GPIO.OUT)
        GPIO.output(21, GPIO.LOW)
        if drop_time is not None:
            self.drop_time = drop_time
        else:
            self.drop_time = 0.2

    def drop_ball(self):
        logger.debug(f"Dropping ball with drop_time {self.drop_time}")
        GPIO.output(21, GPIO.HIGH)
        time.sleep(self.drop_time)
        GPIO.output(21, GPIO.LOW)

# wiring: https://tutorials-raspberrypi.de/entfernung-messen-mit-ultraschallsensor-hc-sr04/
# gpiozero docu: https://gpiozero.readthedocs.io/en/stable/api_input.html#distancesensor-hc-sr04

from threading import Thread, Event, Timer
from gpiozero import DistanceSensor
import time

# initialize Sensor (use GPIO numbering)
sensor = DistanceSensor(
    5,  # echo
    6,  # trig
    threshold_distance=0.1  # m
)


# define event functions
def say_in_range():
    print("in range")


def say_out_of_range():
    print("out of range")


# establish functions
sensor.when_in_range = say_in_range
sensor.when_out_of_range = say_out_of_range

while True:
    print("...")
    print(sensor.distance)
    time.sleep(.25)

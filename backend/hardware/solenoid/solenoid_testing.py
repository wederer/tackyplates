import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)

# set GPIO 21 as artifical HIGH
# GPIO.setup(21, GPIO.OUT)
# GPIO.output(21, GPIO.HIGH)


# Set GPIO as Toogle
GPIO.setup(21, GPIO.OUT)
GPIO.output(21, GPIO.LOW)

# time.sleep(5)

# toogle
for i in range(12):
    print("H")
    GPIO.output(21, GPIO.HIGH)
    # release
    time.sleep(.2)
    print("L")
    GPIO.output(21, GPIO.LOW)
    # pause
    time.sleep(2)

# clean
GPIO.cleanup()

# info
print("Done")


from gpiozero import Servo
import time

# init Servo
servo = Servo(
            16,  # GPIO #16 (see https://pinout.xyz/pinput)
            initial_value=0,
            min_pulse_width=1/2000,#*0.9,
            max_pulse_width=2/1000*1.2
            )

# Stellweg 90°
while True:
    servo.max()
    print("max")
    time.sleep(1.5)
    servo.min()
    print("min")
    time.sleep(3)

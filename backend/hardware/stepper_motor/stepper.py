import RPi.GPIO as GPIO
import time

GPIO.setwarnings(False)


# based on
# see https://www.electronicshub.org/raspberry-pi-stepper-motor-control/
# https://pinout.xyz/pinout/pin12_gpio18
class Stepper:

    def __init__(self, p1, p2, p3, p4, direction_inverted=False, halfstep_sleep_time = 0.005):
        """
        Init L298N driver with connection to pins p1 .. p4 (GPIO BOARD configuration!, # https://pinout.xyz/pinout/)
        
        """

        self.stop_flag = False

        self.outputs = [p1, p2, p3, p4]
        self.direction_inverted = direction_inverted

        # Q: welche bedeutung haben diese members?
        self.i = 0
        self.positive = 0
        self.negative = 0
        self.y = 0

        # gpio setup
        GPIO.setmode(GPIO.BCM)

        for output in self.outputs:
            GPIO.setup(output, GPIO.OUT)
            GPIO.output(output, GPIO.LOW)


        # default speed
        self.t_sleep = halfstep_sleep_time

    def moveNextHalfStep(self, i):
        halfstep_seq = [
            [1, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 1],
            [0, 0, 0, 1],
            [1, 0, 0, 1]
        ]

        for output_index, output in enumerate(self.outputs):
            GPIO.output(output, halfstep_seq[i][output_index])

        time.sleep(self.t_sleep)

    def move_half_steps(self, steps, degree=None):
        """
        move steps
        """

        # convert deg to steps
        if degree:
            # Q: 400? bedeutet was?
            steps = 400 / 360 * degree  # cf. half step mode implemented herein with 1.8° motor
            # convert to on
            steps = int(steps)

        x = steps

        if self.direction_inverted is True:
            x = -x

        # set initial state
        i = self.i

        # Info
        print("{} steps at t {}".format(steps, self.t_sleep))

        if x > 0:
            for y in range(x, 0, -1):

                #                 # limit switch?
                #                 state_p1 = GPIO.input(p1)
                #
                #                 if state_p1 == BREAK_CONDITION:
                #                     # info
                #                     print("stopped moving")
                #
                #                     # return
                #                     return -1
                #
                #                     break

                # stop?
                if self.stop_flag == True:
                    return

                if self.negative == 1:
                    if i == 7:
                        i = 0
                    else:
                        i = i + 1
                    y = y + 2
                    self.negative = 0
                self.positive = 1

                self.moveNextHalfStep(i)

                if i == 7:
                    i = 0
                    continue
                i = i + 1


        elif x < 0:
            x = x * -1
            for y in range(x, 0, -1):
                #
                #                 # limit switch?
                #                 state_p1 = GPIO.input(p1)
                #
                #                 if state_p1 == BREAK_CONDITION:
                #                     # info
                #                     print("stopped moving")
                #
                #                     # return
                #                     return -2
                #
                #                     break

                # stop?
                if self.stop_flag == True:
                    return

                if self.positive == 1:
                    if i == 0:
                        i = 7
                    else:
                        i = i - 1
                    y = y + 3
                    self.positive = 0
                self.negative = 1

                self.moveNextHalfStep(i)

                if i == 0:
                    i = 7
                    continue
                i = i - 1

        # pause after execution
        time.sleep(0.01)

        # return
        return 1

    def set_speed(self, t_sleep):
        """
        t_sleep minimum ~0.002 still possible
        """

        if t_sleep >= 0.002 and t_sleep <= 0.04:
            # set
            self.t_sleep = t_sleep
            # info
            print("t_sleep set to ", t_sleep)
        else:
            # message
            print("Use sleep time in appropriate range")

    #
    # wrapper for moving certain angle
    #
    def move_degree(self, degree):

        # move
        ret = self.move_half_steps(None, degree=degree)

        # return
        return ret

    #
    # stop motor and re-enable
    #
    def stop_and_reenable(self):

        print("stopping and reenabling")

        # break stepping loop
        self.stop_flag = True

        # short pause
        time.sleep(0.01)

        # re-enable motor
        self.stop_flag = False

    def turn_off(self):
        for output_index, output in enumerate(self.outputs):
            GPIO.output(output, 0)


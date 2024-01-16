import gpiozero
import time
from infra.logger import logger

from hardware.stepper_motor import stepper


# class "PlateMover"
class PlateMover():

    def __init__(self, stepper_A=None, stepper_B=None, stepper_C=None, stepper_D=None,
                 stepper_direction_inverted=False,
                 halfstep_sleep_time=0.005,
                 limit_1=None, limit_2=None, show_info=True
                 ):
        """
        initialize PlateMover consisting of a stepper and two buttons serving as limit switches
        movement is allowed in both limit switches as HIGH
        """

        if stepper_direction_inverted:
            self.back_up_steps = -200  # number of steps to back up after limit switch trigger
        else:
            self.back_up_steps = 200  # number of steps to back up after limit switch trigger

        # stepper
        self.stepper = stepper.Stepper(
            stepper_A,
            stepper_B,
            stepper_C,
            stepper_D,
            stepper_direction_inverted,
            halfstep_sleep_time,
            # gpio_board=False  # use "BCM", i.e. GPIO numbering instead
        )

        # switch limit 1
        self.button_limit_1 = gpiozero.Button(
            limit_1,  # GPIO number of pin for movement limit,
            #                 bounce_time=0.01,  # [s],
            hold_time=0.1,  # [s]
            pull_up=False,  # cf. connection not(!) to ground
        )

        # switch limit 2
        self.button_limit_2 = gpiozero.Button(
            limit_2,  # GPIO number of pin for manual trigger
            #                 bounce_time=0.01,  # [s]
            hold_time=0.1,  # [s] until firing "held" signal
            pull_up=False,  # cf. connection not(!) to ground
        )

        # connect function to button action
        # "release" corresponds to transition True --> False
        self.button_limit_1.when_released = self.switch_off_stepper
        self.button_limit_2.when_released = self.switch_off_stepper

        # init position variables
        self.position_in_mm  = 0
        self.position_steps = 0

        # TODO remove this
        # def stop_endless_homing():
            # logger.debug("stepper switched off, as 30 seconds were not enough to home")
            # self.stepper.stop_and_reenable()
        # t = Timer(30.0, stop_endless_homing)
        # t.start()

        # perform homing as part of init
        self.home()



    #
    # switch off stepper
    #
    def switch_off_stepper(self):
        # info
        logger.debug("switch_off_stepper")

        # set motor speed to zero
        self.stepper.stop_and_reenable()

        # who triggered?

        # if switch 1 hit
        if not self.button_limit_1.is_pressed:
            # info
            logger.debug("switch 1 hit - backing up")
            # move
            self.stepper.move_half_steps(self.back_up_steps)

        if not self.button_limit_2.is_pressed:
            # info
            logger.debug("switch 2 hit - backing up")
            # move
            self.stepper.move_half_steps(-self.back_up_steps)

    #
    # print button info
    #
    def print_button_info(self):
        """
        print button info
        """

        logger.debug("\n###############")
        logger.debug("Limit 1:", self.button_limit_1.is_pressed)
        logger.debug("Limit 2:", self.button_limit_2.is_pressed)

    #
    # home stepper
    #
    def home(self):
        """
        home stepper == move until switch 1 triggered, then move back a little
        """

        # move towards limit switch until hit
        self.stepper.move_degree(-1e5)

        # set current position as zero
        self.position_in_mm  = 0
        self.position_steps = 0

    #
    # move to position
    #
    def move_to_position(self, position_in_cm):
        position_in_mm = position_in_cm * 10
        """
        move to a defined position (0 after homing; certain number of steps between positions)
        """
        # info
        logger.debug("move_to_position called")

        if position_in_mm < 0:
            # info
            logger.debug("position < 0 not allowed")
            return

        half_steps_per_revolution = 400
        distance_per_revolution = 5  # [mm]
        half_steps_per_mm = half_steps_per_revolution / distance_per_revolution
        # info
        logger.debug(half_steps_per_mm, " half steps per mm...")

        # current position
        pos_mm_now = self.position_in_mm
        pos_steps_now = self.position_steps

        # target position
        pos_mm_next = position_in_mm
        pos_steps_next = pos_mm_next * half_steps_per_mm

        # info
        logger.debug("Moving from position {} ({} steps) to position {} ({}steps) = {} steps.".format(
            pos_mm_now, pos_steps_now,
            pos_mm_next, pos_steps_next,
            int(pos_steps_next - pos_steps_now)
        )
        )

        # move stepper
        ret = self.stepper.move_half_steps(
            int(pos_steps_next - pos_steps_now)
        )
        # info
        logger.debug("info from 'move_half_steps'", ret)

        if ret:
            # set target position as new
            self.position_in_mm = pos_mm_next
            self.position_steps = pos_steps_next

            # formatting
            logger.info("moving steppermotor --> DONE")
            logger.info("turning off stepper after moving")
            self.stepper.turn_off()
            # sleep
            time.sleep(2)

            # return
            return 1

        else:
            return -1


    def cleanup(self):
        self.button_limit_1.close()
        self.button_limit_2.close()

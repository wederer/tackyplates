from gpiozero import Servo


class BallGuide:

    def __init__(self, gpio=16, show_info=True):
        """
        Object for moving the two-panel ball limiter up and down.
        
        min and max pulse widths are adjusted to arrive at ~180° movement
        of "MG90S" servo.
        """

        # init flags
        self.show_info = show_info
        self.is_up = True

        # init Servo
        self.ball_limiter = Servo(
            gpio,  # "GPIO-numbering" (see https://pinout.xyz/pinput)
            initial_value=1,  # initialize in "up" position
            min_pulse_width=1 / 2000,
            max_pulse_width=2 / 1000 * 1.2
        )

        # info
        if show_info:
            # call info function
            self.info()

    def up(self):
        """
        move border up 
        """


        # move up
        self.ball_limiter.max()

        # set flag
        self.is_up = True

        # info
        if self.show_info:
            # call info method
            self.info()

    def down(self):
        """
        move border down
        """


        # move down
        self.ball_limiter.min()

        # set flag
        self.is_up = False

        # info
        if self.show_info:
            # call info method
            self.info()

    def info(self):
        """
        show info on current status
        """
        print(self.is_up)

        # info

    def cleanup(self):
        self.ball_limiter.close()

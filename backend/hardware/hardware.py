import os
from infra.logger import logger
import time
from asgiref.sync import sync_to_async

if int(os.getenv('MOCK', 0)) == 0:
    from gpiozero.pins.pigpio import PiGPIOFactory
    from gpiozero import Device
    from hardware.stepper_motor.plate_mover import PlateMover
    from hardware.solenoid.solenoid import Solenoid
    from hardware.ball_guide.ball_guide import BallGuide
    Device.pin_factory = PiGPIOFactory()
else:
    class PlateMover:
        def __init__(self, stepper_A=0, stepper_B=0, stepper_C=0, stepper_D=0, stepper_direction_inverted=False, halfstep_sleep_time=0.005, limit_1=0, limit_2=0, show_info=0):
            pass

        def move_to_position(self, position_in_cm):
            logger.info(f"MOCKED: move to {position_in_cm}")


    class BallGuide:
        def __init__(self):
            pass

        def up(self):
            logger.info("MOCKED: ball guide up")

        def down(self):
            logger.info("MOCKED: ball guide down")

    class Solenoid:
        def __init__(self, drop_time):
            self.drop_time = drop_time
            pass

        def drop_ball(self):
            logger.info(f"MOCKED: drop ball with drop_time {self.drop_time}")



@sync_to_async
def get_settings_async():
    from main.models import Setting
    logger.debug(f"getting Settings")
    return Setting.objects.all()[0]

plate_mover = None
guide = None
ball_dropper = None
async def initialize():
    logger.debug("Hardware initialization started")
    global plate_mover
    if plate_mover:
        plate_mover.cleanup()

    setting = await get_settings_async()
    # pins in BCM mode/layout
    plate_mover = PlateMover(
        stepper_A=27,
        stepper_B=17,
        stepper_C=22,
        stepper_D=18,
        stepper_direction_inverted=setting.stepper_motor_direction_inverted,
        halfstep_sleep_time=setting.stepper_motor_halfstep_sleep_time,
        limit_1=20,
        limit_2=26,
        show_info=True
    )
    logger.debug("plate_mover initialized")

    global guide
    if not guide:
        guide = BallGuide()
    logger.debug("ball_guide initialized")

    global ball_dropper
    if not ball_dropper:
        ball_dropper = Solenoid(setting.solenoid_drop_time)
    logger.debug("solenoid initialized")

    logger.debug('hardware is prepared - sleeping 5 seconds')
    time.sleep(5)

async def initialize_dropper():
    setting = await get_settings_async()
    global ball_dropper
    if not ball_dropper:
        ball_dropper = Solenoid(setting.solenoid_drop_time)
        logger.debug("solenoid initialized")

async def initialize_stepper():
    setting = await get_settings_async()
    global plate_mover
    plate_mover = PlateMover(
        stepper_A=27,
        stepper_B=17,
        stepper_C=22,
        stepper_D=18,
        stepper_direction_inverted=setting.stepper_motor_direction_inverted,
        halfstep_sleep_time=setting.stepper_motor_halfstep_sleep_time,
        limit_1=20,
        limit_2=26,
        show_info=True
    )
    logger.debug("plate_mover initialized")

async def initialize_guide():
    global guide
    if not guide:
        guide = BallGuide()
        logger.debug("ball_guide initialized")

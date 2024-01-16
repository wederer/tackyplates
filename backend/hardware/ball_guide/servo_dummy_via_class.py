
import ball_guide as TBL
import time

# init
limit = TBL.BallGuide(show_info=True)

# pause
time.sleep(2)

# move up --> nothing should happen
limit.up()
time.sleep(2)

# move dwon
limit.down()
time.sleep(2)

import stepper

s = stepper.Stepper(27, 17, 22, 18, False)

# # move
# s.move_half_steps(100)
# 
# # change speed
# s.set_speed(0.004)
# 
# # move again
# s.move_half_steps(-200)
# 
# # move certain degrees
# s.move_degree(180)
# s.move_degree(-90)
# 
# s.move_degree(360)
s.move_half_steps(-100)
# s.move_degree(-steps)

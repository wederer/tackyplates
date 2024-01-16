from django.db import models
from django.db.models import Model


class CommonInfo(Model):
    created_on = models.DateTimeField(auto_now_add=True)
    modified_on = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Experiment(CommonInfo):
    project_id = models.CharField(max_length=200)
    sample_id = models.CharField(max_length=200)
    started_on = models.DateTimeField(blank=True, null=True)
    comment = models.CharField(max_length=1000, blank=True, null=True)
    start_distance = models.FloatField()
    end_distance = models.FloatField()
    measurement_times = models.JSONField()
    progress = 0

    def __str__(self):
        return 'project: ' + str(self.project_id) + ' sample: ' + str(self.sample_id)


class Measurement(CommonInfo):
    value = models.FloatField()
    experiment = models.ForeignKey(Experiment, related_name='measurements', on_delete=models.CASCADE, null=False, blank=False)

    def __str__(self):
        return str(self.value)


class RawMeasurement(CommonInfo):
    value = models.FloatField()
    measurement = models.ForeignKey(Measurement, related_name='raw_values', on_delete=models.CASCADE, null=False, blank=False)


class Setting(CommonInfo):
    board_width = models.FloatField(help_text="Available width to measure on (in cm) - e.g. 55.0")
    board_length = models.FloatField(default=50.0, help_text="Available length to measure on (in cm) - e.g. 50.0")
    ball_diameter = models.FloatField(default=4.0, help_text="Diameter of ball in (in cm) - e.g. 4.5")
    experiment_gap = models.FloatField(default=1, help_text="Gap between each experiment (in cm) - e.g. 1")
    measurement_gap = models.FloatField(default=0.5, help_text="Gap between each measurement (in cm) - e.g. 0.5")
    stepper_motor_direction_inverted = models.BooleanField(default=False, help_text="Flips homing direction of "
                                                                                    "stepper motor")
    stepper_motor_halfstep_sleep_time = models.FloatField(default=0.005, help_text="Sleep time between each half step => lower = faster,"
                                                                                   "higher = slower. Should be between 0.002 and 0.04.")
    solenoid_drop_time = models.FloatField(default=0.2, help_text="How long the solenoid will be 'open' to drop balls in seconds - e.g. 0.15")

    def __str__(self):
        return 'board_width: ' + str(self.board_width) + ' ball_diameter: ' + str(self.ball_diameter) \
            + ' experiment_gap ' + str(self.measurement_gap) + ' measurement_gap ' + str(self.measurement_gap) \
            + ' stepper_motor_direction_inverted ' + str(self.stepper_motor_direction_inverted)

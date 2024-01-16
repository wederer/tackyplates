"""tackyplates URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from datetime import datetime, timedelta
import uuid
from typing import List

import hardware.hardware
from infra.logger import logger
import threading
from hardware.distance_sensor.distance_sensor_class import DistanceMeasurement

from django.contrib import admin
from django.shortcuts import get_list_or_404, get_object_or_404
from ninja import ModelSchema
from django.urls import include, path
from ninja import NinjaAPI, Schema
import pandas as pd
from tackyplates.calculator import calc_position

from measurement import measurementApi
from main.models import Experiment, Setting, Measurement, RawMeasurement
import asyncio

api = NinjaAPI()

class ExperimentSchema(ModelSchema):
    # explicitly set type of measurement_times, otherwise it will be exported in openapi spec as object
    measurement_times: List[float] = []
    class Config:
        model = Experiment
        model_fields = "__all__"
class Message(Schema):
    message: str
class ExperimentIn(Schema):
    project_id: str
    sample_id: str
    comment: str
    start_distance: float
    end_distance: float
    measurement_times: List[float]

global_experiments_lock = threading.RLock()
global_experiments = []
@api.post("/experiments", response={200: List[ExperimentSchema], 409: Message})
def create_experiment(_request, payload: List[ExperimentIn]):
    global global_experiments
    if len(global_experiments) > 0:
        if get_new_allowed(None) is False:
            return 409, {'message': 'Experiments are running'}
        else:
            global_experiments = []

    last_end = 0
    def buildExperiment(exp: ExperimentIn):
        nonlocal last_end
        exp_width = exp.end_distance - exp.start_distance
        new_exp = exp.dict()
        new_exp['start_distance'] = last_end
        new_exp['end_distance'] = last_end + exp_width
        last_end += exp_width
        return new_exp

    new_experiments = list(map(buildExperiment, payload))
    created_experiments = []
    for exp in new_experiments:
        created_experiments.append(Experiment.objects.create(**exp))

    with global_experiments_lock:
        global_experiments = created_experiments

    return 200, created_experiments

class MeasurementTask:
    position: float  # position where measurement takes place in cm
    time: datetime  # when it should be measured
    experiment: Experiment  # for what experiment this measurement belongs

    def __init__(self, position: float, time: datetime, experiment: Experiment):
        self.position = position
        self.time = time
        self.experiment = experiment

    def __str__(self):
        return "MeasurementTask(position=" + str(self.position) + ", time=" + str(self.time) + ", experiment=" + str(self.experiment) + ")"
    def __repr__(self):
        return self.__str__()


@api.post("/experiment/{experiment_id}", response={200: None, 500: Message})
def start_experiment(_request, experiment_id: int):
    global global_experiments
    exp = None
    exp_index = None
    for i in range(len(global_experiments)):
        if global_experiments[i].id == experiment_id:
            exp = global_experiments[i]
            exp_index = i
            break

    if exp is None:
        return 500, "Experiment not defined"

    logger.debug('found exp on index %s', str(exp_index))

    setting = get_list_or_404(Setting)[0]

    measurement_tasks: List[MeasurementTask] = []
    for index, measurement_time in enumerate(exp.measurement_times):
        task = MeasurementTask(calc_position(exp.start_distance, setting.experiment_gap, setting.measurement_gap, setting.ball_diameter, index), datetime.now() + timedelta(minutes=measurement_time), exp)
        measurement_tasks.append(task)
        logger.debug('Added new measurement task: %s', str(task))

    measurementApi.add_to_queue(measurement_tasks)

    db_exp = Experiment.objects.get(id=experiment_id)
    db_exp.started_on = datetime.now()
    Experiment.save(db_exp)
    db_exp.progress = 0

    global_experiments[exp_index] = db_exp

    return 200

@api.put('/experiments/{experiment_id}', response={200: ExperimentSchema})
def update_experiment(_request, experiment_id: int, payload: ExperimentSchema):
    experiment = get_object_or_404(Experiment, id=experiment_id)
    for attr, value in payload.dict().items():
        setattr(experiment, attr, value)
    experiment.save()
    return 200, experiment

class MeasurementOut(Schema):
    id: int
    created_on: datetime
    value: float
class ExperimentOut(Schema):
    id: int
    created_on: datetime
    started_on: datetime = None
    project_id: str
    sample_id: str
    comment: str
    start_distance: float
    end_distance: float
    measurements: List[MeasurementOut]
    measurement_times: List[float]
@api.get("/experiments", response=List[ExperimentOut])
def get_experiments(_request):
    global global_experiments
    unfinished_exps = filter(lambda exp: getattr(exp, 'progress', 0) != 1.0, global_experiments)
    return Experiment.objects.all().exclude(id__in=[exp.id for exp in unfinished_exps])

class ExpWithProgress(ExperimentOut):
    progress: float = None
@api.get("/progress", response=List[ExpWithProgress])
def get_progress(_request):
    global global_experiments
    return global_experiments

@api.get("/new_allowed", response=bool)
def get_new_allowed(_request):
    global global_experiments
    if any(getattr(exp, 'progress', 0) < 1.0 for exp in global_experiments):
        return False
    return True


@api.get("/running_experiments", response=List[ExperimentOut])
def get_running_experiments(_request):
    return global_experiments

@api.get("/experiments/{experiment_id}", response=ExperimentOut)
def get_experiment(_request, experiment_id: int):
    return get_object_or_404(Experiment, id=experiment_id)


class SettingOut(Schema):
    board_width: float
    ball_diameter: float
    experiment_gap: float
    measurement_gap: float

@api.post("/excel_export/{experiment_ids}", response={200: str, 404: str})
def excel_export(_, experiment_ids: str):
    # split given string by delimiter and filter empty elements
    ids = list(filter(None, experiment_ids.split(",")))

    experiments = Experiment.objects.filter(pk__in=ids)
    if not experiments:
        return 404, "No experiments found."

    settings = get_list_or_404(Setting)[0]

    exps_df = pd.DataFrame.from_records(experiments.values())
    if not exps_df.empty:
        exps_df['created_on'] = pd.to_datetime(exps_df.created_on).dt.tz_localize(None)
        exps_df['modified_on'] = pd.to_datetime(exps_df.modified_on).dt.tz_localize(None)
        exps_df['started_on'] = pd.to_datetime(exps_df.started_on).dt.tz_localize(None)
        exps_df['settings'] = settings

    measurements = Measurement.objects.filter(experiment__in=experiments)
    meas_df = pd.DataFrame.from_records(measurements.values())
    if not meas_df.empty:
        meas_df['created_on'] = pd.to_datetime(meas_df.created_on).dt.tz_localize(None)
        meas_df['modified_on'] = pd.to_datetime(meas_df.modified_on).dt.tz_localize(None)

    raw_df = pd.DataFrame.from_records(RawMeasurement.objects.filter(measurement__in=measurements).values())
    if not raw_df.empty:
        raw_df['created_on'] = pd.to_datetime(raw_df.created_on).dt.tz_localize(None)
        raw_df['modified_on'] = pd.to_datetime(raw_df.modified_on).dt.tz_localize(None)

    filename = f'export/tackyplates_export_experiments_-_{"_".join(ids)}.xlsx'
    if len(ids) > 5:
        # otherwise the filename might be too long
        filename = f'export/tackyplates_export_experiments_-_{uuid.uuid4()}.xlsx'

    with pd.ExcelWriter(filename) as writer:
        if not exps_df.empty:
            exps_df.to_excel(writer, sheet_name="Experiments", index=False)
        if not meas_df.empty:
            meas_df.to_excel(writer, sheet_name="Measurements", index=False)
        if not raw_df.empty:
            raw_df.to_excel(writer, sheet_name="Raw Measurements", index=False)

    return 200, filename


@api.post("/goto")
async def goto(_request, position: int):
    await hardware.hardware.initialize_stepper()
    from hardware.hardware import plate_mover
    plate_mover.move_to_position(position)
    return 200

@api.post("/ball")
async def drop_ball(_request):
    await hardware.hardware.initialize_dropper()
    from hardware.hardware import ball_dropper

    ball_dropper.drop_ball()
    return 200


@api.post("/ballguide")
async def move_ballguide(_request, position: int):
    await hardware.hardware.initialize_guide()
    from hardware.hardware import guide
    if position == 1:
        guide.up()
    else:
        guide.down()

    return 200

@api.post("/measure", response=float)
async def measure(_request):
    setting = get_list_or_404(Setting)[0]
    fixed_measurer = DistanceMeasurement(
        5,
        threshold_distance=0.2,
        interval=0.1,
        board_length=setting.board_length,
        ball_diameter=setting.ball_diameter
    )

    meas_data = await asyncio.wait_for(fixed_measurer.measure(), 10)
    return meas_data.iloc[-10:,1].mean()


@api.get("/settings", response=SettingOut)
def get_settings(_request):
    return get_list_or_404(Setting)[0]

@api.get("/heartbeat", response=str)
def heartbeat(_):
    import pytz
    dt = datetime.now(pytz.timezone('Europe/Berlin'))
    return 200, dt.strftime("%d.%m.%Y %H:%M:%S")

urlpatterns = [
    path('', include('main.urls')),
    path('admin/', admin.site.urls),
    path('api/', api.urls)
]

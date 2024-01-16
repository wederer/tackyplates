#!/bin/bash

source venv/bin/activate
# set environment variable DJANGO_LOG_LEVEL=ERROR if you want to hide debug/info etc logs
GPIOZERO_PIN_FACTORY=pigpio python manage.py runserver 0.0.0.0:8000 --noreload &
cd ../tackyplates-frontend && yarn dev &

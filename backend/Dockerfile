FROM python:3.9-slim as base

EXPOSE 8000

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DEFAULT_TIMEOUT=100
RUN apt-get update

# RUN apt-get install -y python3-rpi.gpio python3-gpiozero

# needed as we use slim version of python image as base
RUN apt-get install -y unzip make gcc

# otherwise running project will cause an error with numpy, see 
RUN apt-get install -y libatlas-base-dev

# update some packages
RUN python3 -m pip install -U pip setuptools --extra-index-url https://www.piwheels.org/simple

# ADD https://github.com/joan2937/pigpio/archive/master.zip ./ # raspberry has no wifi in lab -> copying file
COPY master.zip ./
RUN unzip master.zip

RUN make -C ./pigpio-master && make install -C ./pigpio-master

ENV POETRY_VERSION=1.2.1
ENV POETRY_HOME=/opt/poetry
ENV POETRY_VENV=/opt/poetry-venv
ENV POETRY_CACHE_DIR=/opt/.cache

# Install poetry separated from system interpreter
RUN python3 -m venv $POETRY_VENV && $POETRY_VENV/bin/pip install poetry==${POETRY_VERSION} --extra-index-url https://www.piwheels.org/simple

# Add `poetry` to PATH
ENV PATH="${PATH}:${POETRY_VENV}/bin"

# disable virtualenv in docker, not needed
RUN poetry config virtualenvs.create false

FROM base as install

WORKDIR /app/
# installing rpi.gpio & gpiozero directly not pyproject.toml, because we can't install it on local machine
RUN pip3 install RPi.GPIO --extra-index-url https://www.piwheels.org/simple
RUN pip3 install gpiozero --extra-index-url https://www.piwheels.org/simple
RUN pip3 install pigpio --extra-index-url https://www.piwheels.org/simple 
COPY Makefile ./

COPY poetry.lock pyproject.toml ./
ENV POETRY_NO_INTERACTION=1
RUN poetry source add piwheels https://www.piwheels.org/simple
RUN poetry install

FROM install as dev

COPY manage.py ./
COPY seed.sh ./
COPY seed ./seed/
COPY hardware ./hardware/
COPY infra ./infra/
COPY main ./main/
COPY measurement ./measurement/
COPY tackyplates ./tackyplates/

RUN apt-get install -y python3-rpi.gpio python3-gpiozero # remove this or next line
RUN poetry add gpiozero RPi.GPIO pigpio # remove this or previous line

ENV GPIOZERO_PIN_FACTORY=pigpio
ARG MOCK
ENV MOCK=$MOCK
CMD sleep 1 && pigpiod && sleep 1 && poetry run python manage.py migrate && poetry run python manage.py runserver --noreload 0.0.0.0:8000


FROM python:3.9 as base

EXPOSE 8000

ENV PYTHONUNBUFFERED 1
# installing rpi.gpio & gpiozero directly not pyproject.toml, because we can't install it on local machine
RUN apt-get update && apt-get install -y dialog apt-utils
RUN apt-get install -y python3-rpi.gpio python3-gpiozero
ADD https://github.com/joan2937/pigpio/archive/master.zip ./
RUN unzip master.zip
RUN make -C ./pigpio-master && make install -C ./pigpio-master

# deprecated: replace with curl -sSL https://install.python-poetry.org | python3 -
RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -

# manually add poetry to path, otherwise poetry command will not be found
ENV PATH="/root/.poetry/bin/:${PATH}"

# disable virtualenv in docker, not needed
RUN poetry config virtualenvs.create false

FROM base as install

WORKDIR /app/
RUN pip3 install RPi.GPIO
RUN pip3 install gpiozero
RUN pip3 install pandas
RUN pip3 install pigpio
COPY poetry.lock pyproject.toml ./
COPY Makefile ./
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

ENV GPIOZERO_PIN_FACTORY=pigpio
CMD poetry run python manage.py export_openapi_schema --api tackyplates.urls.api > codegen/openapi.json



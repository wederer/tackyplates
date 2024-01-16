# backend-dir = tackyplates-backend
backend-dir = .
frontend-dir = tackyplates-frontend
local-envs = TACKY_BACKEND_DJANGO_LOG="logs/django.log" TACKY_BACKEND_HTTP_LOG="logs/http.log" TACKY_BACKEND_LOG="logs/backend.log"

runserver: 
	cd $(backend-dir) && poetry run python manage.py runserver

runserver-mocked:
	cd $(backend-dir) && MOCK=1 TACKY_BACKEND_DJANGO_LOG="logs/django.log" TACKY_BACKEND_HTTP_LOG="logs/http.log" TACKY_BACKEND_LOG="logs/backend.log" poetry run python manage.py runserver

runserver-noreload:
	cd $(backend-dir) && poetry run python manage.py runserver --noreload 0.0.0.0:8000

runserver-noreload-mocked:
	cd $(backend-dir) && MOCK=1 poetry run python manage.py runserver --noreload 0.0.0.0:8000

run-prod:
	cd $(backend-dir) && poetry run gunicorn -b 0.0.0.0:8000 tackyplates.wsgi

profile:
	# poetry run python -m cProfile manage.py runserver --noreload > profiled
	cd $(backend-dir) && poetry run python manage.py runprofileserver --use-cprofile --prof-path=my-profile-data

gen-openapi:
	MOCK=1 $(local-envs) poetry run python manage.py export_openapi_schema --api tackyplates.urls.api > openapi.json && \
		cd .. && cd $(frontend-dir) && yarn codegen

admin:
	MOCK=1 $(local-envs) poetry run python manage.py createsuperuser

migrate:
	MOCK=1 $(local-envs) poetry run python manage.py migrate

makemigrations:
	MOCK=1 $(local-envs) poetry run python manage.py makemigrations main

install:
	cd $(backend-dir) && poetry install

check-deploy:
	cd $(backend-dir) && MOCK=1 poetry run python manage.py check --deploy

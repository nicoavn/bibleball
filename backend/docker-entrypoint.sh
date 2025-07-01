#!/bin/bash
set -o errexit

echo "Apply database migrations"
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "Starting server"
python manage.py runserver 0.0.0.0:10000

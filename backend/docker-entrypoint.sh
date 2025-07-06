#!/bin/bash
set -o errexit

python manage.py collectstatic --no-input


echo "Apply database migrations"
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "Starting server"
python manage.py runserver 0.0.0.0:10000

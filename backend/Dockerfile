FROM python:3.12

RUN mkdir /backend
WORKDIR /backend

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt /backend

RUN pip install --upgrade pip
RUN python -m pip install --no-cache-dir -r /backend/requirements.txt

COPY . /backend/

# Expose the Django port
EXPOSE 10000

COPY ./docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

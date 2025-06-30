FROM python:3.12

# RUN apt update && apt install -y postgresql-client

RUN mkdir /backend
WORKDIR /backend

# Set environment variables
# Prevents Python from writing pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1

# Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1

# Upgrade pip
RUN python -m pip install --upgrade pip

COPY requirements.txt /backend

RUN python -m pip install --no-cache-dir -r /backend/requirements.txt

COPY . /backend/

# Expose the Django port
EXPOSE 10000

COPY ./docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

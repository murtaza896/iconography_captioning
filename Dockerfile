FROM python:3.7-slim-stretch

RUN apt-get update && apt-get install -y git python3-dev gcc wget \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app app/

EXPOSE 8080

#RUN wget "https://www.dropbox.com/s/shmd5gxcdodhdqk/export.pkl?dl=1" -O app/export.pkl

RUN wget "https://drive.google.com/file/d/15p6WHScCdt8oQwbXN44P-Yd6SdKdIYUR/view?ts=5efc21cd" -O app/export.pkl 

RUN python app/server.py

CMD ["python", "app/server.py", "serve"]

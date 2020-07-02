FROM python:3.7-slim-stretch

RUN apt-get update && apt-get install -y git python3-dev gcc wget libgtk2.0-dev\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app app/

EXPOSE 8080

#RUN wget "https://www.dropbox.com/s/shmd5gxcdodhdqk/export.pkl?dl=1" -O app/export.pkl

RUN wget --load-cookies /tmp/cookies.txt "https://docs.google.com/uc?export=download&confirm=$(wget --quiet --save-cookies /tmp/cookies.txt --keep-session-cookies --no-check-certificate 'https://docs.google.com/uc?export=download&id=15p6WHScCdt8oQwbXN44P-Yd6SdKdIYUR' -O- | sed -rn 's/.*confirm=([0-9A-Za-z_]+).*/\1\n/p')&id=15p6WHScCdt8oQwbXN44P-Yd6SdKdIYUR" -O export.pkl && rm -rf /tmp/cookies.txt


RUN python app/server.py

CMD ["python", "app/server.py", "serve"]

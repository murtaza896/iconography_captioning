# Iconographic Captioning of Artwork

This is the code for the accompanying site of my Google Summer of Code 2019 
project on Iconographic Artwork Captioning under Red Hen Labs. This is the 
final containerized product that will be deployed (or can be tested locally).
If you want to check out the training and development notebooks and scripts 
please head to the [main repo](https://github.com/swagato-c/gsoc2019) for 
the project. 

To test it locally,
```
$ docker build -t icon-caption . && docker run --rm -it -p 80:8080 icon-caption
```
You can also use `virtualenv` for which activate a `python3` environment on 
the top directory and run the following to see the site live in http://localhost.
```
[icon-caption]$ python app/server.py serve
```

# Running on AWS

As of now the site runs on AWS EC2 t3.small instance with 2vCPUs, 2GiB RAM and 16
GiB storage. It will be be optimized soon with a less resource hungry instance.
It is live [here](http://52.207.224.144/).

# Acknowledgements

The boilerplate is courtsey of [fastai render template](https://github.com/render-examples/fastai-v3);
and special thanks to friends Tanumoy Nandi, Murtaza Sadriwala, Avantika 
Mishra and Rwik Dutta who helped me in debugging the web client and deploy
in AWS.

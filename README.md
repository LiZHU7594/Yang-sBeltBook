# Intro
BeltBook is a [Django](https://www.djangoproject.com/) project. 
It currently contains two components: `main` and `frontend`. 
The `main` app is a Django app using [Django REST framework](https://www.django-rest-framework.org/).
It provides backend models and APIs. 
The `frontend` is a [React](https://reactjs.org/) app using [Semantic UI](https://react.semantic-ui.com/) library. 
The BeltBook django project runs on the BeltBook server. The server compiles the javascripts and stylesheets in 
`frontend` and serves the output as static files to user's browser. 

# Setup
(Steps for both local and server)
1. Install Python (version 3.8 or later)
1. [Recommended] Install [virtualenv](https://virtualenv.pypa.io/en/latest/) and follow their documentation to create
a venv for BeltBook
1. If you installed virtualenv, activate your venv
1. (Assuming you are in the same directory as this readme file) `pip install -r requirements.txt`
1. Install [yarn](https://classic.yarnpkg.com/en/)
1. Goto `frontend` directory (where `package.json` file is), `yarn install`

(Steps for local development)
1. [Recommended] Use [IntelliJ IDEA](https://www.jetbrains.com/idea/) as your IDE. You can get a free license with
your edu email 
1. In `beltbook` directory, `python manage.py makemigrations` and then `python manage.py migrate` to sync your local
development database (SQLite3) with the Django models (`models.py`)
1. `python manage.py runserver` to start local dev server
1. In `frontend` directory, `yarn run dev` to watch your changes in the `frontend` javascript files

(Steps for server setup)
1. Choose an HTTP server. Caddy and Nginx are recommended
1. Search for tutorials on deploy a Django app with your server choice, Ubuntu and gunicorn, follow the steps. 
The Django demo server was using Caddy, and there's a valid Caddyfile example in the `deploy` directory 
1. The BeltBook project currently has a `deploy` directory which contains some scripts that was used with Github and 
Travis CI for continuous deployment (CD). I recommend you to look at those files and search some tutorials to 
implement the CD. With CD, with every commit you make to the code, Travis CI will help you deploy your changes to the 
server. (read the blogpost [here](https://medium.com/@jans.tuomi/getting-a-react-django-app-to-production-on-digitalocean-with-travis-caddy-and-gunicorn-5c397383fcd5))
1. Note: if you are using Caddy, Caddyfile has been updated to a Caddy json file, some online tutorials and blogposts
might be outdated

Step-by-step running this project:

first thing you have to do is reconfig the docker-compose.yml again at the service: mysql
please set up your own volumnes folder, reconfig the username, password as you want

Ensure that all ports in the docker-compose.yml is not used in your PC or laptop at the moment you test the project.

navigate to /Client
run "npm install"
run "docker build -t myapp_client ."

navigate to /Server
run "npm install"
run "docker build -t myapp_server ."

navigate to ./
run "docker swarm init"
run "docker network prune"
run "docker stack deploy -c docker-compose.yml my_app"  // the first time will take a little bit time installing images.

if you want to stop all the services:
run "docker stack rm my_app"
run "docker network prune"

if you want to check logs:
run "docker service ls" to see running services
run "docker service logs service_name"


if you want to test phpMyAdmin:
access: "localhost:9000"

if you want to test server nodejs:
access: "localhost:3000/api/users" --GET--

if you want to test client ReactJs:
access: "localhost:3001"



link folder videos demo only for Ton Duc Thang University (only TDT email accepted):
https://drive.google.com/drive/folders/1qQg4nc-3gplbqTygXmSFazKYU-UP-zQ9?usp=drive_link


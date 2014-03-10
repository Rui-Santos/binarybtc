Bitcoin Binary Options
=====================

Dependencies
---------------------

Dependencies for installing Node.js

>sudo add-apt-repository ppa:chris-lea/node.js

>sudo apt-get update 

Install MongoDB, NPM, Node.js, and Python dependencies if needed

>sudo apt-get install python-software-properties  mongodb-10gen nodejs npm

Install script dependencies with NPM

>npm install 
>fs
> url
> path
> http
> express
> nowjs
> mongoose
> socket.io
> StringDecoder

Connection
---------------------

You can use a linux port proxy to pipe connections on 80 to Express on 8080

>iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080

Express port: 8080

Socket.io port: 3000

Execution
---------------------

>node nope.js
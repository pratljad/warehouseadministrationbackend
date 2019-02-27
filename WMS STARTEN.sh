#!/bin/sh

/usr/bin/gnome-terminal -x sh -c "sudo service mongod start
cd /home/user/BSD_WMS/NodeJS_express_WS && /usr/bin/gnome-terminal -x sh -c 'node app.js|less'
/usr/bin/gnome-terminal -x sh -c 'mongo --host 127.0.0.1:27017|less'"

# First use
# npm install
# npm run-script build
cd /home/user/BSD_WMS/AngularJS && /usr/bin/gnome-terminal -x sh -c "ng serve --host 0.0.0.0|less"

# First use
# npm install
# cd /home/user/BSD_WMS/NodeJS_express_WS && /usr/bin/gnome-terminal -x sh -c "node app.js|less"

ifconfig | grep Bcast > /tmp/ip1
cat /tmp/ip1 | awk '{ print $2 }' > /tmp/ip2
sed -i 's/addr://' /tmp/ip2
IPADDRESS=$(cat /tmp/ip2)

/usr/bin/gnome-terminal -x sh -c "echo 'Mit diesem Link:

               http://$IPADDRESS:4200

kommen Sie auf die Lagerverwaltung.

Vergessen Sie nicht, beim ersten Fenster 
[sudo] password for user:
das passwort einzugeben!'|less"


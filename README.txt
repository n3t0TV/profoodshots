SSL SETUP

1. SSH TO LINODE SERVER

***** SETUP CERTBOT (usually preinstalled in Linode server) *****

sudo apt install snapd
sudo snap install --classic certbot

***** GENERATE CERTIFICATE (root domain only)*****
sudo certbot certonly --standalone
(Input email)
(Input $YOUR_DOMAIN)
Generates to /letsencrypt path

***** EDIT SERVER .env FILE*****
Edit .env file
HOSTNAME=$YOUR_DOMAIN
SSL=true
PORT=3000

****GENERATE CERTIFICATE wildcard (domain and all subdomains)****
sudo certbot certonly --server https://acme-v02.api.letsencrypt.org/directory --manual --preferred-challenges dns -d $YOUR_DOMAIN -d *.$YOUR_DOMAIN



***SERVER***
Main script main.js (Express server)
****GEN IMAGES***

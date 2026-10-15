# Deployment (Docker + Nginx)

isMoreTools is a **statically exported** Next.js app. `npm run build` produces a plain
`out/` directory of HTML, CSS, JS, and assets that any static web server can host. There
is no runtime server, database, environment variable, or persistent volume.

The production setup uses two Nginx instances:

1. An **Nginx container** serves the static `out/` directory.
2. **Nginx on the VPS** is the public reverse proxy and terminates HTTPS.

The container is bound only to `127.0.0.1:8090`, so it is not directly reachable from the
Internet.

These instructions target Ubuntu 22.04/24.04. Before starting, create an `A`/`AAAA` DNS
record for the domain pointing to the VPS and make sure ports 80 and 443 are reachable
from the Internet.

> **Build machine needs Internet access.** The app uses `next/font/google` (Inter), which
> is downloaded and **self-hosted at build time**. The build does not fetch fonts at
> runtime — see [Privacy](../README.md#privacy-model).

## 1. Prepare the server

Connect by SSH and install Docker, Compose, Nginx, and Certbot:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

If UFW is enabled, allow SSH before enabling the firewall, then allow web traffic:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 2. Build locally and upload the static site (recommended for small VPS)

Do **not** run `docker compose up --build` on a VPS with 1 vCPU and 1 GB RAM: the Next.js
production build can exhaust its memory. Build the static site on a development machine
or in CI instead:

```bash
npm ci
npm run build
```

The build creates `out/`. Upload only the static deployment files to the VPS (replace the
SSH user and address):

```bash
ssh <USER>@<SERVER> 'sudo mkdir -p /opt/ismoretools && sudo chown $USER:$USER /opt/ismoretools'
scp -r out nginx.conf docker-compose.static.yml <USER>@<SERVER>:/opt/ismoretools/
```

On the VPS, start the lightweight Nginx-only container:

```bash
cd /opt/ismoretools
sudo docker compose -f docker-compose.static.yml up -d
sudo docker compose -f docker-compose.static.yml ps
curl -I http://127.0.0.1:8090
```

`curl` must return a successful HTTP response. This deployment does not install Node.js,
download npm packages, or build anything on the VPS. The application has no runtime
environment variables, database, or persistent volumes.

## 3. Configure the public Nginx proxy

Replace `example.com` with your domain and create `/etc/nginx/sites-available/ismoretools`.
Use only names that already have a DNS `A`/`AAAA` record pointing to this VPS; for example,
do not include `www.example.com` unless that record exists.

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration and verify it:

```bash
sudo ln -s /etc/nginx/sites-available/ismoretools /etc/nginx/sites-enabled/ismoretools
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 4. Enable HTTPS

After DNS has propagated, request a Let's Encrypt certificate and let Certbot configure
the HTTP-to-HTTPS redirect:

```bash
sudo certbot --nginx -d example.com --redirect
sudo systemctl status certbot.timer
```

To serve `www.example.com` too, first create its DNS record (normally a `CNAME` to
`example.com`, or an `A`/`AAAA` record to the same VPS). Add it to `server_name` and then
request both names with `-d example.com -d www.example.com`. Test renewal once:

```bash
sudo certbot renew --dry-run
```

The site is now available at `https://example.com`.

## Updating a static deployment

Build the new `out/` directory locally, then synchronise it to the VPS and recreate the
static container. `--delete` removes static files no longer present in the new build:

```bash
rsync -av --delete out/ <USER>@<SERVER>:/opt/ismoretools/out/
ssh <USER>@<SERVER> 'cd /opt/ismoretools && sudo docker compose -f docker-compose.static.yml up -d --force-recreate'
```

Useful diagnostics:

```bash
sudo docker compose -f docker-compose.static.yml ps
sudo docker compose -f docker-compose.static.yml logs --tail=100 ismoretools
sudo nginx -t
```

## `502 Bad Gateway` troubleshooting

`502 Bad Gateway` means the host Nginx cannot reach the static-site container. On the VPS,
run:

```bash
cd /opt/ismoretools
sudo docker compose -f docker-compose.static.yml up -d --force-recreate
sudo docker compose -f docker-compose.static.yml ps
sudo docker compose -f docker-compose.static.yml logs --tail=100 ismoretools
curl -I http://127.0.0.1:8090
```

The last command must return an HTTP response. If it does, ensure the host Nginx
configuration contains exactly `proxy_pass http://127.0.0.1:8090;`, then apply it:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Alternative: build the image on the VPS

For larger hosts, the repository also ships a multi-stage `Dockerfile` and
`docker-compose.yml` that build the app and serve it with Nginx in one container
(bound to `127.0.0.1:8080`):

```bash
docker compose up -d --build
```

The static-export configuration lives in `next.config.ts`:

```ts
output: "export"
```

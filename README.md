# isMoreTools

Privacy-friendly browser tools for developers, text, files, and images.

isMoreTools is a static Next.js App Router project. It has no backend, no authentication, no analytics, no database, and no external processing APIs. User text, files, and images are processed locally in the browser with File API, Canvas API, Web Crypto API, URL API, and Clipboard API.

## Tech Stack

- Next.js App Router with static export
- TypeScript strict
- Tailwind CSS
- shadcn-style reusable UI primitives
- lucide-react icons
- sonner toasts
- yaml, jose, react-markdown, remark-gfm, rehype-sanitize, diff, exifr, browser-image-compression, react-easy-crop

## Getting Started

```bash
npm install
npm run dev
npm run build
```

## Deployment on a clean VPS (Docker + Nginx)

The production setup uses two Nginx instances: the Nginx container serves the static export, while Nginx on the VPS is the public reverse proxy and terminates HTTPS. The container is bound only to `127.0.0.1:8080`, so it is not directly reachable from the Internet.

These instructions target Ubuntu 22.04/24.04. Before starting, create an `A`/`AAAA` DNS record for the domain pointing to the VPS and make sure ports 80 and 443 are reachable from the Internet.

### 1. Prepare the server

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

### 2. Upload and start the application

Clone the repository on the VPS (or upload the project files) and run Compose from its directory:

```bash
git clone <REPOSITORY_URL> /opt/ismoretools
cd /opt/ismoretools
sudo docker compose up -d --build
sudo docker compose ps
curl -I http://127.0.0.1:8080
```

`curl` must return a successful HTTP response. The first build happens on the VPS and needs Internet access to download the base images and npm packages. The application has no runtime environment variables, database, or persistent volumes.

### 3. Configure the public Nginx proxy

Replace `example.com` with your domain and create `/etc/nginx/sites-available/ismoretools`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
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

### 4. Enable HTTPS

After DNS has propagated, request a Let's Encrypt certificate and let Certbot configure HTTP-to-HTTPS redirect:

```bash
sudo certbot --nginx -d example.com -d www.example.com --redirect
sudo systemctl status certbot.timer
```

For a domain without `www`, omit `-d www.example.com` and remove it from `server_name`. Test renewal once:

```bash
sudo certbot renew --dry-run
```

The site is now available at `https://example.com`.

### Updating the deployment

From `/opt/ismoretools`, fetch the desired revision and rebuild the immutable image:

```bash
git pull
sudo docker compose up -d --build
sudo docker image prune -f
```

Useful diagnostics:

```bash
sudo docker compose ps
sudo docker compose logs --tail=100 ismoretools
sudo nginx -t
```

### Alternative: build static files outside the VPS

If the VPS should not run the Node.js build, build the static export on a compatible machine:

```bash
npm ci
npm run build
```

Copy `out/`, `nginx.conf`, and `docker-compose.static.yml` to a directory on the VPS, then start the static Nginx container:

```bash
sudo docker compose -f docker-compose.static.yml up -d
```

That compose file listens on `127.0.0.1:8090`; in the Nginx proxy configuration above, change `proxy_pass` to `http://127.0.0.1:8090`.

The project is configured for static export in `next.config.ts`:

```ts
output: "export"
```

## Project Structure

```text
app/
components/
data/
lib/
types/
```

## Implemented Tools

- JSON Formatter
- YAML Formatter
- JSON Validator
- YAML <-> JSON Converter
- Base64 Encode/Decode
- Hash Generator
- JWT Decoder
- JWT Encoder
- UUID Generator
- Timestamp Converter
- URL Parser
- Regex Tester
- Regex Builder
- Markdown Preview
- Rich Text to Markdown
- Diff Checker
- Word/Character Counter
- Clean Extra Spaces
- Change Case
- Transliteration
- Slug Generator
- Remove Duplicate Lines
- Sort Lines
- Extract Emails/URLs
- Lorem Ipsum Generator
- MIME Type Viewer
- File Checksum Generator
- Compare Two Files
- Batch Rename Preview
- Generate Checksum File
- Resize Images
- Compress PNG/JPEG/WebP
- Convert Images
- PNG to SVG Converter
- Crop Image
- Remove Image Metadata
- Generate Favicon Set
- Extract Color Palette
- Placeholder Generator

## Planned / Basic Catalog Entries

- Text Diff
- File Size Converter

## Privacy Model

- User content is not uploaded.
- There are no server actions for processing user data.
- There are no external APIs.
- Files are not stored.
- `localStorage` is used only for theme preference.

## Verification

`npm run build` successfully compiles the app, validates TypeScript, prerenders all routes, and exports the static site.

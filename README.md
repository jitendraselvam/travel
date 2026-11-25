# NYC / 04 — Holiday Editorial, group edition

A responsive seven-day travel guide plus a shared food/places checklist. Runs on one small Node.js process and SQLite; no npm packages, external database, or API key required. The guide and personal settings work as before. The group board requires connectivity. Google Maps, weather and external sites require internet.

## Deploy on Ubuntu VPS (Docker Compose)

1. Install Docker Engine and the Compose plugin using the official instructions for your OS: https://docs.docker.com/engine/install/ubuntu/ . Use a non-root SSH account with sudo access if possible. Update the system, set up SSH keys and secure SSH before exposing services. Commands below assume Docker is accessible via `sudo docker` or your configured Docker user.
2. Upload the ZIP from your computer: `scp NYC-04-Holiday-Editorial-VPS.zip YOUR_USER@YOUR_SERVER_IP:~/`.
3. SSH into your VPS: `ssh YOUR_USER@YOUR_SERVER_IP`. Extract and enter the project:

   ```sh
   unzip NYC-04-Holiday-Editorial-VPS.zip -d ~/nyc-trip
   cd ~/nyc-trip
   sudo docker compose up -d --build
   sudo docker compose ps
   sudo docker compose exec app cat /app/data/invitations.json
   ```

   This creates four independent private invitation codes. Share one with each traveler privately. The same code works on that person's other devices. Each traveler can change their display name. Never publish the codes or database. Use the same project folder for future upgrades.

4. For a private test before DNS is ready, run this command on your own computer (not the VPS):

   ```sh
   ssh -N -L 8080:127.0.0.1:8080 YOUR_USER@YOUR_SERVER_IP
   ```

   Open http://localhost:8080. The application port is bound to the VPS loopback only, so the public IP on port 8080 will not work. This is intentional.

5. To share with the other travelers, configure a real domain/subdomain, for example `nyc.yourdomain.com`. Create a DNS A record pointing to your VPS IPv4 address. If using Cloudflare, start with DNS-only (not proxied). Ensure TCP ports 80 and 443 are allowed by the provider and firewall and not occupied by another service. Do not expose 8080. If using UFW, allow SSH before enabling it; Docker published ports can bypass UFW, so use your provider firewall where available. Enable HTTPS:

   ```sh
   cp .env.example .env
   nano .env                    # replace DOMAIN with your actual hostname
   sudo docker compose --profile https up -d --build
   sudo docker compose logs --tail=50 caddy
   ```

   Caddy obtains and renews certificates automatically if DNS and port access work. Open `https://YOUR_HOSTNAME`, share that URL with the group. The itinerary itself is public and contains no exact home address. The shared board is protected by the four personal codes. Do not add sensitive personal information to the board. If you already run a reverse proxy on ports 80/443, use that instead of the Caddy profile, forwarding to 127.0.0.1:8080 with HTTPS and X-Forwarded-Proto. Never send invitation codes over unencrypted public HTTP.

## How the shared board works
- Group board in the bottom navigation or hero; enter one of the four codes. The code signs in a persistent 30-day session.
- Add any food/drink or place/activity, location and optional note. The board starts with selected guide suggestions, all unrated.
- Click + Group on any guide item to prefill a new suggestion, then submit. Duplicate names within a category are blocked (case-insensitive).
- Each member rates 1–5 stars for each item (1 = not interested, 5 = must do), can change or clear their rating. Group average includes submitted ratings only. The count shows how many of four have voted. Sort by rating, number of votes, newest or alphabetical; filter by food/places, done/to do, search text.
- Anyone signed in can mark an item done or reopen it. Only the person who added a custom item can remove it. Guide picks remain on the list.
- The board refreshes every 10 seconds while visible. It is shared across phones and desktops and stays in SQLite after restart. No offline edits; reconnect before making changes. The personal daily checklist, booking tracker, favorites, food bucket list and private address still live separately on each device. No Google ratings are scraped; Maps links open current listings.

## Backup, update and logs

```sh
sudo docker compose logs --tail=100 app
sudo docker compose stop app
sudo docker compose cp app:/app/data ./backup-$(date +%F-%H%M)
sudo docker compose start app
```

Copy the backup off the VPS securely. It contains the database and private invitations. Stop the app before copying database files, including WAL/SHM if present. Keep Docker volumes when updating (`sudo docker compose --profile https up -d --build`). Do not run `docker compose down -v` unless you want to erase the trip and regenerate invitations. The database is the shared source of truth. Local browser data is not included in the backup.

## Run without Docker

Node.js 22.13+ (or newer supported LTS with node:sqlite) is sufficient. In the project folder run `node server.mjs`; open http://localhost:8080 and retrieve invitations from `data/invitations.json`. Use a reverse proxy and firewall before any public exposure. The standalone process binds all interfaces; do not expose it directly to the internet. For development, choose a separate DATA_DIR if needed.

## Scope

The original Holiday Editorial itinerary, food suggestions, photography, rain alternatives, weather and travel notes remain. Weather and trip dates are the original Nov 25–Dec 1, 2026 plan, not a newly verified forecast. Check hours, service changes, and bookings. The service worker caches public guide assets only, never authenticated API responses. HTTPS is needed for installation/offline caching outside localhost. The app is designed for a small group on a 2-vCPU VPS; it has not been load-tested for public traffic.

## V2.1 editor fix

The standalone HTML preview explicitly runs without backend calls; preview edits use browser storage, or session memory if storage is blocked. Shared voting requires the deployed app. The deployed editor requires an invitation-code session. API errors now show readable messages if a proxy returns non-JSON. The place/address field can be left blank for a new stop; the backend uses the activity name for its map search. Keep the existing Compose project directory, `.env`, and named volumes when upgrading. Back up the database before deploying. Preview edits are not automatically transferred to the VPS.

## V3: Secret NYC and upgrading an existing VPS

The Secret NYC tab contains all 14 optional experiences. Filter by type, save favorites, open maps and official sites, or choose a day and add an optional stop to the editor. Save the draft to publish it to the group. The group vote button opens the existing board filtered to that experience; all 14 are seeded once (the original Holiday Nostalgia Train entry is reused, preserving its votes). Prices, dates and booking details are planning estimates from the previous shortlist, not live verification. The standalone preview does not connect to the group board.

Upgrade from the original VPS edition or V2/V2.1. The original named volume and `.env` must stay in place. On Windows PowerShell, from the directory containing the ZIP:

```powershell
scp .\NYC-04-Holiday-Editorial-V3.1.zip root@YOUR_VPS_IP:~/
ssh root@YOUR_VPS_IP
```

On the VPS (commands assume the original `~/nyc-trip` project and root SSH account):

```sh
cd ~/nyc-trip
umask 077
BACKUP="$HOME/nyc-backups/pre-v3-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP/data"
sudo docker compose --profile https stop app
sudo docker compose cp app:/app/data/. "$BACKUP/data/"
sudo tar -czf "$BACKUP/site-before.tar.gz" -C "$HOME" nyc-trip
sudo ls -la "$BACKUP/data"
echo "$BACKUP"
```

Confirm the backup contains `trip.sqlite` and `invitations.json` before proceeding. If backup fails, stop and restart the old app with `sudo docker compose --profile https up -d`. The backup is private; copy it securely off the VPS if desired. Then, still in `~/nyc-trip`:

```sh
unzip -o ~/NYC-04-Holiday-Editorial-V3.1.zip -d ~/nyc-trip
sudo docker compose --profile https up -d --build
sudo docker compose --profile https ps
curl -fsS http://127.0.0.1:8080/healthz
sudo docker compose logs --tail=50 app
```

The ZIP contains no `.env` or database. It replaces application files only. Do not use `down -v`, delete the volume, or change the project name. Wait until the app is healthy, then open your existing HTTPS URL. If the previous interface is cached, reload again after a few seconds or try a private window. Sign in with your existing invitation code. Test the Secret NYC tab, an existing vote, and an itinerary edit. The original V1 upgrade creates the shared itinerary from the V2 defaults; V2/V2.1 upgrades retain existing shared day rows. Existing personal checkmarks/favorites are browser-local and older itinerary entries are indexed by position; after reordering or upgrading from V1, check that they still correspond to the intended stops. Preview edits do not transfer to the VPS.

If an upgrade fails, inspect `sudo docker compose logs --tail=100 app`. To roll back the application files, use the backup path printed above and extract `site-before.tar.gz` into your home directory, then rebuild from `~/nyc-trip`. Do not restore the database unless needed; the migration is additive. If database restoration is required, stop the app first and preserve a copy of the current database before restoring the pre-upgrade backup. The new app has been tested with temporary V1 and V2.1 databases and Node 22; actual VPS Docker deployment and HTTPS have not been tested here.

## Invitation codes and repository baseline

This source-control baseline removes hardcoded invitation codes and the one-time V3.1 rotation. Existing members, credentials and sessions are retained in the existing persistent database. Fresh databases receive four random codes. Never commit or publish the private invitation file or database. Deploy using the same Compose project directory and named volumes as the current installation. This baseline does not automatically rotate credentials on older deployments.

## V3.2 live editor repair
The itinerary editor now prompts for an invitation code directly if the session has expired, including after an invitation code rotation. It retries the requested edit or save after successful login. The static asset URLs and offline cache are versioned to avoid mixing old and new frontend scripts after upgrades. Existing data and any legacy invitation rotation marker are unchanged. Deploy from the same project directory after backing up the stopped app data. Do not delete the volume. If an old browser tab remains open, close and reopen it or use a hard refresh; an incognito window is a useful independent check.

## Public repository precautions

The default trip dates and sample itinerary in this repository are public. Never commit live itinerary exports, credentials, database snapshots, production environment files or private traveler details. Keep deployment secrets in GitHub Secrets; never print them in workflow logs.

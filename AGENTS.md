# Travel app development instructions

- This is the NYC / 04 Holiday Editorial app, Node.js 22 with SQLite, static browser JavaScript and Docker Compose. Preserve the editorial design and mobile layout.
- Use a branch and pull request for changes. Do not deploy or merge without explicit user approval.
- Never commit real invitation codes, session tokens, databases, .env files, SSH keys or private traveler information. Do not log secrets.
- Preserve member IDs, existing votes, itinerary revisions, user-added places and persistent volumes. Migrations must be safe to repeat. Never use `docker compose down -v` on production.
- Run syntax checks on server.mjs and public JavaScript. Test using a temporary DATA_DIR and a non-production port. Test authentication, itinerary save/reload, shared board and health endpoint for relevant changes.
- Keep production deployment separate from development. Back up SQLite with a consistent snapshot before migrations. Do not restore a database automatically if doing so could discard user edits.
- Report tests actually run, limitations, and migration/rollback considerations in pull requests.

# AGENTS.md — hamilton-kg-hub

Static parent dashboard for Alexander Hamilton Elementary (KG only).
No build step, no framework, no dependencies. Just open `index.html`
or serve the folder statically.

## Locations

- Live: https://hamilton-kg-hub.vercel.app (public, no login wall)
- GitHub: https://github.com/rameezmpe/hamilton-kg-hub (public, branch `main`)
- Vercel project: `hamilton-kg-hub` (team `ramzwebdev-6345s-projects`)

## Files

| File         | Purpose                                                                 |
| ------------ | ----------------------------------------------------------------------- |
| `index.html` | Layout: header, drawer (`#appsCol` quick links), calendar (`#calCol`)   |
| `styles.css` | Theme + desktop 50/50 grid + mobile drawer + custom scrollbars          |
| `app.js`     | Rendering, search, category chips, calendar filter, drawer gestures     |
| `links.js`   | `LINKS` array — the quick-link bookmarks (edit by hand)                 |
| `events.js`  | `EVENTS` array — auto-generated from the school `.ics`, do not hand-edit unless small fix |
| `README.md`  | Parent-facing hosting notes                                             |

`links.js` entry shape: `{ title, url, description, category, audience, icon }`.
`audience` is legacy — quick links always show all; keep it set to
`"kindergarten"` on new entries for consistency.

`events.js` entry shape: `{ date: "YYYY-MM-DD", time: "HH:MM"|"", title, tag }`.
Calendar renders `tag === "kindergarten"` only. Regenerating from a new
`.ics`? Keep the same tagging keywords (see git history of the generator
one-liner) so the KG filter keeps working.

## Conventions the owner chose (don't "fix" these unasked)

- Section is called **Quick Links** (not Apps/Bookmarks).
- No `kindergarten` pills anywhere (removed from cards and calendar rows).
- Header subtitle: "All important links in one place" (no "for parents").
- Footer: only the home-screen tip, no "made for parents" line.
- No placeholders: `links.js` holds real links only. Never re-add `example.com` links.
- Mobile drawer peek shows handle + search (measured at runtime via `--peek`).

## Mobile drawer behavior (`app.js` initDrawer, ≤860px)

- Collapsed = handle + search visible; measured `drawerPeek` height drives `--peek`.
- Tapping search focuses → auto-opens drawer.
- Pull down at list top (`scrollTop <= 0`) drags sheet closed; >70px closes, else snaps back.
- Drag only on the handle/label zone, never on the search input.

## Deploy (Vercel CLI, logged in)

```bash
cd ~/dev/projects/hamilton-kg-hub
npx vercel --prod --yes
# IMPORTANT: the public alias is manually pinned — re-point it every deploy:
npx vercel alias <new-deployment-url> hamilton-kg-hub.vercel.app
```

- Deployment Protection (Vercel Authentication) must stay OFF or parents hit a login wall.
- Dead alias `hamilton-hub-eight.vercel.app` was removed at project-domain level;
  don't re-add it.
- Web Analytics is enabled; keep `<script defer src="/_vercel/insights/script.js">` in `index.html`.

## Git

```bash
git add -A && git commit -m "..." && git push   # origin main, creds via store helper
```

`.gitignore` covers `.vercel/`. Never commit tokens.

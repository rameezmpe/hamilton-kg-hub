# Hamilton KG Hub

One page for Alexander Hamilton kindergarten families: quick links on one
side, kindergarten dates on the other. Phone-friendly, shareable.

- **Live:** https://hamilton-kg-hub.vercel.app
- **Code:** https://github.com/rameezmpe/hamilton-kg-hub

No build step, no framework — plain `index.html` + `styles.css` + `app.js`
plus two data files (`links.js`, `events.js`).

## What's inside

- **Quick Links** — bookmarks for Schoology, Genesis Parent Portal,
  Online Meal Order, Hamilton School Webpage, Hamilton HSA, Glenrock
  Community School. Search + category chips filter them.
- **Kindergarten dates** — school calendar filtered to KG-relevant events
  (closures, half-days, family events). Past dates are hidden automatically.
- **Mobile layout** — calendar on top, links in a swipe-up drawer that rests
  on handle + search. Pull down at the top of the list to close it.

## Add or change a link

Edit `links.js`, copy a block, fill in `title`, `url`, `description`,
`category`, `icon`. Commit and redeploy (below).

## Refresh the calendar

`events.js` was generated from the school's `.ics` file. For a new school
year, re-import the new `.ics` keeping the same `{ date, time, title, tag }`
shape and the kindergarten tagging, then redeploy.

## Deploy

```bash
npx vercel --prod --yes
# then re-point the public address at the new deployment:
npx vercel alias <new-deployment-url> hamilton-kg-hub.vercel.app
```

(The public address is pinned manually, so the alias step is required after
every production deploy.)

## Share with parents

- Send https://hamilton-kg-hub.vercel.app via WhatsApp / parent group
- iPhone: Share → Add to Home Screen
- Android: Menu → Add to Home screen

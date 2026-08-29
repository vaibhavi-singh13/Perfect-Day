<div align="center">

<a href="https://vaibhavi-singh13.github.io/Perfect-Day/">
  <img src="./banner.svg" alt="Dayora — Your Day. Your Focus. Your Sky." width="100%">
</a>

<h3>Your Day. Your Focus. Your Sky.</h3>
<p>A peaceful, sky-themed productivity space for tasks, focus sessions, time tracking, budgeting, and your schedule — all in one calm little app.</p>

<a href="https://vaibhavi-singh13.github.io/Perfect-Day/"><b>🌤 Open Dayora →</b></a>

</div>

---

## About

Dayora is a single-page productivity app built with plain HTML, CSS, and JavaScript — no frameworks, no build step. Everything runs in the browser and your data is saved locally on your device, so there's nothing to install and nothing to sign up for.

Click the banner above (or the link) to open the live app.

## Features

- **☁ Tasks** — Add, edit, prioritize (low / medium / high), complete, filter, and clear tasks for the day.
- **✦ Pomodoro** — Focus / short break / long break timer with a ring progress indicator and a little plant that grows from seed to full bloom over each session.
- **⏱ Activity Timer** — Start and stop a stopwatch for anything you're working on, with a running log and daily / all-time totals.
- **◈ Budget** — Log income and expenses by category, view day or month totals, set a monthly spending goal, and see a spending-by-category breakdown.
- **🗓 Calendar** — Browse a month grid, jump between months, and add timed or all-day events to any date.
- **Day / Night sky theme** — Toggle between a bright day sky and a starry night sky; the choice is remembered.
- **Fully responsive** — Works on desktop and mobile, with a slide-out menu on small screens.

All data (tasks, pomodoro stats, activity log, budget entries, calendar events, theme, last tab) is stored in your browser's `localStorage` — nothing is sent to a server.

## Project Structure

```
.
├── index.html   # Markup for all views (Home, Tasks, Pomodoro, Timer, Budget, Calendar, About)
├── style.css    # Theme tokens, layout, and all component styling
├── script.js    # Navigation, theming, and the logic for every tab
└── banner.svg   # README banner image
```

## Getting Started

No build tools or dependencies required.

1. Download or clone this project.
2. Open `index.html` directly in your browser — or serve it locally:
   ```bash
   npx serve .
   # or
   python3 -m http.server
   ```
3. Start planning your day.

## Customization

- Colors, radii, and fonts are defined as CSS custom properties at the top of `style.css` (`:root`, `[data-theme="light"]`, `[data-theme="dark"]`) — change them there to re-theme the whole app.
- Currency formatting for Budget defaults to `₹` (INR); update the `money()` function in `script.js` to change it.
- Pomodoro session lengths live in the `DURATIONS` object in `script.js`.

## Deploying

Dayora is fully static, so it can be hosted anywhere that serves plain files — GitHub Pages, Netlify, Vercel, Cloudflare Pages, or your own server. Once deployed, update the link behind the banner image above (and the "Open Dayora" link) to point to your live URL.

## License

MIT — feel free to use, modify, and share.

---

<div align="center">
<sub>PLAN LIKE THE WIND. FOCUS LIKE THE SKY. REST LIKE A CLOUD.</sub>
</div>

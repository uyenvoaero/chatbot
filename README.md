Minimal Web Chatbot
===================

A modern, minimal chatbot UI with a light blue and pink theme. Uses plain HTML, CSS, and JavaScript with a fixed bot response.

Quick start
-----------

- Open `index.html` directly in your browser. No build step required.
- Type a message and press Enter or click Send. The bot replies with a fixed response.

Files
-----

- `index.html` – Markup and structure
- `style.css` – Theme and layout
- `script.js` – Basic chat behavior (user messages + fixed bot reply)

Customize
---------

- Change the fixed reply in `script.js` by editing `FIXED_REPLY`.
- Tweak colors in `style.css` under the CSS variables section:
  - `--primary` for light blue
  - `--accent` for soft pink

Notes
-----

- Fully client-side; works offline after first load.
- Accessible basics included: labels, roles, and `aria-live` for new messages.

OpenAI integration (demo-only)
------------------------------

- Edit `script.js` and set `OPENAI_API_KEY` to your key.
- Open `index.html` and chat. The app calls OpenAI directly from the browser.

Security note: Placing API keys in client code is insecure and can be abused. For production, create a small server-side proxy and never expose your key in the browser.


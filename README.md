# OWNED

A fictional campaign for Steam, framing the platform as a private archive — The Holdings — where owned titles are preserved in perpetuity.

Thesis submission, George Brown Polytechnic · Advance Diploma in Graphic Design (Advertising & Art Direction).

## Run locally

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. Camera access requires `localhost` or HTTPS.

## Pages

- `index.html` — Intake (camera scan + name entry)
- `vault.html` — Vault Hub (personalised greeting + navigation)
- `library.html` — The Holdings catalog (5 items, accession-numbered)
- `specimens.html` — Featured exhibits (magazine spread, credential)
- `credential.html` — Owner's card + six-tier ladder
- `doctrine.html` — Manifesto, wall text

State persists in `localStorage` under the `holdings_*` keys.

# Lotus Flow

Bilingual artist portfolio and interactive 3D studio.

## Preview

Serve `dist` with a static HTTP server:

```sh
python3 -m http.server 4178 --bind 127.0.0.1 --directory dist
```

## Deployment

Vercel framework preset: Other. Install with `npm ci`, build with `npm run build`, and publish `deploy` as configured in `vercel.json`. The build keeps unused studies, retired modules and duplicate videos in local `dist` while excluding them from the public output. It minifies scripts and styles, versions module URLs, and preserves every retained media asset byte for byte.

## Checks

```sh
node scripts/check-site.mjs
node scripts/check-i18n.mjs
node scripts/check-audio.mjs
node scripts/check-preview-hooks.mjs
```

Source snapshot: 20261006-lake-surface1.

Media, branding and artist work remain the property of their respective owners. Font licenses are included under `dist/assets/fonts`.

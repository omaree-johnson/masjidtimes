# PWA Icons Setup

## Quick Setup

You need to create PWA icons for the app to be installable. Here are your options:

### Option 1: Use an Online Generator (Easiest)

1. Visit [PWA Asset Generator](https://progressier.com/pwa-icon-generator) or [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Upload a 512x512 PNG image with your mosque/app logo
3. Download the generated icons
4. Place them in the `public/icons/` folder

### Option 2: Use a CLI Tool

Install the PWA Asset Generator:
```bash
npm install -g pwa-asset-generator
```

Then generate icons from a source image:
```bash
pwa-asset-generator source-logo.png public/icons --manifest public/manifest.json
```

### Option 3: Create Placeholder Icons (For Development)

Create a simple SVG or use an online tool to generate basic icons in these sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

Save them as `icon-{size}x{size}.png` in `public/icons/`

## Temporary Placeholder

For now, you can use any PNG image and resize it to the required sizes using:

**ImageMagick** (if installed):
```bash
convert source.png -resize 72x72 public/icons/icon-72x72.png
convert source.png -resize 96x96 public/icons/icon-96x96.png
convert source.png -resize 128x128 public/icons/icon-128x128.png
convert source.png -resize 144x144 public/icons/icon-144x144.png
convert source.png -resize 152x152 public/icons/icon-152x152.png
convert source.png -resize 192x192 public/icons/icon-192x192.png
convert source.png -resize 384x384 public/icons/icon-384x384.png
convert source.png -resize 512x512 public/icons/icon-512x512.png
```

**Online Tools**:
- [Favicon.io](https://favicon.io/)
- [PWA Builder](https://www.pwabuilder.com/imageGenerator)
- [App Icon Generator](https://appicon.co/)

## Next Steps

Once icons are in place, the PWA will be fully installable on:
- ✅ Android (Chrome, Edge, Samsung Internet)
- ✅ iOS/iPadOS (Safari - "Add to Home Screen")
- ✅ Desktop (Chrome, Edge)

The app will work without icons, but won't be installable.

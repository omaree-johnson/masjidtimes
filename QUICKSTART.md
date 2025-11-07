# 🚀 Quick Start Guide

## Getting Started

1. **Install dependencies** (if you haven't already):
```bash
npm install
```

2. **Run the development server**:
```bash
npm run dev
```

3. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## First Time Setup

### Step 1: Upload a Timetable
1. Click "Upload Timetable" from the home page
2. Enter your mosque name (e.g., "Central Mosque")
3. Upload a file:
   - **Image**: JPEG or PNG photo of your timetable
   - **CSV**: Formatted as `Date,Fajr,Dhuhr,Asr,Maghrib,Isha`
   - **PDF**: Will prompt to convert to image (current limitation)

### Step 2: Wait for Processing
- The app will automatically extract prayer times using OCR
- Progress bar shows extraction status
- Should take 10-30 seconds depending on file size

### Step 3: View Dashboard
- Automatically redirected to dashboard
- See today's prayer times
- Live countdown to next prayer
- All data saved offline

## Building for Production

To create an optimized production build:

```bash
npm run build -- --webpack
npm start
```

**Note**: Use `--webpack` flag due to PWA plugin compatibility with Next.js 16.

## PWA Installation

### Mobile (iOS/Android)
1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap the share/menu button
3. Select "Add to Home Screen"
4. App will now work offline!

### Desktop
1. Look for the install icon in the address bar
2. Click to install
3. App opens in standalone window

## Optional: Supabase Setup

For cloud sync across devices:

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key
4. Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
5. Restart dev server

## Project Structure Overview

```
prayer-timetable-scanner/
├── src/
│   ├── app/              # Pages
│   │   ├── page.tsx      # Home/Landing
│   │   ├── upload/       # Upload timetable
│   │   ├── dashboard/    # View prayer times
│   │   └── settings/     # App settings
│   ├── components/       # React components
│   │   ├── Navbar.tsx
│   │   ├── PrayerTimeCard.tsx
│   │   └── ui/          # shadcn/ui components
│   └── lib/             # Utilities
│       ├── ocr.ts       # Tesseract.js OCR
│       ├── parser.ts    # Prayer time parser
│       ├── storage.ts   # localStorage
│       └── supabase.ts  # Database client
├── public/
│   ├── manifest.json    # PWA manifest
│   └── icons/          # App icons
└── package.json

```

## Common Tasks

### Update Mosque Name
Settings → Mosque Information → Save

### Upload New Timetable
Settings → Upload New Timetable

### Clear All Data
Settings → Danger Zone → Clear All Data

### Toggle Theme
Navbar → Theme Icon → Select Light/Dark/System

## Troubleshooting

**OCR not working?**
- Ensure image is clear and well-lit
- Try converting to high-contrast black & white
- Check that text is horizontal

**No prayer times showing?**
- Make sure you've uploaded a timetable
- Check that extraction succeeded
- Try manual CSV upload as alternative

**PWA not installing?**
- Generate PWA icons (see public/icons/README.md)
- Ensure HTTPS in production
- Check browser compatibility

## Next Steps

1. **Generate PWA Icons**: See `public/icons/README.md`
2. **Customize Theme**: Edit Tailwind config
3. **Deploy**: Vercel, Netlify, or your preferred host
4. **Share**: Give link to your community!

## Support

- Report issues on GitHub
- Check documentation in README.md
- Review code comments for details

---

Happy coding! 🕌

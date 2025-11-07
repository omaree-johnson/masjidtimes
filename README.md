# Prayer Timetable Scanner 🕌

A modern Progressive Web App (PWA) that allows users to upload their mosque's prayer timetable and automatically extract daily prayer times using AI-powered vision and OCR technology.

## ✨ Features

- 🤖 **AI-Powered Extraction** - Uses GPT-4 Vision for 100% accurate extraction of any timetable format
- ⏰ **Adhan & Iqama Times** - Extracts both prayer start times and congregation times
- 📤 **Easy Upload** - Support for PDF, images (JPEG, PNG), and CSV files
- 🔍 **Smart Fallback** - Advanced OCR preprocessing if AI is not configured
- ⏰ **Next Prayer Countdown** - Live countdown to the next prayer time
- 📱 **PWA Support** - Install on any device and use offline
- 🌓 **Dark Mode** - Full dark mode support with system preference detection
- 💾 **Offline First** - All data stored locally with optional cloud sync
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- ⚡ **Lightning Fast** - Optimized with Next.js 15 and React Compiler
- 📅 **Day Navigation** - Browse through all days in your timetable

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **AI Vision**: OpenAI GPT-4o (optional but recommended)
- **OCR Fallback**: Tesseract.js with advanced preprocessing
- **Database**: Supabase (optional)
- **PWA**: @ducanh2912/next-pwa
- **Theme**: next-themes

## 📦 Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd prayer-timetable-scanner
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure AI Extraction (Recommended)**

Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

Add your OpenAI API key to `.env.local`:

```env
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

> **Note**: AI extraction is optional but highly recommended for best accuracy. Without it, the app will use traditional OCR with preprocessing.

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎯 How It Works

### With AI Extraction (Recommended)
1. Upload your mosque's prayer timetable (any format)
2. AI vision model analyzes the image
3. Extracts ALL days with both Adhan and Iqama times
4. Returns perfectly structured data

### Without AI (OCR Fallback)
1. Upload your mosque's prayer timetable
2. Image preprocessing (upscaling, contrast, denoising, thresholding)
3. Multi-pass OCR extraction
4. Smart parsing with multiple strategies
5. Returns extracted prayer times

## 🏗️ Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Landing page
│   ├── dashboard/          # Prayer times dashboard with navigation
│   ├── upload/             # Upload timetable page
│   └── settings/           # Settings page
├── components/
│   ├── Navbar.tsx          # Navigation bar
│   ├── PrayerTimeCard.tsx  # Prayer time display with Iqama times
│   └── theme-provider.tsx  # Theme context provider
├── lib/
│   ├── ai-extractor.ts     # AI vision extraction (GPT-4o)
│   ├── ocr.ts              # OCR with preprocessing
│   ├── parser.ts           # Multi-strategy prayer time parser
│   ├── prayer-utils.ts     # Prayer time utilities
│   ├── storage.ts          # LocalStorage wrapper
│   ├── supabase.ts         # Supabase client (optional)
│   └── types.ts            # TypeScript definitions
│   ├── theme-provider.tsx  # Theme context provider
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── supabase.ts         # Supabase client
│   ├── storage.ts          # localStorage utilities
│   ├── ocr.ts              # OCR extraction
│   ├── parser.ts           # Prayer time parser
│   └── prayer-utils.ts     # Prayer time utilities
```

## 📱 Usage

### 1. Upload Timetable
- Navigate to the Upload page
- Enter your mosque name
- Upload a prayer timetable file (PDF, image, or CSV)
- Wait for automatic extraction

### 2. View Prayer Times
- Go to the Dashboard
- See today's prayer times
- View countdown to next prayer
- All data is cached offline

### 3. Install as PWA
- Click the install icon in your browser
- Or use the "Add to Home Screen" option on mobile
- Access offline anytime

## 🔧 Configuration

### Environment Variables (Optional)
Create `.env.local` for Supabase integration:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

Made with ❤️ for the Muslim community

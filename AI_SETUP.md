# AI Extraction Setup Guide

## Why Use AI Extraction?

Traditional OCR can struggle with:
- Different timetable formats
- Poor image quality
- Complex table structures
- Distinguishing between Adhan and Iqama times

**AI Vision (GPT-4o) solves all these issues** by understanding the context and structure of any prayer timetable, regardless of format.

## Setup Steps

### 1. Get an OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in to your OpenAI account
3. Click "Create new secret key"
4. Give it a name (e.g., "Prayer Timetable Scanner")
5. Copy the key (starts with `sk-`)

### 2. Add to Your Project

1. Open the `.env.local` file in the project root
2. Add your API key:

```env
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-actual-key-here
```

3. Save the file
4. Restart your development server:

```bash
npm run dev
```

### 3. That's It!

The app will now automatically use AI extraction when you upload timetables. You'll see:
- ✅ "AI-Powered Extraction Enabled" message on the upload page
- Much higher accuracy
- Both Adhan and Iqama times extracted
- ALL days from the timetable extracted

## Cost

OpenAI GPT-4o vision pricing (as of 2024):
- **Input**: ~$2.50 per 1M tokens
- **Output**: ~$10 per 1M tokens

For a typical prayer timetable image:
- ~1000 input tokens (image)
- ~500 output tokens (JSON response)
- **Cost per extraction**: ~$0.005 (half a cent)

So extracting 100 timetables would cost about $0.50 - very affordable!

## Without AI

If you don't configure an API key:
- The app will use traditional OCR with advanced preprocessing
- Still works well for many timetables
- May require clearer images
- May not distinguish between Adhan and Iqama times

## Security Note

In this demo, the API key is used client-side (`NEXT_PUBLIC_` prefix). For production:
- Move API calls to a backend API route
- Remove the `NEXT_PUBLIC_` prefix
- Add rate limiting
- Monitor usage

Example backend route:

```typescript
// app/api/extract/route.ts
import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY; // No NEXT_PUBLIC_ prefix
  // ... rest of extraction logic
}
```

## Troubleshooting

### "API key not configured" error
- Make sure `.env.local` exists in project root
- Check that the key starts with `sk-`
- Restart the dev server after adding the key

### "Insufficient quota" error
- Check your OpenAI account has credits
- Add a payment method at https://platform.openai.com/account/billing

### Still using OCR instead of AI
- Check browser console for errors
- Verify `.env.local` is in the correct location
- Make sure you restarted the dev server

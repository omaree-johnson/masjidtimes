# Quick Start Guide - Mobile Camera & PWA Features

## 🚀 Testing the New Features

### Development Setup
```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 📸 Testing Camera Capture

1. **Open the Upload Page**
   - Navigate to `/upload`
   - You'll see two tabs: "Upload File" and "Take Photo"

2. **Take a Photo**
   - Click on the "Take Photo" tab
   - Click "Open Camera" button
   - Allow camera permissions when prompted
   - Position your device to capture the entire timetable
   - Click "Capture" when ready
   - Review the image and click "Use Photo" to proceed

3. **Tips for Best Results**
   - Ensure good lighting
   - Hold device steady
   - Capture the entire timetable in frame
   - Avoid glare and shadows

### 📱 Testing Mobile Responsiveness

1. **Browser DevTools**
   ```
   - Open Chrome DevTools (F12)
   - Click device toolbar icon (Ctrl+Shift+M)
   - Test different device sizes:
     * iPhone SE (375px)
     * iPhone 12 Pro (390px)
     * Pixel 5 (393px)
     * iPad (768px)
     * Desktop (1920px)
   ```

2. **Check These Pages**
   - ✅ Home page (`/`)
   - ✅ Upload page (`/upload`)
   - ✅ Dashboard (`/dashboard`)
   - ✅ Settings (`/settings`)

3. **Verify**
   - Navigation menu works (hamburger on mobile)
   - All buttons are easily tappable (44px minimum)
   - Text is readable at all sizes
   - No horizontal scroll
   - Touch targets are adequate

### 🔧 Testing PWA Installation

#### On Desktop (Chrome/Edge)
1. Visit the site (must be HTTPS or localhost)
2. Look for install icon in address bar
3. Click to install
4. App opens in standalone window

#### On Android (Chrome)
1. Visit the site
2. Install banner appears at bottom
3. Tap "Install" 
4. App added to home screen
5. Launch like native app

#### On iOS (Safari)
1. Visit the site
2. Tap Share button
3. Select "Add to Home Screen"
4. Confirm
5. App appears on home screen

### 🧪 Testing Checklist

- [ ] Camera opens on mobile
- [ ] Camera permissions work
- [ ] Can capture and use photo
- [ ] Photo processes through OCR/AI
- [ ] Can switch between front/back camera
- [ ] Mobile menu opens and closes
- [ ] All touch targets are 44px+ height
- [ ] Text scales properly on mobile
- [ ] Install prompt appears (first visit)
- [ ] Can install as PWA
- [ ] Installed app works offline
- [ ] App shortcuts work (Dashboard, Upload)
- [ ] Theme colors match in PWA

### 🔍 Debugging Tips

#### Camera Issues
```javascript
// Check browser console for errors
// Common issues:
- Not HTTPS (use localhost for dev)
- Permissions denied
- Camera in use by another app
```

#### PWA Issues
```javascript
// Check if service worker is registered
navigator.serviceWorker.getRegistrations()
  .then(registrations => console.log(registrations));

// Check if app is installed
window.matchMedia('(display-mode: standalone)').matches
```

#### Clear Cache
```bash
# Chrome DevTools
Application > Storage > Clear site data

# Or programmatically
localStorage.clear();
caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
```

### 📊 Lighthouse Audit

```bash
# Run Lighthouse in Chrome DevTools
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Progressive Web App"
4. Click "Generate report"

# Targets:
- PWA score: 100
- Performance: >90
- Accessibility: >90
```

### 🌐 Browser Compatibility Testing

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Camera | ✅ | ✅ | ✅ | ✅ |
| PWA Install | ✅ | ⚠️* | ❌ | ✅ |
| Offline | ✅ | ✅ | ✅ | ✅ |
| Shortcuts | ✅ | ❌ | ❌ | ✅ |

*Safari uses "Add to Home Screen" instead of install prompt

### 🔒 Required Permissions

- **Camera**: Required for photo capture feature
- **Storage**: Used for offline caching (automatic)
- **Notifications**: Not yet implemented (future feature)

### 📱 Device Testing Priority

1. **High Priority**
   - iPhone 13/14/15 (iOS Safari)
   - Samsung Galaxy S21/22/23 (Chrome)
   - Google Pixel 6/7/8 (Chrome)

2. **Medium Priority**
   - iPad (Safari)
   - Various Android tablets
   - Older iPhones (iOS 14+)

3. **Desktop**
   - Chrome (Windows/Mac)
   - Edge (Windows)
   - Safari (Mac)

### 🐛 Common Issues & Solutions

**Issue**: Camera won't open
- **Solution**: Check HTTPS, verify permissions, try different browser

**Issue**: PWA won't install
- **Solution**: Check manifest.json is served, verify icons exist, check console

**Issue**: Offline not working
- **Solution**: Check service worker registration, rebuild app

**Issue**: Touch targets too small
- **Solution**: Verify `min-h-11` class on buttons, check responsive breakpoints

### 📈 Performance Metrics

Monitor these with Chrome DevTools:
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Total Blocking Time: < 200ms
- Cumulative Layout Shift: < 0.1

### 🎯 Key URLs to Test

```
http://localhost:3000/           # Home
http://localhost:3000/upload     # Upload with camera
http://localhost:3000/dashboard  # Dashboard
http://localhost:3000/settings   # Settings
```

### ✅ Definition of Done

- [x] Camera capture works on mobile
- [x] Mobile navigation is touch-friendly
- [x] All pages are responsive
- [x] PWA can be installed
- [x] App works offline
- [x] Lighthouse PWA score > 90
- [x] Touch targets meet accessibility standards (44px)
- [x] Documentation is complete

---

**Happy Testing! 🎉**

If you encounter issues, check the browser console and refer to `MOBILE_PWA_IMPLEMENTATION.md` for detailed documentation.

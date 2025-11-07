# Timetable Format Guide

## How to Prepare Your Prayer Timetable for Upload

This guide will help you get the best results when uploading your mosque's prayer timetable.

---

## ✅ Recommended: CSV Format

CSV (Comma-Separated Values) is the most reliable format and gives 100% accuracy.

### CSV Template

```csv
Date,Fajr,Dhuhr,Asr,Maghrib,Isha
2025-11-01,05:30,12:45,15:30,17:45,19:15
2025-11-02,05:31,12:45,15:29,17:44,19:14
2025-11-03,05:32,12:45,15:28,17:43,19:13
```

### CSV Format Rules:
1. **First row**: Headers exactly as shown (Date,Fajr,Dhuhr,Asr,Maghrib,Isha)
2. **Date format**: YYYY-MM-DD (e.g., 2025-11-01)
3. **Time format**: 24-hour format HH:MM (e.g., 05:30, 13:45, 19:15)
4. **No spaces** after commas
5. **One row per day**

### How to Create CSV:
1. Open Excel, Google Sheets, or Numbers
2. Create columns: Date, Fajr, Dhuhr, Asr, Maghrib, Isha
3. Fill in your prayer times
4. Save as CSV file

**Download Sample**: `public/sample-timetable.csv`

---

## 📸 Image/Photo Format

If you're photographing a physical timetable or have an existing image:

### Best Practices:
- ✅ Use good lighting (natural light works best)
- ✅ Keep camera steady (no blur)
- ✅ Capture the entire timetable
- ✅ Make sure text is horizontal
- ✅ Use high resolution (at least 1920x1080)
- ✅ Avoid shadows and glare
- ✅ Black text on white background works best

### What the OCR Looks For:
The system tries to detect:
- Prayer names: Fajr, Dhuhr, Asr, Maghrib, Isha (and common variations)
- Times in format: HH:MM AM/PM or HH:MM (24h)
- Dates in format: DD/MM/YYYY or MM/DD/YYYY

### Example Timetable Layouts That Work Well:

**Table Format:**
```
Date       | Fajr  | Dhuhr | Asr   | Maghrib | Isha
01/11/2025 | 5:30  | 12:45 | 3:30  | 5:45    | 7:15
02/11/2025 | 5:31  | 12:45 | 3:29  | 5:44    | 7:14
```

**List Format:**
```
November 1, 2025
Fajr: 5:30 AM
Dhuhr: 12:45 PM
Asr: 3:30 PM
Maghrib: 5:45 PM
Isha: 7:15 PM
```

---

## 📄 PDF Format

**Current Limitation**: PDF files need to be converted to images first.

### How to Convert PDF to Image:
1. Open PDF in Preview (Mac) or Adobe Reader (Windows)
2. Export as JPEG or PNG
3. Upload the exported image

**Alternative**: Take a screenshot of the PDF

---

## 🚨 Common Issues & Solutions

### Issue: "Could not extract prayer times"

**Solutions:**
1. **Try CSV format** - Most reliable, 100% success rate
2. **Improve image quality**:
   - Retake photo with better lighting
   - Use scanner instead of camera
   - Ensure text is clear and readable
3. **Simplify the format**:
   - Remove decorative elements
   - Keep only dates and prayer times
   - Use a plain table layout

### Issue: Times are incorrect

**Solutions:**
1. Verify the image shows times clearly
2. Check that AM/PM is visible for 12-hour times
3. Use 24-hour format in CSV to avoid confusion

### Issue: Only partial data extracted

**Solutions:**
1. The system found some prayers but not all 5
2. Ensure all 5 prayer times are visible in the image
3. Use the sample CSV as a reference

---

## 🎯 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| OCR not detecting times | Use CSV format instead |
| Blurry image | Retake with steady hand or scanner |
| Wrong times detected | Verify times are clearly visible |
| Only 1-2 prayers found | Ensure all 5 prayers are in the image |
| Date format issues | Use YYYY-MM-DD in CSV |

---

## 📥 Download Resources

1. **Sample CSV Template**: `public/sample-timetable.csv`
   - Open in Excel or Google Sheets
   - Replace with your mosque's times
   - Save and upload

2. **CSV Editor Recommendations**:
   - Microsoft Excel
   - Google Sheets
   - LibreOffice Calc
   - Apple Numbers

---

## 💡 Pro Tips

1. **Monthly Timetables**: Upload the entire month at once using CSV
2. **Batch Processing**: Create 3-6 months of times in one CSV
3. **Backup**: Keep your CSV file for future updates
4. **Testing**: Try the sample CSV first to see how it works

---

## ❓ Still Having Issues?

If you're still unable to upload your timetable:

1. **Check the sample CSV** to see the exact format needed
2. **Console logs**: The app logs extracted text for debugging
3. **Try a simpler format**: Start with just one week of times
4. **Contact support**: Open an issue with your timetable image (with times blurred if needed)

---

## 📊 Format Comparison

| Format | Accuracy | Speed | Difficulty |
|--------|----------|-------|------------|
| CSV    | 100%     | Instant | Easy |
| Image  | 70-90%   | 10-30s | Medium |
| PDF    | N/A*     | N/A   | Hard |

*Requires conversion to image first

---

**Recommended Workflow**: 
1. Start with CSV for best results
2. Use images only if you don't have digital data
3. Keep your CSV file as backup

Happy uploading! 🕌

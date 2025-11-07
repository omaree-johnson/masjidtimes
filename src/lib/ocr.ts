import { createWorker } from 'tesseract.js';

export interface OcrProgress {
  status: string;
  progress: number;
}

/**
 * Preprocess image for better OCR results
 */
async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Set canvas size to image size (scale up if small)
      let width = img.width;
      let height = img.height;
      
      // Scale up small images for better OCR
      const minDimension = 1200;
      if (width < minDimension || height < minDimension) {
        const scale = minDimension / Math.min(width, height);
        width *= scale;
        height *= scale;
      }
      
      canvas.width = width;
      canvas.height = height;

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Apply preprocessing techniques
      
      // 1. Convert to grayscale and increase contrast
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Increase contrast using levels adjustment
        const contrast = 1.5; // Increase contrast
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
        const adjusted = factor * (gray - 128) + 128;
        
        const value = Math.max(0, Math.min(255, adjusted));
        
        data[i] = value;     // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
      }

      // 2. Apply adaptive thresholding for better text/background separation
      const threshold = 128;
      for (let i = 0; i < data.length; i += 4) {
        const value = data[i];
        const binaryValue = value > threshold ? 255 : 0;
        
        data[i] = binaryValue;
        data[i + 1] = binaryValue;
        data[i + 2] = binaryValue;
      }

      // 3. Denoise - simple median filter (reduces speckles)
      const denoised = new Uint8ClampedArray(data.length);
      const radius = 1;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const values: number[] = [];
          
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const nx = Math.max(0, Math.min(width - 1, x + dx));
              const ny = Math.max(0, Math.min(height - 1, y + dy));
              const idx = (ny * width + nx) * 4;
              values.push(data[idx]);
            }
          }
          
          values.sort((a, b) => a - b);
          const median = values[Math.floor(values.length / 2)];
          
          const idx = (y * width + x) * 4;
          denoised[idx] = median;
          denoised[idx + 1] = median;
          denoised[idx + 2] = median;
          denoised[idx + 3] = 255;
        }
      }

      // Put processed data back
      for (let i = 0; i < denoised.length; i++) {
        data[i] = denoised[i];
      }

      ctx.putImageData(imageData, 0, 0);

      // Convert canvas to blob URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/png');
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Extract text from an image file using Tesseract OCR with preprocessing
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<string> {
  // Preprocess image for better OCR
  if (onProgress) {
    onProgress({ status: 'Preprocessing image...', progress: 0 });
  }
  
  const processedImageUrl = await preprocessImage(file);
  
  if (onProgress) {
    onProgress({ status: 'Initializing OCR...', progress: 0.1 });
  }

  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (onProgress) {
        onProgress({
          status: m.status,
          progress: 0.1 + (m.progress || 0) * 0.9, // Reserve 10% for preprocessing
        });
      }
    },
  });

  // Configure Tesseract for better table recognition
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz |-/[]().',
    preserve_interword_spaces: '1',
  });

  const { data: { text } } = await worker.recognize(processedImageUrl);
  await worker.terminate();
  
  // Clean up blob URL
  URL.revokeObjectURL(processedImageUrl);

  return text;
}

/**
 * Extract text from PDF (requires conversion to image first)
 * For now, we'll prompt user to convert PDF to image or use a service
 */
export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<string> {
  // This is a simplified version - in production you'd want to:
  // 1. Use pdf.js to convert PDF pages to canvas
  // 2. Extract each page as an image
  // 3. Run OCR on each image
  // 4. Combine results
  
  // For MVP, we'll just throw an error suggesting image upload
  throw new Error('PDF extraction requires conversion to image. Please convert your PDF to an image (JPEG/PNG) and upload again.');
}

/**
 * Multi-pass OCR with different preprocessing techniques
 * Tries multiple approaches and combines results for best accuracy
 */
export async function extractTextWithMultiPass(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<string> {
  if (onProgress) {
    onProgress({ status: 'Starting multi-pass OCR...', progress: 0 });
  }

  // Pass 1: Standard preprocessing
  const text1 = await extractTextFromImage(file, (p) => {
    if (onProgress) {
      onProgress({ 
        status: `Pass 1/2: ${p.status}`, 
        progress: p.progress * 0.5 
      });
    }
  });

  // Pass 2: Original image (no preprocessing) - sometimes works better
  if (onProgress) {
    onProgress({ status: 'Pass 2/2: Processing original image...', progress: 0.5 });
  }

  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (onProgress) {
        onProgress({
          status: `Pass 2/2: ${m.status}`,
          progress: 0.5 + (m.progress || 0) * 0.5,
        });
      }
    },
  });

  await worker.setParameters({
    tessedit_char_whitelist: '0123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz |-/[]().',
    preserve_interword_spaces: '1',
  });

  const { data: { text: text2 } } = await worker.recognize(file);
  await worker.terminate();

  // Return the longer result (usually more complete)
  return text1.length > text2.length ? text1 : text2;
}

/**
 * Smart text extraction - automatically chooses best method
 */
export async function smartExtractText(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<string> {
  const fileType = file.type.toLowerCase();

  if (fileType.includes('pdf')) {
    return extractTextFromPDF(file, onProgress);
  }

  // For images, use multi-pass OCR for best results
  return extractTextWithMultiPass(file, onProgress);
}

/**
 * Extract text from a file (auto-detect type)
 * Alias for smartExtractText for backwards compatibility
 */
export async function extractText(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<string> {
  return smartExtractText(file, onProgress);
}

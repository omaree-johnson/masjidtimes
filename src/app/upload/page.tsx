"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileImage, FileText, Loader2, CheckCircle2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CameraCapture } from "@/components/CameraCapture";
import { extractText, OcrProgress } from "@/lib/ocr";
import { extractWithAI, isAIExtractionAvailable, AIExtractionProgress } from "@/lib/ai-extractor";
import { smartParse } from "@/lib/parser";
import { storage } from "@/lib/storage";
import { toast } from "sonner";
import { DailyPrayerTime, Timetable } from "@/lib/types";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [mosqueName, setMosqueName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [extractedData, setExtractedData] = useState<DailyPrayerTime[] | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [useAI, setUseAI] = useState(isAIExtractionAvailable());
  const [uploadMode, setUploadMode] = useState<"file" | "camera">("file");
  const [showCamera, setShowCamera] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      }
    }
  };

  const handleCameraCapture = (capturedFile: File) => {
    setFile(capturedFile);
    const url = URL.createObjectURL(capturedFile);
    setPreviewUrl(url);
    setShowCamera(false);
    setUploadMode("file"); // Switch back to file view to show preview
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
  };

  const handleUpload = async () => {
    if (!file || !mosqueName.trim()) {
      toast.error("Please select a file and enter mosque name");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setStatus("Initializing...");

    try {
      let parsedData: DailyPrayerTime[] = [];

      // Handle CSV files
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setStatus("Reading CSV file...");
        const csvText = await file.text();
        setProgress(50);
        
        setStatus("Parsing CSV data...");
        parsedData = await smartParse(csvText, file.type);
        setProgress(80);
      } 
      // Try AI extraction first if available and it's an image
      else if (useAI && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
        setStatus("Using AI vision to extract timetable...");
        try {
          parsedData = await extractWithAI(file, (aiProgress: AIExtractionProgress) => {
            setStatus(aiProgress.status);
            setProgress(Math.floor(aiProgress.progress * 90));
          });
          
          // AI extraction successful
          setProgress(100);
        } catch (aiError) {
          console.warn('AI extraction failed, falling back to OCR:', aiError);
          toast.warning('AI extraction failed, trying traditional OCR...');
          
          // Fall back to OCR
          setStatus("Extracting text with OCR...");
          const extractedTextContent = await extractText(file, (ocrProgress: OcrProgress) => {
            setStatus(ocrProgress.status);
            setProgress(Math.floor(ocrProgress.progress * 70));
          });

          setExtractedText(extractedTextContent);
          console.log("Extracted text:", extractedTextContent);

          setStatus("Parsing prayer times...");
          setProgress(80);
          parsedData = await smartParse(extractedTextContent, file.type);
        }
      } 
      // Use OCR for images when AI is not available
      else {
        setStatus("Extracting text from image...");
        const extractedTextContent = await extractText(file, (ocrProgress: OcrProgress) => {
          setStatus(ocrProgress.status);
          setProgress(Math.floor(ocrProgress.progress * 70));
        });

        setExtractedText(extractedTextContent);
        console.log("Extracted text:", extractedTextContent);

        setStatus("Parsing prayer times...");
        setProgress(80);
        parsedData = await smartParse(extractedTextContent, file.type);
      }
      
      if (parsedData.length === 0) {
        // Show debug info automatically when parsing fails
        setShowDebugInfo(true);
        setProgress(0);
        setStatus("Could not extract prayer times");
        toast.error(
          "Could not extract prayer times automatically. Please review the extracted text below and try a clearer image or CSV format."
        );
        setIsProcessing(false);
        return; // Don't throw, just return
      }

      setExtractedData(parsedData);
      setProgress(100);
      setStatus("Extraction complete!");

      // Save to localStorage (with multiple mosques support)
      const timetable: Timetable = {
        id: Date.now().toString(),
        userId: 'local', // Will be updated when auth is added
        mosqueName: mosqueName.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        times: parsedData,
      };

      storage.saveMosque(timetable); // Use new saveMosque method
      
      toast.success(`Successfully extracted ${parsedData.length} days of prayer times for ${mosqueName.trim()}!`);
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to process file");
      setStatus("Error occurred");
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload Timetable</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your mosque&apos;s prayer timetable in PDF, image, or CSV format
        </p>
      </div>

      <div className="grid gap-6">
        {/* AI Extraction Info */}
        {isAIExtractionAvailable() && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>AI-Powered Extraction Enabled</AlertTitle>
            <AlertDescription>
              Using Google Gemini vision AI for maximum accuracy. Extracts both Adhan and Iqama times from any timetable format.
            </AlertDescription>
          </Alert>
        )}

        {!isAIExtractionAvailable() && (
          <Alert>
            <AlertTitle>Want Better Accuracy?</AlertTitle>
            <AlertDescription>
              Enable AI-powered extraction by adding your Gemini API key to <code className="text-xs">.env.local</code>. 
              AI extraction works with any timetable format and extracts both Adhan and Iqama times automatically.
            </AlertDescription>
          </Alert>
        )}

        {/* Mosque Name Input */}
        <Card>
          <CardHeader>
            <CardTitle>Mosque Information</CardTitle>
            <CardDescription>Enter the name of your mosque</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="mosque-name">Mosque Name</Label>
              <Input
                id="mosque-name"
                placeholder="e.g., Central Mosque"
                value={mosqueName}
                onChange={(e) => setMosqueName(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload or Camera */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Timetable</CardTitle>
            <CardDescription>
              Take a photo or upload an existing file. Supported formats: JPEG, PNG, PDF, CSV.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={uploadMode} onValueChange={(value) => setUploadMode(value as "file" | "camera")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload File</span>
                  <span className="sm:hidden">Upload</span>
                </TabsTrigger>
                <TabsTrigger value="camera" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span className="hidden sm:inline">Take Photo</span>
                  <span className="sm:hidden">Camera</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="file" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-48 rounded"
                          />
                        ) : (
                          <>
                            <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground text-center px-4">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              JPEG, PNG, PDF, or CSV
                            </p>
                          </>
                        )}
                      </div>
                      <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf,.csv"
                        onChange={handleFileChange}
                        disabled={isProcessing}
                      />
                    </label>
                  </div>

                  {file && (
                    <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                      {file.type.startsWith('image/') ? (
                        <FileImage className="h-5 w-5" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                      <span className="text-sm flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="camera" className="mt-4">
                {showCamera ? (
                  <CameraCapture
                    onCapture={handleCameraCapture}
                    onCancel={handleCameraCancel}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg">
                      <Camera className="w-12 h-12 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground font-semibold">
                        Ready to take a photo
                      </p>
                      <p className="text-xs text-muted-foreground mb-4 text-center px-4">
                        Position your camera to capture the entire timetable
                      </p>
                      <Button onClick={() => setShowCamera(true)} disabled={isProcessing}>
                        <Camera className="mr-2 h-4 w-4" />
                        Open Camera
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Processing Status */}
        {isProcessing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{status}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {extractedData && !isProcessing && (
          <Card className="border-green-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                Success!
              </CardTitle>
              <CardDescription>
                Extracted {extractedData.length} days of prayer times
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Debug Info - Show extracted text when parsing fails */}
        {showDebugInfo && extractedText && (
          <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>🔍 Extracted Text (Debug)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDebugInfo(false)}
                >
                  Hide
                </Button>
              </CardTitle>
              <CardDescription>
                This is what the OCR detected. If it looks correct but parsing failed, please report this issue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto max-h-64 overflow-y-auto">
                {extractedText}
              </pre>
              <div className="mt-4 text-sm">
                <p className="font-medium mb-2">What to do:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Check if the text looks readable</li>
                  <li>Try taking a clearer photo with better lighting</li>
                  <li>Make sure the entire timetable is visible</li>
                  <li>Alternatively, use CSV format for 100% accuracy</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips for Better Results */}
        {!isProcessing && !extractedData && (
          <Card className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium">💡 Tips for Best Results</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-medium">For Camera/Images:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2 text-xs sm:text-sm">
                <li>Ensure good lighting and avoid shadows</li>
                <li>Hold device steady to avoid blur</li>
                <li>Capture entire timetable in frame</li>
                <li>Keep text horizontal and readable</li>
                <li>Avoid glare on glossy surfaces</li>
              </ul>
              <p className="font-medium mt-3">For CSV Files:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2 text-xs sm:text-sm">
                <li>Format: <code className="bg-muted px-1 rounded text-xs">Date,Fajr,Dhuhr,Asr,Maghrib,Isha</code></li>
                <li>Times in 24-hour format (e.g., 05:30, 13:45)</li>
                <li>See sample: <code className="bg-muted px-1 rounded text-xs">public/sample-timetable.csv</code></li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleUpload}
            disabled={!file || !mosqueName.trim() || isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Extract Prayer Times
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

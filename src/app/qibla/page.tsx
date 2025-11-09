import QiblaCompass from '@/components/QiblaCompass';

export default function QiblaPage() {
  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Qibla Finder</h1>
        <p className="text-muted-foreground">
          Find the direction to the Kaaba in Makkah for your prayers
        </p>
      </div>

      <QiblaCompass />
    </div>
  );
}

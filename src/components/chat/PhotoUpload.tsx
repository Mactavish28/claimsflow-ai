'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle } from 'lucide-react';
import { ClaimPhoto } from '@/types/claim';
import { v4 as uuidv4 } from 'uuid';

interface PhotoUploadProps {
  onPhotosUploaded: (photos: ClaimPhoto[]) => void;
  onSkip: () => void;
}

export function PhotoUpload({ onPhotosUploaded, onSkip }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<ClaimPhoto[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setAnalyzing(true);

    const newPhotos: ClaimPhoto[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);

      // Simulate AI analysis
      await new Promise((resolve) => setTimeout(resolve, 800));

      const categories: ClaimPhoto['category'][] = [
        'front',
        'rear',
        'left',
        'right',
        'damage',
      ];
      const analyses = [
        'Visible damage detected on front bumper area',
        'Minor scratches identified on panel',
        'Dent detected approximately 6 inches in diameter',
        'Paint damage and possible structural impact',
        'Clear image quality - suitable for assessment',
      ];

      newPhotos.push({
        id: uuidv4(),
        url,
        category: categories[Math.floor(Math.random() * categories.length)],
        timestamp: new Date(),
        aiAnalysis: analyses[Math.floor(Math.random() * analyses.length)],
      });
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
    setAnalyzing(false);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = () => {
    onPhotosUploaded(photos);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-blue-600" />
        <h3 className="font-medium text-gray-900">Upload Damage Photos</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Please upload photos of the damage from multiple angles. Our AI will analyze
        them in real-time.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-3 mb-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            <img
              src={photo.url}
              alt="Damage photo"
              className="w-full h-24 object-cover rounded-lg"
            />
            <button
              onClick={() => removePhoto(photo.id)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
            {photo.aiAnalysis && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg truncate">
                {photo.aiAnalysis}
              </div>
            )}
          </div>
        ))}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={analyzing}
          className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          {analyzing ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          ) : (
            <>
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500">Add Photo</span>
            </>
          )}
        </button>
      </div>

      {photos.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg mb-4">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700">
            {photos.length} photo(s) analyzed successfully
          </span>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onSkip}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Skip for Now
        </button>
        <button
          onClick={handleSubmit}
          disabled={photos.length === 0}
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

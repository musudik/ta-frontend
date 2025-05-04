import React, { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  initialValue?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, initialValue }) => {
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [dataURL, setDataURL] = useState<string>(initialValue || '');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);

  // Load initial value if provided, but only once
  useEffect(() => {
    if (initialValue && signatureRef.current && isInitialLoad) {
      const img = new Image();
      img.onload = () => {
        if (signatureRef.current) {
          const ctx = signatureRef.current.getCanvas().getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            setIsSigned(true);
            setIsSaved(true);
            setDataURL(initialValue);
            setIsInitialLoad(false);
          }
        }
      };
      img.src = initialValue;
    }
  }, [initialValue, isInitialLoad]);

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsSigned(false);
      setIsSaved(false);
      setDataURL('');
      onSave('');
    }
  };

  const handleSave = () => {
    if (signatureRef.current && !isSaved) {
      if (signatureRef.current.isEmpty()) {
        alert('Bitte unterschreiben Sie / Please sign before saving');
        return;
      }
      
      const newDataURL = signatureRef.current.toDataURL('image/png');
      // Only update if the data URL has changed
      if (newDataURL !== dataURL) {
        setDataURL(newDataURL);
        setIsSaved(true);
        onSave(newDataURL);
      }
    }
  };

  const handleBegin = () => {
    setIsDrawing(true);
    setIsSaved(false);
    setIsInitialLoad(false); // Ensure we don't reload initial value after user starts signing
  };

  const handleEnd = () => {
    setIsDrawing(false);
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      setIsSigned(true);
    }
  };

  return (
    <div className="signature-pad-container">
      <div className="border rounded-md p-1 mb-2 bg-white">
        <SignatureCanvas
          ref={signatureRef}
          penColor="black"
          canvasProps={{
            className: "signature-canvas w-full h-44",
            style: { 
              width: '100%', 
              height: '11rem',
              backgroundColor: 'white'
            }
          }}
          onBegin={handleBegin}
          onEnd={handleEnd}
        />
      </div>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Löschen / Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          className={`flex-1 px-4 py-2 border rounded-md text-sm font-medium ${
            isSigned && !isSaved
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 border-transparent' 
              : isSaved
              ? 'bg-green-600 text-white border-transparent cursor-not-allowed'
              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          disabled={!isSigned || isSaved || isDrawing}
        >
          {isSaved ? 'Unterschrift gespeichert / Signature saved' : 'Unterschrift speichern / Save Signature'}
        </button>
      </div>
      {isSaved && (
        <div className="mt-2 text-sm text-green-600">
          ✓ Sie können jetzt fortfahren / You can now proceed
        </div>
      )}
    </div>
  );
}; 
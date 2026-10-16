import React, { useState } from 'react';
import { Camera, X, UploadCloud, Trash2 } from 'lucide-react';

export interface PhotoUploadCameraFieldProps {
  label: string;
  value?: string;
  onChange: (dataUrl: string) => void;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
}

export const PhotoUploadCameraField: React.FC<PhotoUploadCameraFieldProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  helpText
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Webcam stream error, falling back to native capture:', err);
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 400;
      canvas.height = videoRef.current.videoHeight || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onChange(dataUrl);
      }
    }
    stopCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEv) => {
        if (typeof loadEv.target?.result === 'string') {
          onChange(loadEv.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="font-bold text-slate-800 block">
        {label} {required && !disabled && '*'}
      </label>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Live Camera Viewfinder Overlay */}
      {isCameraActive && (
        <div className="p-4 bg-slate-900 rounded-2xl border-2 border-slate-900 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-white text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-orange-400 animate-pulse" />
              <span>Camera Viewfinder — Position Child's Face</span>
            </span>
            <button
              type="button"
              onClick={stopCamera}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-black aspect-square max-w-[260px] mx-auto border-2 border-orange-500">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={stopCamera}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-5 py-2 text-xs font-extrabold gap-1.5 shadow-sm"
            >
              <Camera className="w-4 h-4" />
              <span>Snap Photo</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload & Preview UI */}
      {!isCameraActive && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl">
          {/* Photo Preview Thumbnail */}
          <div className="relative shrink-0">
            {value ? (
              <img
                src={value}
                alt="Child Wallet Card Preview"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-900 shadow-neo-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                <Camera className="w-6 h-6 text-slate-300 mb-1" />
                <span className="text-[10px] font-bold">No Photo</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              Photo will appear on the printed Ontario CCEYA emergency wallet card carried in the provider's bag for park outings and emergency hospital trips.
            </p>

            {!disabled && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="neo-btn bg-white hover:bg-slate-100 text-slate-900 px-3 py-1.5 text-xs font-bold gap-1.5 border-2 border-slate-900 shadow-neo-sm"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-orange-500" />
                  <span>Upload Image</span>
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-3 py-1.5 text-xs font-bold gap-1.5 shadow-neo-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                  <span>Use Camera</span>
                </button>

                {value && (
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {helpText && (
              <p className="text-[10px] text-slate-400">{helpText}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

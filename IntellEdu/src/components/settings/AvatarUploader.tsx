/**
 * AvatarUploader
 *
 * Drag-and-drop / click-to-browse profile photo uploader.
 * - Client-side crop/resize to 512×512 via Canvas API (no external library).
 * - Converts to JPEG at quality 0.85 (keeps size tiny).
 * - Sends base64 to POST /api/v1/users/me/avatar.
 * - Shows upload progress via spinner.
 * - "Remove Custom Photo" resets to preset avatar.
 */
import React, { useCallback, useRef, useState } from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/useAuth';

const MAX_OUTPUT_PX = 512; // final canvas size
const JPEG_QUALITY = 0.85;

function centerCropAndResize(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = MAX_OUTPUT_PX;
  canvas.height = MAX_OUTPUT_PX;
  const ctx = canvas.getContext('2d')!;

  const size = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - size) / 2;
  const sy = (img.naturalHeight - size) / 2;

  ctx.drawImage(img, sx, sy, size, size, 0, 0, MAX_OUTPUT_PX, MAX_OUTPUT_PX);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

interface AvatarUploaderProps {
  currentAvatar?: string | null;
  userName?: string;
  onSuccess?: (newAvatarUrl: string) => void;
  onRemove?: () => void;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatar,
  userName = 'User',
  onSuccess,
  onRemove,
}) => {
  const { updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [croppedBase64, setCroppedBase64] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const resetState = () => {
    setPreview(null);
    setCroppedBase64(null);
    setFeedback(null);
  };

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please select an image file (JPG, PNG, or WebP).' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'File is too large. Please choose an image under 10 MB.' });
      return;
    }

    setFeedback(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const cropped = centerCropAndResize(img);
        setPreview(cropped);
        // Strip the "data:image/jpeg;base64," prefix → just the base64 payload
        setCroppedBase64(cropped.split(',')[1]);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = ''; // reset so same file can be re-selected
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleUpload = async () => {
    if (!croppedBase64) return;
    setUploading(true);
    setFeedback(null);
    try {
      const result = await authApi.uploadAvatar(croppedBase64, 'image/jpeg');
      updateUser({ avatar: result.avatarUrl });
      setFeedback({ type: 'success', message: '✅ Profile photo updated!' });
      setPreview(null);
      setCroppedBase64(null);
      onSuccess?.(result.avatarUrl);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Upload failed. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    setFeedback(null);
    try {
      await authApi.removeAvatar();
      updateUser({ avatar: undefined });
      setFeedback({ type: 'success', message: '✅ Custom photo removed. Preset avatar is active.' });
      resetState();
      onRemove?.();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Could not remove photo.',
      });
    } finally {
      setRemoving(false);
    }
  };

  const displayAvatar = preview ?? currentAvatar;

  return (
    <div className="space-y-4">
      {/* Preview Circle + Drop Zone Row */}
      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Live Avatar Preview */}
        <div className="relative shrink-0">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={userName}
              className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-xl ring-2 ring-indigo-300"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-linear-to-br from-indigo-200 to-violet-200 flex items-center justify-center border-4 border-white shadow-xl ring-2 ring-indigo-200">
              <span className="text-2xl font-extrabold text-indigo-600 select-none">
                {userName.slice(0, 1).toUpperCase()}
              </span>
            </div>
          )}
          {/* Camera badge overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-indigo-600 border-2 border-white text-white flex items-center justify-center shadow-md hover:bg-indigo-700 transition"
            title="Change photo"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 cursor-pointer select-none rounded-2xl border-2 border-dashed p-5 transition text-center ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
          }`}
        >
          <Upload className="mx-auto h-6 w-6 text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-700">
            Drag &amp; drop your photo here, or{' '}
            <span className="text-indigo-600 underline">click to browse</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-400">JPG, PNG, WebP · max 10 MB · auto-cropped to 512×512</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)} className="ml-auto font-bold opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Action Buttons */}
      {preview && croppedBase64 && (
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => void handleUpload()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {uploading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Save Photo
              </>
            )}
          </button>
          <button
            type="button"
            onClick={resetState}
            disabled={uploading}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Remove custom photo */}
      {!preview && currentAvatar && !currentAvatar.startsWith('https://images.unsplash.com') && (
        <div>
          <button
            type="button"
            onClick={() => void handleRemove()}
            disabled={removing}
            className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 hover:text-rose-800 transition disabled:opacity-40"
          >
            {removing ? (
              <span className="h-3.5 w-3.5 rounded-full border border-rose-400 border-t-rose-700 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Remove custom photo
          </button>
        </div>
      )}
    </div>
  );
};

export default AvatarUploader;

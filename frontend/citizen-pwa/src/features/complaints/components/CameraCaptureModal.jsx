import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Camera, SwitchCamera, RotateCcw, Check, AlertCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * In-app interactive camera capture modal.
 * Uses navigator.mediaDevices.getUserMedia to stream the device camera (or webcam)
 * directly into a live viewfinder so citizens can snap real photos with one tap,
 * rather than being kicked out to a desktop file picker.
 */
export function CameraCaptureModal({ open, onClose, onCapture, onFallbackToFile }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [hasCamera, setHasCamera] = useState(true);
  const [permissionError, setPermissionError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0);
  const [facingMode, setFacingMode] = useState('environment'); // default to rear camera on mobile
  const [previewBlob, setPreviewBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isShutterActive, setIsShutterActive] = useState(false);

  // Stop active video tracks cleanly
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Request media stream from browser
  const startCamera = useCallback(async () => {
    stopStream();
    setPermissionError(null);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setHasCamera(false);
      setPermissionError('unsupported');
      return;
    }

    try {
      // Find available video inputs
      let videoInputs = [];
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        videoInputs = allDevices.filter((d) => d.kind === 'videoinput');
        setDevices(videoInputs);
      } catch {
        // device enumeration can fail if permission not yet granted; will recheck later
      }

      const specificDeviceId = videoInputs[selectedDeviceIndex]?.deviceId;
      const constraints = {
        video: specificDeviceId
          ? { deviceId: { exact: specificDeviceId } }
          : {
              facingMode: { ideal: facingMode },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
        audio: false,
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Fallback to basic video constraint if ideal resolution/facingMode is rejected
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          const playPromise = videoRef.current.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
          }
        } catch {
          // Play may throw if not implemented in jsdom / test env
        }
      }

      // Re-enumerate devices now that camera permission has been granted
      try {
        const updatedDevices = await navigator.mediaDevices.enumerateDevices();
        const updatedVideoInputs = updatedDevices.filter((d) => d.kind === 'videoinput');
        if (updatedVideoInputs.length > 0) {
          setDevices(updatedVideoInputs);
        }
      } catch {
        // benign
      }
    } catch (err) {
      setPermissionError(err.name || 'error');
    }
  }, [facingMode, selectedDeviceIndex, stopStream]);

  // Manage open lifecycle & escape key
  useEffect(() => {
    if (!open) {
      stopStream();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setPreviewBlob(null);
      }
      return undefined;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    startCamera();

    return () => {
      stopStream();
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, startCamera, stopStream, previewUrl]);

  // Clean up preview object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Cycle through cameras if multiple exist, or toggle facingMode
  const handleSwitchCamera = () => {
    if (devices.length > 1) {
      setSelectedDeviceIndex((prev) => (prev + 1) % devices.length);
    } else {
      setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    }
  };

  // Capture frame from video to canvas -> Blob
  const handleSnap = () => {
    const video = videoRef.current;
    if (!video) return;

    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 150);

    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setPreviewBlob(blob);
        setPreviewUrl(url);
      },
      'image/jpeg',
      0.9,
    );
  };

  // Reset still photo and return to live stream
  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewBlob(null);
    startCamera();
  };

  // Confirm photo, package as File, and pass to caller
  const handleConfirm = () => {
    if (!previewBlob) return;
    const filename = `complaint_photo_${Date.now()}.jpg`;
    const file = new File([previewBlob], filename, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    onCapture(file);
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('complaint.form.cameraModalTitle', 'Capture Photo')}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4"
    >
      <div className="relative flex h-full max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3 z-10">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold tracking-tight text-white">
              {t('complaint.form.cameraModalTitle', 'Capture Photo')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {!previewUrl && (devices.length > 1 || !permissionError) && (
              <button
                type="button"
                onClick={handleSwitchCamera}
                title={t('complaint.form.cameraSwitch', 'Switch Camera')}
                aria-label={t('complaint.form.cameraSwitch', 'Switch Camera')}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <SwitchCamera className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              title={t('common.close', 'Close')}
              aria-label={t('common.close', 'Close')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder Area */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
          {/* Shutter flash animation */}
          {isShutterActive && (
            <div className="absolute inset-0 z-30 bg-white/80 transition-opacity duration-150 animate-out fade-out" />
          )}

          {previewUrl ? (
            /* Still photo preview */
            <div className="relative flex h-full w-full items-center justify-center bg-black">
              <img
                src={previewUrl}
                alt="Captured photo preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : permissionError ? (
            /* Permission error fallback */
            <div className="flex max-w-md flex-col items-center gap-3 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-white">
                {t('complaint.form.cameraAccessError', 'Unable to access camera')}
              </p>
              <p className="text-xs text-slate-300">
                {t(
                  'complaint.form.cameraPermissionHint',
                  'Please allow camera permissions in your browser, or select an image from your files directly.',
                )}
              </p>
              <div className="mt-2 flex flex-col gap-2 w-full sm:flex-row sm:justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={startCamera}
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  {t('complaint.form.gpsRetry', 'Retry')}
                </Button>
                {onFallbackToFile && (
                  <Button
                    type="button"
                    onClick={() => {
                      onClose();
                      onFallbackToFile();
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Upload className="mr-1.5 h-4 w-4" />
                    {t('complaint.form.chooseFileInstead', 'Upload from files instead')}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Live camera video stream */
            <div className="relative flex h-full w-full items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover sm:object-contain"
              />

              {/* Viewfinder Target Framing Brackets */}
              <div className="pointer-events-none absolute inset-6 sm:inset-10 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="h-7 w-7 border-l-2 border-t-2 border-white/70 rounded-tl-sm" />
                  <div className="h-7 w-7 border-r-2 border-t-2 border-white/70 rounded-tr-sm" />
                </div>
                <div className="flex justify-center">
                  <div className="h-2 w-2 rounded-full bg-white/40 ring-4 ring-white/10" />
                </div>
                <div className="flex justify-between">
                  <div className="h-7 w-7 border-l-2 border-b-2 border-white/70 rounded-bl-sm" />
                  <div className="h-7 w-7 border-r-2 border-b-2 border-white/70 rounded-br-sm" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between border-t border-white/10 bg-black/60 px-6 py-4 z-10">
          {previewUrl ? (
            /* Review Actions */
            <div className="flex w-full items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleRetake}
                className="flex-1 border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {t('complaint.form.retakePhoto', 'Retake')}
              </Button>

              <Button
                type="button"
                onClick={handleConfirm}
                className="flex-1 bg-emerald-600 font-semibold text-white hover:bg-emerald-500 shadow-md"
              >
                <Check className="mr-2 h-4 w-4" />
                {t('complaint.form.usePhoto', 'Use Photo')}
              </Button>
            </div>
          ) : !permissionError && hasCamera ? (
            /* Live Shutter Controls */
            <div className="flex w-full items-center justify-around">
              {onFallbackToFile ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onFallbackToFile();
                  }}
                  className="flex flex-col items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  <span className="hidden sm:inline">
                    {t('complaint.form.uploadPhoto', 'Upload Photo')}
                  </span>
                </button>
              ) : (
                <div className="w-10" />
              )}

              {/* Shutter Button */}
              <button
                type="button"
                onClick={handleSnap}
                aria-label={t('complaint.form.snapPhoto', 'Take Photo')}
                className="group relative flex h-18 w-18 items-center justify-center rounded-full border-4 border-white bg-transparent transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/40"
              >
                <span className="h-14 w-14 rounded-full bg-white transition-all group-hover:scale-95 group-active:scale-90" />
              </button>

              <button
                type="button"
                onClick={handleSwitchCamera}
                className="flex flex-col items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors"
                title={t('complaint.form.cameraSwitch', 'Switch Camera')}
              >
                <SwitchCamera className="h-5 w-5" />
                <span className="hidden sm:inline">
                  {t('complaint.form.cameraSwitch', 'Switch')}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex w-full justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                {t('common.close', 'Close')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

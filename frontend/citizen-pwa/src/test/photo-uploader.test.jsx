import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { PhotoUploader } from '@/features/complaints/components/PhotoUploader';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k, fallback) => fallback || k, i18n: { language: 'en' } }),
}));

describe('PhotoUploader & CameraCaptureModal', () => {
  const originalMediaDevices = navigator.mediaDevices;

  beforeAll(() => {
    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: originalMediaDevices,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it('renders Capture Photo and Upload Photo action buttons', () => {
    render(<PhotoUploader files={[]} onChange={() => {}} />);
    expect(
      screen.getByRole('button', { name: /complaint\.form\.capturePhoto/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /complaint\.form\.uploadPhoto/i }),
    ).toBeInTheDocument();
  });

  it('opens CameraCaptureModal when Capture Photo is clicked and getUserMedia is available', async () => {
    const mockTracks = [{ stop: vi.fn() }];
    const mockStream = { getTracks: () => mockTracks };

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
        enumerateDevices: vi.fn().mockResolvedValue([]),
      },
      writable: true,
      configurable: true,
    });

    render(<PhotoUploader files={[]} onChange={() => {}} />);

    const captureBtn = screen.getByRole('button', { name: /complaint\.form\.capturePhoto/i });
    fireEvent.click(captureBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
  });

  it('falls back to file input click if getUserMedia is not available', () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { container } = render(<PhotoUploader files={[]} onChange={() => {}} />);
    const inputs = container.querySelectorAll('input[type="file"]');
    const cameraInput = inputs[0];
    const clickSpy = vi.spyOn(cameraInput, 'click');

    const captureBtn = screen.getByRole('button', { name: /complaint\.form\.capturePhoto/i });
    fireEvent.click(captureBtn);

    expect(clickSpy).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

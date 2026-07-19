import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// i18n: return the key so assertions are stable without a full provider.
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }));

import { DocumentViewer } from '@/components/DocumentViewer';

describe('DocumentViewer', () => {
  it('renders nothing without a url', () => {
    const { container } = render(<DocumentViewer doc={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a PDF as a labelled tile with open + download links', () => {
    render(<DocumentViewer doc={{ url: 'https://x/form.pdf', type: 'pdf', name: 'Form A' }} />);
    expect(screen.getByText('Form A')).toBeInTheDocument();
    // Open-in-new-tab and download are anchors to the file.
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links.some((a) => a.getAttribute('href') === 'https://x/form.pdf')).toBe(true);
    expect(links.some((a) => a.hasAttribute('download'))).toBe(true);
  });

  it('shows an image as a fullscreen-openable button + a download link', () => {
    render(<DocumentViewer doc={{ url: 'https://x/photo.jpg', type: 'image', name: 'Photo' }} />);
    // Image kind exposes a fullscreen button (not just links).
    expect(screen.getByRole('button', { name: 'doc.fullscreen' })).toBeInTheDocument();
    expect(screen.getAllByRole('link').some((a) => a.hasAttribute('download'))).toBe(true);
  });
});

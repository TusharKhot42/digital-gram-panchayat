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

  it('shows a PDF as a labelled tile with an in-app View action + download link', () => {
    render(<DocumentViewer doc={{ url: 'https://x/form.pdf', type: 'pdf', name: 'Form A' }} />);
    expect(screen.getByText('Form A')).toBeInTheDocument();
    // View opens the in-app modal (a button, not a new-tab link).
    expect(screen.getAllByRole('button', { name: 'doc.view' }).length).toBeGreaterThanOrEqual(1);
    // Download stays a real anchor to the file.
    const links = screen.getAllByRole('link');
    expect(links.some((a) => a.getAttribute('href') === 'https://x/form.pdf')).toBe(true);
    expect(links.some((a) => a.hasAttribute('download'))).toBe(true);
  });

  it('shows an image with an in-app View action + a download link', () => {
    render(<DocumentViewer doc={{ url: 'https://x/photo.jpg', type: 'image', name: 'Photo' }} />);
    // Image opens in the in-app viewer via a View button (no external tab).
    expect(screen.getAllByRole('button', { name: 'doc.view' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link').some((a) => a.hasAttribute('download'))).toBe(true);
  });
});

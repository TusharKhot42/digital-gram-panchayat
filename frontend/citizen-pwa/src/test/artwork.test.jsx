import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { eventArtFor, EVENT_ART, HERO } from '@/components/Artwork';
import { ModuleHeader } from '@/components/ModuleHeader';
import { TaxMotif } from '@/components/ModuleArt';
import { StatusPanel } from '@/components/CenteredPanel';
import { NotFoundArt } from '@/components/Illustration';

/**
 * The artwork is decorative, so most of it is not worth a test. Two things are:
 *
 *  - `eventArtFor` reads a title an officer typed, in either script, and picks a picture. It is
 *    the only piece of the visual layer with a decision in it.
 *  - Every decorative image must be invisible to a screen reader. A banner announcing itself
 *    between a heading and its content is worse than no banner, and it is the exact mistake
 *    that is easy to make and impossible to see.
 */
describe('event artwork chosen from the title', () => {
  it.each([
    ['Republic Day Celebration', EVENT_ART.republicDay],
    ['प्रजासत्ताक दिन', EVENT_ART.republicDay],
    ['Independence Day Flag Hoisting', EVENT_ART.independenceDay],
    ['Gram Sabha - Monsoon Review', EVENT_ART.gramSabha],
    ['ग्रामसभा', EVENT_ART.gramSabha],
    ['Tree Plantation Drive', EVENT_ART.treePlantation],
    ['वृक्ष लागवड', EVENT_ART.treePlantation],
    ['Health Check-up Camp', EVENT_ART.healthCamp],
    ['रक्तदान शिबिर', EVENT_ART.bloodDonation],
    ['Village Cleaning Drive', EVENT_ART.cleaningDrive],
    ['क्रीडा स्पर्धा', EVENT_ART.sports],
  ])('%s', (title, expected) => {
    expect(eventArtFor(title)).toBe(expected);
  });

  it('falls back to the neutral gathering scene rather than nothing', () => {
    // A blank band would be worse than a slightly generic picture.
    expect(eventArtFor('Something nobody anticipated')).toBe(EVENT_ART.villageGathering);
    expect(eventArtFor('')).toBe(EVENT_ART.villageGathering);
    expect(eventArtFor(undefined)).toBe(EVENT_ART.villageGathering);
  });

  it('blood donation wins over the generic camp keyword', () => {
    // "रक्तदान शिबिर" contains शिबिर (camp) too; the more specific rule has to be reached first.
    expect(eventArtFor('रक्तदान शिबिर')).toBe(EVENT_ART.bloodDonation);
  });

  it('every hero name resolves to a real bundled asset', () => {
    Object.entries(HERO).forEach(([name, url]) => {
      expect(url, name).toBeTruthy();
      expect(String(url), name).toMatch(/\.(svg|png|jpg|jpeg|webp)/i);
    });
  });
});

describe('decorative artwork is silent to a screen reader', () => {
  it('a module header exposes its heading and hides its motif', () => {
    render(
      <MemoryRouter>
        <ModuleHeader art={TaxMotif} title="Tax records" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Tax records' })).toBeInTheDocument();
    // The motif must not appear in the accessibility tree at all.
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByRole('presentation', { hidden: false })).toBeNull();
  });

  it('a status panel renders its illustration without announcing it', () => {
    render(
      <StatusPanel art={NotFoundArt} title="Page not found" description="Try the home page" />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('the older icon treatment still works, so untouched call sites are unaffected', () => {
    const Icon = (props) => <svg data-testid="legacy-icon" {...props} />;
    render(<StatusPanel icon={Icon} title="Offline" />);

    expect(screen.getByTestId('legacy-icon')).toBeInTheDocument();
  });
});

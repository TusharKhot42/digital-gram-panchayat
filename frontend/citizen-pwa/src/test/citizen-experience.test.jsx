import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { buildEventIcs } from '@/utils/calendar';
import { GlobalSearch } from '@/features/home/GlobalSearch';
import { VillageStats } from '@/features/home/VillageStats';

// Return the key for UI chrome, but keep the two service names the bilingual test depends on.
const FIXED = {
  en: { 'nav.tax': 'Tax', 'nav.notices': 'Notices' },
  mr: { 'nav.tax': 'कर', 'nav.notices': 'सूचना' },
};
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k) => k,
    i18n: { language: 'en', getFixedT: (lang) => (k) => FIXED[lang]?.[k] ?? k },
  }),
}));

describe('buildEventIcs', () => {
  const event = {
    id: 'e1',
    title: 'Gram Sabha; Monsoon Review',
    startDate: '2026-08-14T10:30:00.000Z',
    location: 'Gram Panchayat Office, Sakharale',
    organizer: 'Grampanchayat Sakharale',
    description: 'Line one\nLine two',
  };

  it('emits a single valid VEVENT', () => {
    const ics = buildEventIcs(event);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('DTSTART:20260814T103000Z');
  });

  it('escapes the characters iCalendar treats as structure', () => {
    const ics = buildEventIcs(event);
    // A raw ; or , would split the field and corrupt the entry in the calendar app.
    expect(ics).toContain('SUMMARY:Gram Sabha\\; Monsoon Review');
    expect(ics).toContain('LOCATION:Gram Panchayat Office\\, Sakharale');
    expect(ics).toContain('DESCRIPTION:Line one\\nLine two');
  });

  it('gives an event with no end date an hour, so calendars do not drop it', () => {
    expect(buildEventIcs(event)).toContain('DTEND:20260814T113000Z');
  });

  it('honours an explicit end date', () => {
    const ics = buildEventIcs({ ...event, endDate: '2026-08-14T15:00:00.000Z' });
    expect(ics).toContain('DTEND:20260814T150000Z');
  });
});

const DATA = {
  notices: [
    {
      id: 'n1',
      title: 'Water tank cleaning',
      i18n: { title: { en: 'Water tank cleaning', mr: 'पाण्याची टाकी स्वच्छता' } },
    },
  ],
  schemes: [{ id: 's1', title: 'Solar Subsidy', summary: 'Rooftop solar for farmers' }],
  complaints: [{ id: 'c1', title: 'Street light broken', complaintId: 'CMP-1' }],
  applications: [],
  tax: [],
  profile: { members: [{ id: 'm1', name: 'Test Sarpanch', designation: 'Sarpanch' }] },
  events: [{ id: 'ev1', title: 'Gram Sabha', location: 'Panchayat Office' }],
};

const renderSearch = () =>
  render(
    <MemoryRouter>
      <GlobalSearch {...DATA} />
    </MemoryRouter>,
  );

const type = (value) => {
  const input = screen.getByRole('combobox');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value } });
  return input;
};

describe('GlobalSearch', () => {
  it('searches across every kind of record at once', () => {
    renderSearch();
    type('water');
    const list = screen.getByRole('listbox');
    expect(within(list).getByText('Water tank cleaning')).toBeInTheDocument();
  });

  it('finds a citizen’s own complaint', () => {
    renderSearch();
    type('street');
    expect(
      within(screen.getByRole('listbox')).getByText('Street light broken'),
    ).toBeInTheDocument();
  });

  it('finds an official by designation', () => {
    renderSearch();
    type('sarpanch');
    expect(within(screen.getByRole('listbox')).getByText('Test Sarpanch')).toBeInTheDocument();
  });

  it('matches a Marathi query while the interface is in English', () => {
    renderSearch();
    // "कर" is the Marathi label for Tax; the interface here is English.
    type('कर');
    expect(within(screen.getByRole('listbox')).getByText('nav.tax')).toBeInTheDocument();
  });

  it('matches the Marathi text of a bilingual notice', () => {
    renderSearch();
    type('टाकी');
    expect(
      within(screen.getByRole('listbox')).getByText('Water tank cleaning'),
    ).toBeInTheDocument();
  });

  it('requires every term, so more words narrow the result', () => {
    renderSearch();
    type('water cleaning');
    expect(
      within(screen.getByRole('listbox')).getByText('Water tank cleaning'),
    ).toBeInTheDocument();
    type('water electricity');
    expect(screen.getByText('search.noResults')).toBeInTheDocument();
  });

  it('says plainly when nothing matches instead of guessing', () => {
    renderSearch();
    type('zzzznothing');
    expect(screen.getByText('search.noResults')).toBeInTheDocument();
  });

  it('closes on Escape without discarding the query', () => {
    renderSearch();
    const input = type('water');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).toHaveValue('water');
  });
});

describe('VillageStats', () => {
  const statistics = {
    population: '9,144',
    literacyRate: '72.13%',
    area: '1,213 hectares',
    schools: 'Not Available',
    banks: 'Available',
  };

  it('shows the real figure even when it cannot animate', () => {
    // jsdom has no IntersectionObserver, which is the same dead end as a hidden tab: the
    // animation callback never arrives. The number still has to be right.
    render(<VillageStats statistics={statistics} />);
    expect(screen.getByText('9,144')).toBeInTheDocument();
    expect(screen.getByText('1,213 hectares')).toBeInTheDocument();
  });

  it('keeps the unit attached to the number', () => {
    render(<VillageStats statistics={statistics} />);
    expect(screen.getByText('72.13%')).toBeInTheDocument();
  });

  it('passes non-numeric values through untouched', () => {
    render(<VillageStats statistics={statistics} />);
    expect(screen.getByText('Not Available')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('renders only the statistics the profile actually carries', () => {
    render(<VillageStats statistics={{ population: '9,144' }} />);
    expect(screen.getByText('village.stat.population')).toBeInTheDocument();
    expect(screen.queryByText('village.stat.hospitals')).not.toBeInTheDocument();
  });

  it('renders nothing at all when there are no statistics', () => {
    const { container } = render(<VillageStats statistics={{}} />);
    expect(container).toBeEmptyDOMElement();
  });
});

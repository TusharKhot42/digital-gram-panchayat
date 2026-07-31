import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { formatTime } from '@dgp/shared';
import { FormRow } from '@/features/complaints/components/FormRow';
import { CategorySelect } from '@/features/complaints/components/CategorySelect';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'en' } }),
}));

/**
 * These guard a defect that is invisible on screen: the label rendered, looked correct, and
 * was not attached to anything. `element.labels` is the browser's own answer, so asserting on
 * it catches the case a snapshot never would.
 */
describe('complaint form labelling', () => {
  it('associates a FormRow label with the control it labels', () => {
    render(
      <FormRow label="Subject">
        <input name="title" />
      </FormRow>,
    );
    const input = screen.getByRole('textbox');
    expect([...input.labels].map((l) => l.textContent)).toContain('Subject');
    expect(input).toHaveAccessibleName('Subject');
  });

  it('still associates the label when the field is marked optional', () => {
    render(
      <FormRow label="Address" optional>
        <input name="address" />
      </FormRow>,
    );
    expect(screen.getByRole('textbox').labels).toHaveLength(1);
  });

  it('associates the category select without absorbing its option text', () => {
    render(<CategorySelect register={{ name: 'category' }} />);
    const select = screen.getByRole('combobox');
    expect(select.labels).toHaveLength(1);
    // A wrapping label would fold the selected option into the name; htmlFor does not.
    expect(select).toHaveAccessibleName('complaint.form.category');
  });
});

describe('formatTime', () => {
  const at = '2026-08-14T10:30:00.000Z';

  it('renders a clock time, not a date', () => {
    const out = formatTime(at, 'en');
    expect(out).toMatch(/\d/);
    expect(out).not.toMatch(/2026/);
  });

  it('localises to Marathi', () => {
    expect(formatTime(at, 'mr')).not.toBe(formatTime(at, 'en'));
  });

  it('accepts a Date as well as a string', () => {
    expect(formatTime(new Date(at), 'en')).toBe(formatTime(at, 'en'));
  });
});

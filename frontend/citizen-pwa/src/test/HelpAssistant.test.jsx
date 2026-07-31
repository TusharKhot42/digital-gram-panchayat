import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// i18n: return the key so assertions are stable without a provider.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'en' } }),
}));
// The assistant reads the office phone from the village profile; stub the query hook.
vi.mock('@/features/village/hooks', () => ({
  useVillageProfile: () => ({ data: { leadership: { contactNumbers: '9876500000' } } }),
}));

import { HelpAssistant } from '@/components/HelpAssistant';

const renderAssistant = (route = '/') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <HelpAssistant />
    </MemoryRouter>,
  );

const openPanel = () => fireEvent.click(screen.getByRole('button', { name: 'assistant.open' }));
const ask = (text) => {
  fireEvent.change(screen.getByLabelText('assistant.inputLabel'), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'assistant.send' }));
};

describe('HelpAssistant launcher', () => {
  it('renders only a launcher until opened', () => {
    renderAssistant();
    expect(screen.getByRole('button', { name: 'assistant.open' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens a labelled modal dialog', () => {
    renderAssistant();
    openPanel();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('assistant.title');
  });

  it('closes on Escape', () => {
    renderAssistant();
    openPanel();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes with the close button', () => {
    renderAssistant();
    openPanel();
    fireEvent.click(screen.getByRole('button', { name: 'common.close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('HelpAssistant suggestions (context aware)', () => {
  it('greets and offers suggested questions before anything is asked', () => {
    renderAssistant();
    openPanel();
    expect(screen.getByText('assistant.greeting')).toBeInTheDocument();
    expect(screen.getByText('assistant.trySomething')).toBeInTheDocument();
  });

  it('suggests the guide for the screen the user is on', () => {
    renderAssistant('/tax');
    openPanel();
    expect(screen.getByRole('button', { name: 'Check your tax dues' })).toBeInTheDocument();
  });

  it('asking a suggestion answers it', () => {
    renderAssistant('/tax');
    openPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Check your tax dues' }));
    expect(screen.getByText('help.takeMeThere')).toBeInTheDocument();
  });
});

describe('HelpAssistant answering', () => {
  it('answers a real question with the matching guide and a deep link', () => {
    renderAssistant();
    openPanel();
    ask('how do I file a complaint');

    const dialog = screen.getByRole('dialog');
    // The question is echoed back, and the authored guide title is the answer.
    expect(within(dialog).getByText('how do I file a complaint')).toBeInTheDocument();
    expect(within(dialog).getByText('File a complaint')).toBeInTheDocument();
    // Deep link into the app, plus a link to the full guide.
    expect(within(dialog).getByRole('link', { name: /help.takeMeThere/ })).toHaveAttribute(
      'href',
      '/complaints/new',
    );
    expect(within(dialog).getByRole('link', { name: /assistant.fullGuide/ })).toHaveAttribute(
      'href',
      '/help?topic=file-complaint',
    );
  });

  it('answers a Marathi question', () => {
    renderAssistant();
    openPanel();
    ask('तक्रार कशी नोंदवावी');
    expect(screen.getByText('File a complaint')).toBeInTheDocument();
  });

  it('keeps conversation history across turns', () => {
    renderAssistant();
    openPanel();
    ask('file a complaint');
    ask('check my tax');
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('file a complaint')).toBeInTheDocument();
    expect(within(dialog).getByText('check my tax')).toBeInTheDocument();
  });

  it('clears the conversation', () => {
    renderAssistant();
    openPanel();
    ask('file a complaint');
    fireEvent.click(screen.getByRole('button', { name: 'assistant.clear' }));
    expect(screen.queryByText('file a complaint')).not.toBeInTheDocument();
    // Back to the greeting state.
    expect(screen.getByText('assistant.greeting')).toBeInTheDocument();
  });

  it('ignores an empty question', () => {
    renderAssistant();
    openPanel();
    expect(screen.getByRole('button', { name: 'assistant.send' })).toBeDisabled();
  });
});

describe('HelpAssistant never invents an answer', () => {
  it('shows the no-match reply with Help Center and office contact', () => {
    renderAssistant();
    openPanel();
    ask('zzzz qwerty nonsense');

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('assistant.noMatch')).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: /help.openCenter/ })).toHaveAttribute(
      'href',
      '/help',
    );
    // Falls back to the Gram Panchayat office phone from the village profile.
    expect(within(dialog).getByRole('link', { name: /assistant.callOffice/ })).toHaveAttribute(
      'href',
      'tel:9876500000',
    );
  });

  it('asks to clarify on a weak match instead of guessing', () => {
    renderAssistant();
    openPanel();
    ask('i have a question');
    expect(screen.getByText('assistant.notSure')).toBeInTheDocument();
  });
});

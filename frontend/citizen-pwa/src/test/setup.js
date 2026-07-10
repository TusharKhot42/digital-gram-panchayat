import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import i18n from '@/locales/i18n';

// Deterministic language for assertions.
void i18n.changeLanguage('en');

// jsdom lacks matchMedia (used by ThemeProvider) — provide a no-op stub.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

afterEach(() => cleanup());

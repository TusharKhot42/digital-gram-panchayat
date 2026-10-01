import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getBackRoute } from '@/utils/navigation';
import { ModuleHeader } from '@/components/ModuleHeader';
import { PageHeader } from '@/components/PageHeader';

describe('getBackRoute hierarchical navigation', () => {
  it('returns explicit backTo when provided', () => {
    expect(getBackRoute('/complaints/123', '/complaints')).toBe('/complaints');
    expect(getBackRoute('/notices', '/')).toBe('/');
    expect(getBackRoute('/custom/path', '/custom/parent')).toBe('/custom/parent');
  });

  it('navigates top-level tabs and pages directly to root (/)', () => {
    expect(getBackRoute('/')).toBe('/');
    expect(getBackRoute('/complaints')).toBe('/');
    expect(getBackRoute('/notices')).toBe('/');
    expect(getBackRoute('/dakhala')).toBe('/');
    expect(getBackRoute('/tax')).toBe('/');
    expect(getBackRoute('/schemes')).toBe('/');
    expect(getBackRoute('/timetable')).toBe('/');
    expect(getBackRoute('/meetings')).toBe('/');
    expect(getBackRoute('/projects')).toBe('/');
    expect(getBackRoute('/polls')).toBe('/');
    expect(getBackRoute('/feedback')).toBe('/');
    expect(getBackRoute('/downloads')).toBe('/');
    expect(getBackRoute('/profile')).toBe('/');
    expect(getBackRoute('/settings')).toBe('/');
    expect(getBackRoute('/help')).toBe('/');
  });

  it('navigates sub-routes to their parent module route', () => {
    expect(getBackRoute('/complaints/new')).toBe('/complaints');
    expect(getBackRoute('/complaints/6abd02ef50fa97da73eabcb6')).toBe('/complaints');
    expect(getBackRoute('/notices/6abd02ef50fa97da73eabcb6')).toBe('/notices');
    expect(getBackRoute('/schemes/6abd0b7b0f2ac605fed93547')).toBe('/schemes');
    expect(getBackRoute('/dakhala/new')).toBe('/dakhala');
    expect(getBackRoute('/dakhala/app123')).toBe('/dakhala');
    expect(getBackRoute('/tax/prop123')).toBe('/tax');
  });

  it('handles empty and trailing slash paths safely', () => {
    expect(getBackRoute('')).toBe('/');
    expect(getBackRoute('/complaints/')).toBe('/');
    expect(getBackRoute('/complaints/123/')).toBe('/complaints');
  });
});

describe('ModuleHeader and PageHeader Back button links', () => {
  it('ModuleHeader back button links to root when on module root', () => {
    render(
      <MemoryRouter initialEntries={['/complaints']}>
        <ModuleHeader title="Complaints" />
      </MemoryRouter>,
    );

    const backLink = screen.getByRole('link', { name: /back/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('PageHeader back button links to root when no backTo is passed', () => {
    render(
      <MemoryRouter initialEntries={['/meetings']}>
        <PageHeader title="Meetings" />
      </MemoryRouter>,
    );

    const backLink = screen.getByRole('link', { name: /back/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('PageHeader back button links to backTo when provided', () => {
    render(
      <MemoryRouter initialEntries={['/complaints/123']}>
        <PageHeader title="Complaint Detail" backTo="/complaints" />
      </MemoryRouter>,
    );

    const backLink = screen.getByRole('link', { name: /back/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/complaints');
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

/**
 * The officer now attaches the scanned demand bill instead of typing the assessed figure from
 * it. Such a record carries `amount: null`, and every screen that renders money has to keep
 * "unknown" distinguishable from "nil" — `formatCurrency(null)` returns ₹0, which on a tax
 * screen reads as "you owe nothing" to the one person it must never mislead.
 *
 * These assert on rendered text rather than props, because the defect is only visible in what
 * the citizen and the officer actually read.
 */
const { state } = vi.hoisted(() => ({
  state: {
    records: { data: undefined, isLoading: false, isError: false },
  },
}));

vi.mock('@/features/tax/hooks', () => ({
  useTaxRecords: () => state.records,
  useTaxRecord: () => state.records,
  useTaxMutations: () => ({
    create: { mutateAsync: vi.fn(), isPending: false },
    update: { mutateAsync: vi.fn(), isPending: false },
    addPayment: { mutateAsync: vi.fn(), isPending: false },
  }),
}));

const { TaxList } = await import('@/features/tax/TaxList');
const { TaxForm } = await import('@/features/tax/TaxForm');

const billOnly = {
  id: '1',
  taxRecordId: 'TAX-2026-000004',
  propertyNumber: 'PROP-1',
  taxType: 'Property',
  financialYear: '2025-2026',
  amount: null,
  amountPaid: 0,
  balance: 0,
  paymentStatus: 'Unpaid',
  bills: [{ url: 'http://x/1', type: 'pdf', name: 'bill.pdf' }],
  payments: [],
  history: [],
};

const withAmount = {
  ...billOnly,
  id: '2',
  taxRecordId: 'TAX-2026-000005',
  amount: 440,
  balance: 440,
};

function renderAt(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('a tax record raised from a scanned bill', () => {
  it('never shows ₹0 where the amount is unknown', () => {
    state.records = { data: { data: [billOnly], total: 1 }, isLoading: false, isError: false };
    renderAt(<TaxList />);

    const row = screen.getByText('TAX-2026-000004').closest('tr');
    // Assessed points at the bill; dues is blank rather than a figure nobody computed.
    expect(row).toHaveTextContent('View bill');
    expect(row).toHaveTextContent('—');
    expect(row).not.toHaveTextContent('₹0');
  });

  it('still shows real figures for a record that has an assessed amount', () => {
    state.records = { data: { data: [withAmount], total: 1 }, isLoading: false, isError: false };
    renderAt(<TaxList />);

    const row = screen.getByText('TAX-2026-000005').closest('tr');
    expect(row).toHaveTextContent('₹440');
    expect(row).not.toHaveTextContent('View bill');
  });
});

describe('the officer create form', () => {
  it('has no assessed-amount field — the bill carries the figure', () => {
    state.records = { data: undefined, isLoading: false, isError: false };
    renderAt(<TaxForm />);

    expect(screen.queryByLabelText(/assessed amount/i)).toBeNull();
    expect(screen.getByLabelText(/tax bill scans/i)).toBeInTheDocument();
  });

  it('tells the officer the bill is required, not optional', () => {
    state.records = { data: undefined, isLoading: false, isError: false };
    renderAt(<TaxForm />);

    expect(screen.getByText(/^Required\./)).toBeInTheDocument();
  });
});

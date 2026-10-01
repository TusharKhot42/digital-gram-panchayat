import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TimetableAdmin } from '@/features/timetable/TimetableAdmin';

const { hookState, mockMutations } = vi.hoisted(() => {
  return {
    hookState: {
      data: {
        ghantagadi: [
          {
            id: 'g1',
            ward_en: 'Ward 1 & 2',
            ward_mr: 'प्रभाग १ व २',
            timingMorning_en: '07:00 AM – 09:00 AM',
            timingMorning_mr: 'सकाळी ०७:०० – ०९:००',
            timingEvening_en: '04:00 PM – 05:30 PM',
            timingEvening_mr: 'संध्याकाळी ०४:०० – ०५:३०',
            days_en: 'Daily (Mon – Sat)',
            days_mr: 'दररोज (सोम – शनि)',
            driverName_en: 'Ramesh Patil',
            driverName_mr: 'रमेश पाटील',
            driverMobile: '9823012345',
            vehicleNo: 'MH-10-GP-1001',
            status_en: 'Active Morning',
            status_mr: 'सकाळची फेरी सुरू',
          },
        ],
        water: [
          {
            id: 'w1',
            zone_en: 'Ward 1 & 2',
            zone_mr: 'प्रभाग १ व २',
            timing_en: '06:00 AM – 07:30 AM',
            timing_mr: 'सकाळी ०६:०० – ०७:३०',
            frequency_en: 'Daily Morning',
            frequency_mr: 'दररोज सकाळी',
            operatorName_en: 'Suresh More',
            operatorName_mr: 'सुरेश मोरे',
            operatorMobile: '9890123456',
            source_en: 'Main Elevated Reservoir A',
            source_mr: 'मुख्य जलकुंभ अ',
            status_en: 'Active Now',
            status_mr: 'सध्या सुरू',
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    },
    mockMutations: {
      update: { mutate: vi.fn(), isPending: false },
      reset: { mutate: vi.fn(), isPending: false },
    },
  };
});

vi.mock('@/features/timetable/hooks', () => ({
  useAdminTimetable: () => hookState,
  useTimetableMutations: () => mockMutations,
}));

describe('TimetableAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookState.isLoading = false;
    hookState.isError = false;
  });

  it('renders timetable management header and tab controls', () => {
    render(<TimetableAdmin />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Timetable Management/i);
    expect(screen.getByRole('button', { name: /Ghantagadi Schedule/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Water Supply Schedule/i })).toBeInTheDocument();
  });

  it('renders ghantagadi table rows by default', () => {
    render(<TimetableAdmin />);
    expect(screen.getByText('Ward 1 & 2')).toBeInTheDocument();
    expect(screen.getByText('Ramesh Patil')).toBeInTheDocument();
    expect(screen.getByText('MH-10-GP-1001')).toBeInTheDocument();
  });

  it('switches to water supply tab and shows water schedule', async () => {
    render(<TimetableAdmin />);
    const waterTab = screen.getByRole('button', { name: /Water Supply Schedule/i });
    await userEvent.click(waterTab);

    expect(screen.getByText('Suresh More')).toBeInTheDocument();
    expect(screen.getByText('Main Elevated Reservoir A')).toBeInTheDocument();
  });

  it('opens edit dialog when clicking edit on a row', async () => {
    render(<TimetableAdmin />);
    const editBtn = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ramesh Patil')).toBeInTheDocument();
  });

  it('allows adding a new route via the add button', async () => {
    render(<TimetableAdmin />);
    const addBtn = screen.getByRole('button', { name: /Add Ghantagadi Route/i });
    await userEvent.click(addBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Ward 1 & 2/i)).toBeInTheDocument();
  });

  it('shows error message and retry button when isError is true', () => {
    hookState.isError = true;
    render(<TimetableAdmin />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

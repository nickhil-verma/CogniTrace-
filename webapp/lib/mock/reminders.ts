import { Reminder } from '@/types/reminder';

export const initialMockReminders: Reminder[] = [
  {
    id: 'rem_1',
    title: 'Donepezil (Aricept) 10mg',
    time: '8:00 PM',
    date: 'Today',
    category: 'Medication',
    status: 'Upcoming',
    patientName: 'Mom',
    dosageOrDetails: 'Take 1 tablet after dinner with glass of water',
    recurring: 'Daily',
    createdAt: '2026-09-17T10:00:00Z'
  },
  {
    id: 'rem_2',
    title: 'Morning Hydration & Water Glass',
    time: '9:00 AM',
    date: 'Today',
    category: 'Daily Routine',
    status: 'Completed',
    patientName: 'Mom',
    dosageOrDetails: 'Encourage 250ml warm water with lemon',
    recurring: 'Daily',
    createdAt: '2026-09-17T08:00:00Z'
  },
  {
    id: 'rem_3',
    title: 'Multivitamin & Calcium Supplement',
    time: '1:00 PM',
    date: 'Today',
    category: 'Medication',
    status: 'Completed',
    patientName: 'Mom',
    dosageOrDetails: '1 chewable tablet after lunch',
    recurring: 'Daily',
    createdAt: '2026-09-17T08:00:00Z'
  },
  {
    id: 'rem_4',
    title: 'Evening Neighborhood Walk',
    time: '5:30 PM',
    date: 'Today',
    category: 'Daily Routine',
    status: 'Upcoming',
    patientName: 'Mom',
    dosageOrDetails: '15-minute relaxed walk with caregiver',
    recurring: 'Mon, Wed, Fri',
    createdAt: '2026-09-16T12:00:00Z'
  },
  {
    id: 'rem_5',
    title: 'Family Video Call with Grandchildren',
    time: '7:00 PM',
    date: 'Tomorrow',
    category: 'Family Call',
    status: 'Upcoming',
    patientName: 'Mom',
    dosageOrDetails: 'Show Goa photo album during call',
    recurring: 'Weekly',
    createdAt: '2026-09-15T15:00:00Z'
  }
];

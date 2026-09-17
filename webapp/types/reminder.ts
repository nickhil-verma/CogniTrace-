export type ReminderCategory = 'Medication' | 'Doctor Check-in' | 'Cognitive Exercise' | 'Daily Routine' | 'Family Call';
export type ReminderStatus = 'Upcoming' | 'Completed' | 'Missed';

export interface Reminder {
  id: string;
  title: string;
  time: string;
  date?: string;
  category: ReminderCategory;
  status: ReminderStatus;
  patientName: string;
  dosageOrDetails?: string;
  recurring?: string;
  createdAt: string;
}

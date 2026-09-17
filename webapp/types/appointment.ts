export type AppointmentStatus = 'Upcoming' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: string;
  title: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
  status: AppointmentStatus;
  contactNumber?: string;
}

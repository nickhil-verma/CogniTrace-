import { Appointment } from '@/types/appointment';

export const initialMockAppointments: Appointment[] = [
  {
    id: 'apt_1',
    title: 'Neurology Cognitive Evaluation',
    doctorName: 'Dr. Anita Sharma',
    specialty: 'Cognitive Neurology',
    date: 'Tomorrow, Sept 19',
    time: '10:30 AM',
    location: 'City Care Hospital, Suite 402, North Wing',
    notes: 'Bring recent memory observation logs and current medication list.',
    status: 'Upcoming',
    contactNumber: '+91 98765 43210'
  },
  {
    id: 'apt_2',
    title: 'Physical Therapy & Balance Session',
    doctorName: 'Dr. Rajiv Mehta',
    specialty: 'Geriatric Physiotherapy',
    date: 'Next Tuesday, Sept 22',
    time: '3:00 PM',
    location: 'Wellness Rehabilitation Center, 2nd Floor',
    notes: 'Wear comfortable walking shoes for gentle gait exercises.',
    status: 'Upcoming',
    contactNumber: '+91 98123 76543'
  },
  {
    id: 'apt_3',
    title: 'Routine Blood Panel & BP Review',
    doctorName: 'Dr. S. K. Verma',
    specialty: 'Internal Medicine',
    date: 'Last Week, Sept 10',
    time: '11:00 AM',
    location: 'Apollo Medical Clinic',
    notes: 'Blood sugar and vitals normal. Next check-in scheduled in 2 months.',
    status: 'Completed',
    contactNumber: '+91 99000 11223'
  }
];

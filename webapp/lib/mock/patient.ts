import { PatientSummary } from '@/types/patient';

export const mockPatientSummary: PatientSummary = {
  patientId: 'patient_001',
  name: 'Mom (Sunita)',
  relationship: 'Mother',
  currentStage: 'Middle Stage',
  stageDescription: 'Needs slightly more support than last month. Continues to enjoy familiar family photos and music.',
  caregiverNote: 'She had a wonderful afternoon in the garden today. Recognized old neighbors.',
  lastUpdated: 'Today at 9:30 AM',
  observedChanges: [
    {
      id: 'change_1',
      category: 'Memory recall',
      status: 'Stable',
      note: 'Remembers long-term family memories vividly; occasional short-term memory gaps in the morning.',
      lastObserved: 'Yesterday',
      trend: 'stable'
    },
    {
      id: 'change_2',
      category: 'Communication',
      status: 'Stable',
      note: 'Expresses needs clearly. Speaks comfortably in native language and English.',
      lastObserved: '2 days ago',
      trend: 'stable'
    },
    {
      id: 'change_3',
      category: 'Daily independence',
      status: 'Needs slight support',
      note: 'Requires gentle verbal reminders for evening medications and hydrations.',
      lastObserved: 'Today',
      trend: 'stable'
    },
    {
      id: 'change_4',
      category: 'Care needs',
      status: 'Stable',
      note: 'Calm evening routine helps maintain restful sleep pattern.',
      lastObserved: 'Today',
      trend: 'improving'
    }
  ],
  todaysCare: [
    {
      id: 'care_1',
      title: 'Morning Blood Pressure Check',
      time: '8:30 AM',
      type: 'Cognitive check',
      completed: true
    },
    {
      id: 'care_2',
      title: 'Evening Donepezil Medication',
      time: '8:00 PM',
      type: 'Medication',
      completed: false
    },
    {
      id: 'care_3',
      title: 'Dr. Sharma Neurologist Appointment',
      time: 'Tomorrow, 10:30 AM',
      type: 'Doctor appointment',
      completed: false
    }
  ]
};

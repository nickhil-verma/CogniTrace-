export interface ObservedChange {
  id: string;
  category: 'Memory recall' | 'Communication' | 'Daily independence' | 'Care needs';
  status: 'Stable' | 'Needs slight support' | 'Improved' | 'Noticeable change';
  note: string;
  lastObserved: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface CareCheckitem {
  id: string;
  title: string;
  time: string;
  type: 'Medication' | 'Doctor appointment' | 'Cognitive check' | 'Activity';
  completed: boolean;
}

export interface PatientSummary {
  patientId: string;
  name: string;
  relationship: string;
  currentStage: 'Early Stage' | 'Middle Stage' | 'Late Stage';
  stageDescription: string;
  caregiverNote: string;
  lastUpdated: string;
  observedChanges: ObservedChange[];
  todaysCare: CareCheckitem[];
}

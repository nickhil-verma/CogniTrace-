import 'dart:async';
import '../../models/api_models.dart';
import '../../../domain/entities/cognitrace_entities.dart';

class MockCogniTraceApi {
  Future<Map<String, dynamic>> sendAudioTaskTurn({
    required String audioPath,
    required String patientId,
    String? language,
  }) async {
    await Future.delayed(const Duration(milliseconds: 1800));

    return {
      'transcript': 'Remind Mom to take her medicine at 8 tonight.',
      'response_text': "I've created a reminder for Mom to take her Evening Medication at 8:00 PM tonight.",
      'audio_url': null,
      'status': 'completed',
      'actions': [
        {
          'id': 'act_101',
          'action_type': 'create_reminder',
          'title': 'Created Medication Reminder',
          'description': 'Evening Medication scheduled for 8:00 PM tonight.',
          'status': 'completed',
          'timestamp': DateTime.now().toIso8601String(),
        },
        {
          'id': 'act_102',
          'action_type': 'mark_task_completed',
          'title': 'Care Schedule Updated',
          'description': 'Synced with caretaker calendar.',
          'status': 'completed',
          'timestamp': DateTime.now().toIso8601String(),
        }
      ]
    };
  }

  Future<PatientEntity> getPatientSummary(String patientId) async {
    await Future.delayed(const Duration(milliseconds: 400));
    return const PatientEntity(
      id: 'patient_mom_01',
      name: 'Eleanor Vance',
      relation: 'Mom',
      careStage: 'Middle Stage',
      stageDescription: 'Needs slightly more support than last month with daily routine.',
      recentObservations: [
        'Memory recall slightly slower in the evening',
        'Communicates warmly during morning walks',
        'Maintains good independence with familiar meals',
      ],
      upcomingCare: [
        'Medication - 8:00 PM',
        'Doctor appointment - Tomorrow, 10:30 AM',
        'Cognitive check - Due today',
      ],
    );
  }

  Future<List<ReminderEntity>> getReminders() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return [
      ReminderEntity(
        id: 'rem_1',
        title: 'Aricept (Donepezil) 10mg',
        dateTime: DateTime.now().add(const Duration(hours: 4)),
        category: 'Medication',
        status: ReminderStatus.upcoming,
      ),
      ReminderEntity(
        id: 'rem_2',
        title: 'Morning Walk in Park',
        dateTime: DateTime.now().subtract(const Duration(hours: 2)),
        category: 'Activity',
        status: ReminderStatus.completed,
      ),
      ReminderEntity(
        id: 'rem_3',
        title: 'Hydration & Herbal Tea',
        dateTime: DateTime.now().add(const Duration(hours: 7)),
        category: 'Nutrition',
        status: ReminderStatus.upcoming,
      ),
    ];
  }

  Future<List<AppointmentEntity>> getAppointments() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return [
      AppointmentEntity(
        id: 'app_1',
        doctorName: 'Dr. Sharma',
        specialty: 'Neurologist',
        dateTime: DateTime.now().add(const Duration(days: 1, hours: 3)),
        location: 'City General Hospital, Suite 402',
        status: AppointmentStatus.scheduled,
      ),
      AppointmentEntity(
        id: 'app_2',
        doctorName: 'Dr. Anita Roy',
        specialty: 'Cognitive Care Specialist',
        dateTime: DateTime.now().add(const Duration(days: 8)),
        location: 'CogniTrace Memory Clinic',
        status: AppointmentStatus.scheduled,
      ),
    ];
  }

  Future<List<MemoryEntity>> getMemories() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return const [
      MemoryEntity(
        id: 'mem_1',
        title: 'Family Vacation in Goa',
        location: 'Goa',
        year: '1987',
        description: 'Our first family trip together by the sea. Mom loved watching the sunset near Calangute beach.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        people: ['Mom', 'Dad', 'Rahul', 'Priya'],
        tags: ['Vacation', 'Beach', 'Family'],
      ),
      MemoryEntity(
        id: 'mem_2',
        title: 'Garden Tea Party',
        location: 'Home Garden',
        year: '2004',
        description: 'Mom hosting her annual spring tea party with neighbors and fresh jasmine flowers.',
        imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        people: ['Mom', 'Aunt Meera', 'Sujata'],
        tags: ['Garden', 'Tea', 'Celebration'],
      ),
      MemoryEntity(
        id: 'mem_3',
        title: 'Diwali Lighting at Ancestral Home',
        location: 'Jaipur',
        year: '1995',
        description: 'Lighting traditional diyas along the courtyard balcony together.',
        imageUrl: 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=800&q=80',
        people: ['Mom', 'Grandmother'],
        tags: ['Festival', 'Diwali', 'Tradition'],
      ),
    ];
  }

  Future<List<JournalEntryEntity>> getJournalEntries() async {
    return [
      JournalEntryEntity(
        id: 'j_1',
        title: 'Went to the park today',
        content: 'Mom seemed much happier today. She recognized the old neighborhood flowers and smiled when we passed the bakery.',
        timestamp: DateTime.now().subtract(const Duration(hours: 5)),
      ),
      JournalEntryEntity(
        id: 'j_2',
        title: 'Doctor Follow-up Notes',
        content: 'Completed Dr. Sharma consultation. Memory scores stable. Doctor recommended continuing evening reminiscence sessions.',
        timestamp: DateTime.now().subtract(const Duration(days: 2)),
      ),
    ];
  }

  Future<List<TrackingObservationEntity>> getTrackingObservations() async {
    return const [
      TrackingObservationEntity(
        category: 'Memory',
        score: 7.2,
        trend: 'stable',
        summary: 'Slight evening recall latency, excellent morning recognition.',
      ),
      TrackingObservationEntity(
        category: 'Communication',
        score: 8.0,
        trend: 'improving',
        summary: 'Responds warmly to familiar voice prompts & music.',
      ),
      TrackingObservationEntity(
        category: 'Daily Independence',
        score: 6.8,
        trend: 'needs_support',
        summary: 'Requires gentle reminders for evening medicine routines.',
      ),
      TrackingObservationEntity(
        category: 'Care Needs',
        score: 7.5,
        trend: 'stable',
        summary: 'Overall care balance is steady with routine structure.',
      ),
    ];
  }
}

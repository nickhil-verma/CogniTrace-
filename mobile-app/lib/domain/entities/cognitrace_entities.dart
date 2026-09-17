class PatientEntity {
  final String id;
  final String name;
  final String relation;
  final String careStage;
  final String stageDescription;
  final List<String> recentObservations;
  final List<String> upcomingCare;

  const PatientEntity({
    required this.id,
    required this.name,
    required this.relation,
    required this.careStage,
    required this.stageDescription,
    required this.recentObservations,
    required this.upcomingCare,
  });
}

enum ReminderStatus { upcoming, completed, missed }

class ReminderEntity {
  final String id;
  final String title;
  final DateTime dateTime;
  final String category;
  final ReminderStatus status;

  const ReminderEntity({
    required this.id,
    required this.title,
    required this.dateTime,
    required this.category,
    required this.status,
  });
}

enum AppointmentStatus { scheduled, completed, cancelled }

class AppointmentEntity {
  final String id;
  final String doctorName;
  final String specialty;
  final DateTime dateTime;
  final String location;
  final AppointmentStatus status;

  const AppointmentEntity({
    required this.id,
    required this.doctorName,
    required this.specialty,
    required this.dateTime,
    required this.location,
    required this.status,
  });
}

class MemoryEntity {
  final String id;
  final String title;
  final String location;
  final String year;
  final String description;
  final String imageUrl;
  final List<String> people;
  final List<String> tags;

  const MemoryEntity({
    required this.id,
    required this.title,
    required this.location,
    required this.year,
    required this.description,
    required this.imageUrl,
    required this.people,
    required this.tags,
  });
}

class JournalEntryEntity {
  final String id;
  final String title;
  final String content;
  final DateTime timestamp;

  const JournalEntryEntity({
    required this.id,
    required this.title,
    required this.content,
    required this.timestamp,
  });
}

class TrackingObservationEntity {
  final String category;
  final double score; // 0.0 to 10.0
  final String trend; // 'stable', 'improving', 'needs_support'
  final String summary;

  const TrackingObservationEntity({
    required this.category,
    required this.score,
    required this.trend,
    required this.summary,
  });
}

enum AgentActionStatus { processing, completed, failed }

class AgentActionEntity {
  final String id;
  final String actionType;
  final String title;
  final String description;
  final AgentActionStatus status;
  final DateTime timestamp;

  const AgentActionEntity({
    required this.id,
    required this.actionType,
    required this.title,
    required this.description,
    required this.status,
    required this.timestamp,
  });
}

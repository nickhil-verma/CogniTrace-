import '../../domain/entities/cognitrace_entities.dart';
import '../../domain/repositories/cognitrace_repositories.dart';
import '../datasources/remote/cognitrace_api.dart';

class PatientRepositoryImpl implements PatientRepository {
  final CogniTraceApi _api;

  PatientRepositoryImpl(this._api);

  @override
  Future<PatientEntity> getPatientSummary(String patientId) async {
    final data = await _api.getPatientSummary(patientId);

    final indicators =
        (data['clinicalIndicators'] as List<dynamic>? ?? [])
            .map((e) => e.toString())
            .toList();

    return PatientEntity(
      id: data['patientId']?.toString() ?? patientId,
      name: data['name']?.toString() ?? 'Patient',
      relation: 'Patient',
      careStage: data['riskTier']?.toString() ?? 'NORMAL',
      stageDescription:
          'Risk score: ${data['riskScore'] ?? 0.0}',
      recentObservations: indicators,
      upcomingCare: const [],
    );
  }
}

class CareRepositoryImpl implements CareRepository {
  final CogniTraceApi _api;
  final List<ReminderEntity> _localReminders = [];
  final List<AppointmentEntity> _localAppointments = [];

  CareRepositoryImpl(this._api);

  @override
  Future<List<ReminderEntity>> getReminders() async {
    return List.unmodifiable(_localReminders);
  }

  @override
  Future<ReminderEntity> createReminder(
    String title,
    DateTime dateTime,
    String category,
  ) async {
    final response = await _api.createReminder({
      'title': title,
      'time':
          '${dateTime.hour.toString().padLeft(2, '0')}:'
          '${dateTime.minute.toString().padLeft(2, '0')}',
      'patientId': 'patient_mom_01',
    });

    final reminderData =
        response['reminder'] as Map<String, dynamic>? ?? {};

    final reminder = ReminderEntity(
      id: response['id']?.toString() ??
          'rem_${DateTime.now().millisecondsSinceEpoch}',
      title: reminderData['title']?.toString() ?? title,
      dateTime: dateTime,
      category: category,
      status: ReminderStatus.upcoming,
    );

    _localReminders.insert(0, reminder);
    return reminder;
  }

  @override
  Future<void> toggleReminder(String id) async {
    final index = _localReminders.indexWhere((r) => r.id == id);

    if (index != -1) {
      final current = _localReminders[index];

      _localReminders[index] = ReminderEntity(
        id: current.id,
        title: current.title,
        dateTime: current.dateTime,
        category: current.category,
        status: current.status == ReminderStatus.completed
            ? ReminderStatus.upcoming
            : ReminderStatus.completed,
      );
    }
  }

  @override
  Future<List<AppointmentEntity>> getAppointments() async {
    return List.unmodifiable(_localAppointments);
  }

  @override
  Future<AppointmentEntity> createAppointment(
    String doctorName,
    String specialty,
    DateTime dateTime,
    String location,
  ) async {
    final response = await _api.createAppointment({
      'title': specialty.isNotEmpty
          ? '$specialty Follow-up'
          : 'Medical Appointment',
      'date':
          '${dateTime.year.toString().padLeft(4, '0')}-'
          '${dateTime.month.toString().padLeft(2, '0')}-'
          '${dateTime.day.toString().padLeft(2, '0')}',
      'doctor': doctorName,
      'patientId': 'patient_mom_01',
    });

    final appointmentData =
        response['appointment'] as Map<String, dynamic>? ?? {};

    final appointment = AppointmentEntity(
      id: response['id']?.toString() ??
          'apt_${DateTime.now().millisecondsSinceEpoch}',
      doctorName:
          appointmentData['doctor']?.toString() ?? doctorName,
      specialty: specialty,
      dateTime: dateTime,
      location: location,
      status: AppointmentStatus.scheduled,
    );

    _localAppointments.insert(0, appointment);
    return appointment;
  }
}

class MemoryRepositoryImpl implements MemoryRepository {
  final CogniTraceApi _api;

  MemoryRepositoryImpl(this._api);

  @override
  Future<List<MemoryEntity>> getMemories() async {
    return const [];
  }

  @override
  Future<MemoryEntity> getMemoryDetail(String id) async {
    throw UnimplementedError(
      'Memory details are not currently exposed by the backend.',
    );
  }

  @override
  Future<String> sendReminiscencePrompt(
    String memoryId,
    String promptText,
  ) async {
    final response = await _api.sendReminiscencePrompt({
      'memory_id': memoryId,
      'description': promptText,
    });

    return response['prompt']?.toString() ?? '';
  }
}

class VoiceRepositoryImpl implements VoiceRepository {
  final CogniTraceApi _api;

  VoiceRepositoryImpl(this._api);

  @override
  Future<Map<String, dynamic>> sendAudioTaskTurn({
    required String audioPath,
    required String patientId,
    String? language,
  }) {
    return _api.sendAudioTaskTurn(
      audioPath: audioPath,
      patientId: patientId,
      language: language,
    );
  }
}

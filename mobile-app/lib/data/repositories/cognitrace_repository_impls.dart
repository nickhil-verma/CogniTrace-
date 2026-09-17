import '../../domain/entities/cognitrace_entities.dart';
import '../../domain/repositories/cognitrace_repositories.dart';
import '../datasources/remote/mock_cognitrace_api.dart';
import '../datasources/remote/cognitrace_api.dart';

class PatientRepositoryImpl implements PatientRepository {
  final MockCogniTraceApi _mockApi;

  PatientRepositoryImpl(this._mockApi);

  @override
  Future<PatientEntity> getPatientSummary(String patientId) {
    return _mockApi.getPatientSummary(patientId);
  }
}

class CareRepositoryImpl implements CareRepository {
  final MockCogniTraceApi _mockApi;
  final List<ReminderEntity> _localReminders = [];
  final List<AppointmentEntity> _localAppointments = [];

  CareRepositoryImpl(this._mockApi);

  @override
  Future<List<ReminderEntity>> getReminders() async {
    if (_localReminders.isEmpty) {
      final mock = await _mockApi.getReminders();
      _localReminders.addAll(mock);
    }
    return List.unmodifiable(_localReminders);
  }

  @override
  Future<ReminderEntity> createReminder(String title, DateTime dateTime, String category) async {
    final reminder = ReminderEntity(
      id: 'rem_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
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
    if (_localAppointments.isEmpty) {
      final mock = await _mockApi.getAppointments();
      _localAppointments.addAll(mock);
    }
    return List.unmodifiable(_localAppointments);
  }

  @override
  Future<AppointmentEntity> createAppointment(
    String doctorName,
    String specialty,
    DateTime dateTime,
    String location,
  ) async {
    final appointment = AppointmentEntity(
      id: 'app_${DateTime.now().millisecondsSinceEpoch}',
      doctorName: doctorName,
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
  final MockCogniTraceApi _mockApi;

  MemoryRepositoryImpl(this._mockApi);

  @override
  Future<List<MemoryEntity>> getMemories() => _mockApi.getMemories();

  @override
  Future<MemoryEntity> getMemoryDetail(String id) async {
    final memories = await _mockApi.getMemories();
    return memories.firstWhere(
      (m) => m.id == id,
      orElse: () => memories.first,
    );
  }

  @override
  Future<String> sendReminiscencePrompt(String memoryId, String promptText) async {
    await Future.delayed(const Duration(milliseconds: 1200));
    return "That memory from Goa was wonderful! Mom remembers walking along the tide with Rahul and laughing as the gentle waves touched her feet.";
  }
}

class VoiceRepositoryImpl implements VoiceRepository {
  final MockCogniTraceApi _mockApi;

  VoiceRepositoryImpl(this._mockApi);

  @override
  Future<Map<String, dynamic>> sendAudioTaskTurn({
    required String audioPath,
    required String patientId,
    String? language,
  }) async {
    return _mockApi.sendAudioTaskTurn(
      audioPath: audioPath,
      patientId: patientId,
      language: language,
    );
  }
}

import '../entities/cognitrace_entities.dart';

abstract class PatientRepository {
  Future<PatientEntity> getPatientSummary(String patientId);
}

abstract class CareRepository {
  Future<List<ReminderEntity>> getReminders();
  Future<ReminderEntity> createReminder(String title, DateTime dateTime, String category);
  Future<void> toggleReminder(String id);
  Future<List<AppointmentEntity>> getAppointments();
  Future<AppointmentEntity> createAppointment(String doctorName, String specialty, DateTime dateTime, String location);
}

abstract class MemoryRepository {
  Future<List<MemoryEntity>> getMemories();
  Future<MemoryEntity> getMemoryDetail(String id);
  Future<String> sendReminiscencePrompt(String memoryId, String promptText);
}

abstract class VoiceRepository {
  Future<Map<String, dynamic>> sendAudioTaskTurn({
    required String audioPath,
    required String patientId,
    String? language,
  });
}

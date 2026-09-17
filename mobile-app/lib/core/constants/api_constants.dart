/// API Constants and Endpoint definitions for CogniTrace backend integration.
abstract class ApiConstants {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000',
  );

  static const bool useMockApi = bool.fromEnvironment(
    'USE_MOCK_API',
    defaultValue: true,
  );

  static const String caretakerReminders = '/v1/caretaker/reminders';
  static const String memoryUploadUrl = '/v1/caretaker/memories/upload-url';
  static const String caretakerAppointments = '/v1/caretaker/appointments';
  static String patientSummary(String patientId) => '/v1/caretaker/patient/$patientId/summary';
  static const String audioTaskTurn = '/v1/patient/audio-task-turn';
  static const String reminiscencePrompt = '/v1/patient/reminiscence/prompt';
  static const String telemetrySync = '/v1/patient/telemetry/sync';
}

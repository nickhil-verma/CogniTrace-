import 'package:dio/dio.dart';

class CogniTraceApi {
  final Dio _dio;
  final String baseUrl;

  CogniTraceApi({
    required Dio dio,
    required this.baseUrl,
  }) : _dio = dio;

  /// POST /v1/patient/audio-task-turn
  Future<Map<String, dynamic>> sendAudioTaskTurn({
    required String audioPath,
    required String patientId,
    String? language,
  }) async {
    final formData = FormData.fromMap({
      'audio': await MultipartFile.fromFile(audioPath, filename: 'voice_command.aac'),
      'patient_id': patientId,
      if (language != null) 'language': language,
    });

    final response = await _dio.post(
      '$baseUrl/v1/patient/audio-task-turn',
      data: formData,
    );

    return response.data as Map<String, dynamic>;
  }

  /// POST /v1/caretaker/reminders
  Future<Map<String, dynamic>> createReminder(Map<String, dynamic> data) async {
    final response = await _dio.post(
      '$baseUrl/v1/caretaker/reminders',
      data: data,
    );
    return response.data as Map<String, dynamic>;
  }

  /// POST /v1/caretaker/appointments
  Future<Map<String, dynamic>> createAppointment(Map<String, dynamic> data) async {
    final response = await _dio.post(
      '$baseUrl/v1/caretaker/appointments',
      data: data,
    );
    return response.data as Map<String, dynamic>;
  }

  /// GET /v1/caretaker/patient/{patient_id}/summary
  Future<Map<String, dynamic>> getPatientSummary(String patientId) async {
    final response = await _dio.get(
      '$baseUrl/v1/caretaker/patient/$patientId/summary',
    );
    return response.data as Map<String, dynamic>;
  }

  /// POST /v1/patient/reminiscence/prompt
  Future<Map<String, dynamic>> sendReminiscencePrompt(Map<String, dynamic> data) async {
    final response = await _dio.post(
      '$baseUrl/v1/patient/reminiscence/prompt',
      data: data,
    );
    return response.data as Map<String, dynamic>;
  }

  /// POST /v1/patient/telemetry/sync
  Future<void> syncTelemetry(Map<String, dynamic> telemetryData) async {
    await _dio.post(
      '$baseUrl/v1/patient/telemetry/sync',
      data: telemetryData,
    );
  }
}

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static const String keyAuthToken = 'cognitrace_auth_token';
  static const String keyPatientId = 'cognitrace_patient_id';
  static const String keySelectedLanguage = 'cognitrace_language';

  Future<void> saveAuthToken(String token) async {
    await _storage.write(key: keyAuthToken, value: token);
  }

  Future<String?> getAuthToken() async {
    return await _storage.read(key: keyAuthToken);
  }

  Future<void> savePatientId(String patientId) async {
    await _storage.write(key: keyPatientId, value: patientId);
  }

  Future<String> getPatientId() async {
    return await _storage.read(key: keyPatientId) ?? 'patient_mom_01';
  }

  Future<void> saveLanguage(String lang) async {
    await _storage.write(key: keySelectedLanguage, value: lang);
  }

  Future<String> getLanguage() async {
    return await _storage.read(key: keySelectedLanguage) ?? 'en';
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}

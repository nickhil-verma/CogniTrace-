import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/cognitrace_entities.dart';
import '../../data/datasources/remote/mock_cognitrace_api.dart';
import '../../data/repositories/cognitrace_repository_impls.dart';

final mockApiProvider = Provider((ref) => MockCogniTraceApi());

final patientRepositoryProvider = Provider((ref) {
  return PatientRepositoryImpl(ref.watch(mockApiProvider));
});

final careRepositoryProvider = Provider((ref) {
  return CareRepositoryImpl(ref.watch(mockApiProvider));
});

final memoryRepositoryProvider = Provider((ref) {
  return MemoryRepositoryImpl(ref.watch(mockApiProvider));
});

// Patient State
final patientSummaryProvider = FutureProvider<PatientEntity>((ref) async {
  final repo = ref.watch(patientRepositoryProvider);
  return repo.getPatientSummary('patient_mom_01');
});

// Care Reminders & Appointments Notifier
class CareNotifier extends StateNotifier<AsyncValue<List<ReminderEntity>>> {
  final CareRepositoryImpl _repo;

  CareNotifier(this._repo) : super(const AsyncValue.loading()) {
    loadReminders();
  }

  Future<void> loadReminders() async {
    try {
      state = const AsyncValue.loading();
      final list = await _repo.getReminders();
      state = AsyncValue.data(list);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> createReminder(String title, DateTime time, String category) async {
    await _repo.createReminder(title, time, category);
    await loadReminders();
  }

  Future<void> toggleReminder(String id) async {
    await _repo.toggleReminder(id);
    await loadReminders();
  }
}

final remindersProvider =
    StateNotifierProvider<CareNotifier, AsyncValue<List<ReminderEntity>>>((ref) {
  return CareNotifier(ref.watch(careRepositoryProvider));
});

final appointmentsProvider = FutureProvider<List<AppointmentEntity>>((ref) async {
  final repo = ref.watch(careRepositoryProvider);
  return repo.getAppointments();
});

// Memories Provider
final memoriesProvider = FutureProvider<List<MemoryEntity>>((ref) async {
  final repo = ref.watch(memoryRepositoryProvider);
  return repo.getMemories();
});

// Journal Provider
final journalProvider = FutureProvider<List<JournalEntryEntity>>((ref) async {
  final api = ref.watch(mockApiProvider);
  return api.getJournalEntries();
});

// Tracking Observations Provider
final trackingObservationsProvider =
    FutureProvider<List<TrackingObservationEntity>>((ref) async {
  final api = ref.watch(mockApiProvider);
  return api.getTrackingObservations();
});

// Language Provider
class LanguageNotifier extends StateNotifier<String> {
  LanguageNotifier() : super('en'); // en, hi, bn, as

  void selectLanguage(String code) {
    state = code;
  }
}

final languageProvider = StateNotifierProvider<LanguageNotifier, String>((ref) {
  return LanguageNotifier();
});

// Auth Provider
class AuthNotifier extends StateNotifier<bool> {
  AuthNotifier() : super(true); // default logged in for smooth preview

  void login(String email, String password) {
    state = true;
  }

  void logout() {
    state = false;
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, bool>((ref) {
  return AuthNotifier();
});

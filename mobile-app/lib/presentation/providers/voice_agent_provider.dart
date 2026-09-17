import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/cognitrace_entities.dart';
import '../../services/voice_recorder_service.dart';
import '../../data/datasources/remote/mock_cognitrace_api.dart';

enum VoiceAgentStatus {
  idle,
  listening,
  processing,
  executing,
  speaking,
  error,
}

class VoiceAgentState {
  final VoiceAgentStatus status;
  final String? transcript;
  final String? responseText;
  final List<AgentActionEntity> actions;
  final String? errorMessage;
  final int recordingDurationSeconds;

  const VoiceAgentState({
    required this.status,
    this.transcript,
    this.responseText,
    this.actions = const [],
    this.errorMessage,
    this.recordingDurationSeconds = 0,
  });

  VoiceAgentState copyWith({
    VoiceAgentStatus? status,
    String? transcript,
    String? responseText,
    List<AgentActionEntity>? actions,
    String? errorMessage,
    int? recordingDurationSeconds,
  }) {
    return VoiceAgentState(
      status: status ?? this.status,
      transcript: transcript ?? this.transcript,
      responseText: responseText ?? this.responseText,
      actions: actions ?? this.actions,
      errorMessage: errorMessage,
      recordingDurationSeconds: recordingDurationSeconds ?? this.recordingDurationSeconds,
    );
  }
}

class VoiceAgentNotifier extends StateNotifier<VoiceAgentState> {
  final VoiceRecorderService _recorder = VoiceRecorderService();
  final MockCogniTraceApi _api = MockCogniTraceApi();

  VoiceAgentNotifier()
      : super(const VoiceAgentState(status: VoiceAgentStatus.idle));

  Future<void> toggleRecording() async {
    if (state.status == VoiceAgentStatus.idle || state.status == VoiceAgentStatus.error) {
      await startListening();
    } else if (state.status == VoiceAgentStatus.listening) {
      await stopAndProcess();
    }
  }

  Future<void> startListening() async {
    final started = await _recorder.startRecording();
    if (started) {
      state = state.copyWith(
        status: VoiceAgentStatus.listening,
        transcript: null,
        responseText: null,
        errorMessage: null,
      );
    } else {
      state = state.copyWith(
        status: VoiceAgentStatus.error,
        errorMessage: 'Microphone permission denied. Please allow microphone access in settings.',
      );
    }
  }

  Future<void> stopAndProcess() async {
    final audioPath = await _recorder.stopRecording();
    if (audioPath == null) {
      state = state.copyWith(
        status: VoiceAgentStatus.error,
        errorMessage: 'Could not process audio recording.',
      );
      return;
    }

    // Move to processing
    state = state.copyWith(status: VoiceAgentStatus.processing);

    try {
      final response = await _api.sendAudioTaskTurn(
        audioPath: audioPath,
        patientId: 'patient_mom_01',
      );

      final transcript = response['transcript'] as String?;
      final responseText = response['response_text'] as String?;
      final rawActions = (response['actions'] as List<dynamic>?) ?? [];

      final actions = rawActions.map((a) {
        return AgentActionEntity(
          id: a['id'] ?? 'act',
          actionType: a['action_type'] ?? 'action',
          title: a['title'] ?? 'Care Action',
          description: a['description'] ?? '',
          status: AgentActionStatus.completed,
          timestamp: DateTime.now(),
        );
      }).toList();

      // Show executing phase briefly if actions exist
      if (actions.isNotEmpty) {
        state = state.copyWith(
          status: VoiceAgentStatus.executing,
          transcript: transcript,
          actions: actions,
        );
        await Future.delayed(const Duration(milliseconds: 900));
      }

      // Show speaking state for audio response
      state = state.copyWith(
        status: VoiceAgentStatus.speaking,
        transcript: transcript,
        responseText: responseText,
        actions: actions,
      );

      // Return to idle after speech finishes
      await Future.delayed(const Duration(seconds: 4));
      state = state.copyWith(status: VoiceAgentStatus.idle);
    } catch (e) {
      state = state.copyWith(
        status: VoiceAgentStatus.error,
        errorMessage: "CogniTrace couldn't reach the care service. Please try again.",
      );
    }
  }

  void resetToIdle() {
    state = const VoiceAgentState(status: VoiceAgentStatus.idle);
  }

  @override
  void dispose() {
    _recorder.dispose();
    super.dispose();
  }
}

final voiceAgentProvider =
    StateNotifierProvider<VoiceAgentNotifier, VoiceAgentState>((ref) {
  return VoiceAgentNotifier();
});

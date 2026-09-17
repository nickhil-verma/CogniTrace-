import 'dart:async';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';

class VoiceRecorderService {
  final AudioRecorder _audioRecorder = AudioRecorder();
  bool _isRecording = false;
  String? _currentPath;

  bool get isRecording => _isRecording;

  Future<bool> requestMicrophonePermission() async {
    final status = await Permission.microphone.request();
    return status.isGranted;
  }

  Future<bool> startRecording() async {
    final hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return false;

    if (await _audioRecorder.hasPermission()) {
      final dir = await getTemporaryDirectory();
      _currentPath = '${dir.path}/cognitrace_input_${DateTime.now().millisecondsSinceEpoch}.m4a';

      await _audioRecorder.start(
        const RecordConfig(encoder: AudioEncoder.aacLc),
        path: _currentPath!,
      );
      _isRecording = true;
      return true;
    }
    return false;
  }

  Future<String?> stopRecording() async {
    if (!_isRecording) return null;
    final path = await _audioRecorder.stop();
    _isRecording = false;
    return path ?? _currentPath;
  }

  void dispose() {
    _audioRecorder.dispose();
  }
}

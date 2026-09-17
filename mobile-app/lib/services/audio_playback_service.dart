import 'package:just_audio/just_audio.dart';

class AudioPlaybackService {
  final AudioPlayer _audioPlayer = AudioPlayer();

  Stream<PlayerState> get playerStateStream => _audioPlayer.playerStateStream;

  Future<void> playUrl(String url) async {
    try {
      await _audioPlayer.setUrl(url);
      await _audioPlayer.play();
    } catch (e) {
      // Fallback or handle gracefully
    }
  }

  Future<void> stop() async {
    await _audioPlayer.stop();
  }

  void dispose() {
    _audioPlayer.dispose();
  }
}

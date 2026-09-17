import '../data/datasources/remote/cognitrace_api.dart';

class TelemetryEvent {
  final String eventName;
  final DateTime timestamp;
  final Map<String, dynamic>? metadata;

  TelemetryEvent({
    required this.eventName,
    required this.timestamp,
    this.metadata,
  });

  Map<String, dynamic> toJson() => {
        'event': eventName,
        'timestamp': timestamp.toIso8601String(),
        if (metadata != null) 'metadata': metadata,
      };
}

class TelemetryService {
  final CogniTraceApi? _api;

  TelemetryService({CogniTraceApi? api}) : _api = api;

  Future<void> logEvent(String eventName, [Map<String, dynamic>? metadata]) async {
    final event = TelemetryEvent(
      eventName: eventName,
      timestamp: DateTime.now(),
      metadata: metadata,
    );
    try {
      if (_api != null) {
        await _api.syncTelemetry(event.toJson());
      }
    } catch (_) {
      // Telemetry failures should never interrupt UI
    }
  }
}

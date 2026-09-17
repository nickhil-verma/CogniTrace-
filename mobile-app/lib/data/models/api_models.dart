import '../../domain/entities/cognitrace_entities.dart';

class AudioTurnResponseModel {
  final String transcript;
  final String responseText;
  final String? audioUrl;
  final List<AgentActionModel> actions;
  final String status;

  AudioTurnResponseModel({
    required this.transcript,
    required this.responseText,
    this.audioUrl,
    required this.actions,
    required this.status,
  });

  factory AudioTurnResponseModel.fromJson(Map<String, dynamic> json) {
    return AudioTurnResponseModel(
      transcript: json['transcript'] ?? '',
      responseText: json['response_text'] ?? json['responseText'] ?? '',
      audioUrl: json['audio_url'] ?? json['audioUrl'],
      actions: (json['actions'] as List<dynamic>?)
              ?.map((a) => AgentActionModel.fromJson(a))
              .toList() ??
          [],
      status: json['status'] ?? 'completed',
    );
  }
}

class AgentActionModel {
  final String id;
  final String actionType;
  final String title;
  final String description;
  final String status;
  final String timestamp;

  AgentActionModel({
    required this.id,
    required this.actionType,
    required this.title,
    required this.description,
    required this.status,
    required this.timestamp,
  });

  factory AgentActionModel.fromJson(Map<String, dynamic> json) {
    return AgentActionModel(
      id: json['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
      actionType: json['action_type'] ?? json['actionType'] ?? 'general',
      title: json['title'] ?? 'Care Action',
      description: json['description'] ?? '',
      status: json['status'] ?? 'completed',
      timestamp: json['timestamp'] ?? DateTime.now().toIso8601String(),
    );
  }

  AgentActionEntity toEntity() {
    return AgentActionEntity(
      id: id,
      actionType: actionType,
      title: title,
      description: description,
      status: status == 'completed'
          ? AgentActionStatus.completed
          : status == 'failed'
              ? AgentActionStatus.failed
              : AgentActionStatus.processing,
      timestamp: DateTime.tryParse(timestamp) ?? DateTime.now(),
    );
  }
}

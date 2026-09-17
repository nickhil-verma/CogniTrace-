import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/organic_background.dart';
import '../../providers/care_providers.dart';
import '../../providers/voice_agent_provider.dart';
import '../../widgets/voice/voice_orb.dart';

class ReminiscenceScreen extends ConsumerWidget {
  final String memoryId;

  const ReminiscenceScreen({
    super.key,
    required this.memoryId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final memoriesAsync = ref.watch(memoriesProvider);
    final voiceState = ref.watch(voiceAgentProvider);
    final voiceNotifier = ref.read(voiceAgentProvider.notifier);

    return OrganicBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.close_rounded,
                size: 28, color: AppColors.primaryText),
            onPressed: () => context.pop(),
          ),
          title: const Text('Reminiscence Moment'),
        ),
        body: memoriesAsync.when(
          data: (memories) {
            final memory = memories.firstWhere(
              (m) => m.id == memoryId,
              orElse: () => memories.first,
            );

            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Column(
                children: [
                  // Memory Card Header
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: AppRadius.largeBorderRadius,
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: AppRadius.smallBorderRadius,
                          child: SizedBox(
                            width: 64,
                            height: 64,
                            child: CachedNetworkImage(
                              imageUrl: memory.imageUrl,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                memory.title,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primaryText,
                                ),
                              ),
                              Text(
                                '${memory.location} · ${memory.year}',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.pink,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const Spacer(),

                  // Conversational Voice Prompt Box
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: AppRadius.heroBorderRadius,
                      border: Border.all(color: AppColors.mint),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x14123B35),
                          blurRadius: 20,
                          offset: Offset(0, 6),
                        )
                      ],
                    ),
                    child: Text(
                      voiceState.responseText ??
                          '"Mom, do you remember our trip to ${memory.location} in ${memory.year}?"',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        height: 1.4,
                        color: AppColors.primaryText,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),

                  const Spacer(),

                  // Animated Voice Orb for Reminiscence Dialogue
                  VoiceOrb(
                    status: voiceState.status,
                    size: 160,
                    onTap: () => voiceNotifier.toggleRecording(),
                  ),

                  const Spacer(),

                  // Large Mic Trigger Button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor:
                            voiceState.status == VoiceAgentStatus.listening
                                ? AppColors.pink
                                : AppColors.deepTeal,
                        shape: RoundedRectangleBorder(
                          borderRadius: AppRadius.pillBorderRadius,
                        ),
                      ),
                      onPressed: () => voiceNotifier.toggleRecording(),
                      icon: Icon(
                        voiceState.status == VoiceAgentStatus.listening
                            ? Icons.stop_rounded
                            : Icons.mic_rounded,
                        color: Colors.white,
                      ),
                      label: Text(
                        voiceState.status == VoiceAgentStatus.listening
                            ? "Stop & Share"
                            : "🎙 Talk about this memory",
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            );
          },
          loading: () => const Center(
              child: CircularProgressIndicator(color: AppColors.deepTeal)),
          error: (_, __) => const SizedBox.shrink(),
        ),
      ),
    );
  }
}

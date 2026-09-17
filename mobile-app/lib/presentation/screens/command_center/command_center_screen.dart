import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/organic_background.dart';
import '../../providers/voice_agent_provider.dart';
import '../../widgets/voice/voice_orb.dart';
import '../../widgets/voice/agent_timeline.dart';
import '../../widgets/voice/suggested_command.dart';

class CommandCenterScreen extends ConsumerWidget {
  const CommandCenterScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final voiceState = ref.watch(voiceAgentProvider);
    final voiceNotifier = ref.read(voiceAgentProvider.notifier);

    return OrganicBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.close_rounded, size: 28, color: AppColors.primaryText),
            onPressed: () => context.pop(),
          ),
          title: const Row(
            children: [
              Icon(Icons.auto_awesome, color: AppColors.deepTeal, size: 20),
              SizedBox(width: 8),
              Text(
                'CogniTrace Agent',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryText,
                ),
              ),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh_rounded, color: AppColors.secondaryText),
              onPressed: () => voiceNotifier.resetToIdle(),
            ),
          ],
        ),
        body: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Column(
            children: [
              const SizedBox(height: 8),
              const Text(
                'How can I help with care today?',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.5,
                  color: AppColors.primaryText,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              const Text(
                'Talk naturally to inspect health patterns or run care actions.',
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.secondaryText,
                ),
                textAlign: TextAlign.center,
              ),

              const Spacer(),

              // Center Animated Voice Orb
              VoiceOrb(
                status: voiceState.status,
                size: 170,
                onTap: () => voiceNotifier.toggleRecording(),
              ),

              const Spacer(),

              // AI Transcript & Response Text Container
              if (voiceState.transcript != null || voiceState.responseText != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: AppRadius.mediumBorderRadius,
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (voiceState.transcript != null) ...[
                        Row(
                          children: [
                            const Icon(Icons.person_outline,
                                size: 16, color: AppColors.secondaryText),
                            const SizedBox(width: 6),
                            Text(
                              'You: "${voiceState.transcript}"',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.secondaryText,
                              ),
                            ),
                          ],
                        ),
                        if (voiceState.responseText != null)
                          const Divider(height: 16, color: AppColors.border),
                      ],
                      if (voiceState.responseText != null) ...[
                        Row(
                          children: [
                            const Icon(Icons.auto_awesome,
                                size: 16, color: AppColors.deepTeal),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                voiceState.responseText!,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  height: 1.4,
                                  color: AppColors.primaryText,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),

              // Agent Execution Timeline Steps
              if (voiceState.actions.isNotEmpty)
                AgentTimeline(actions: voiceState.actions),

              // Microphone Tap Action Button
              GestureDetector(
                onTap: () => voiceNotifier.toggleRecording(),
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: voiceState.status == VoiceAgentStatus.listening
                          ? [AppColors.pink, AppColors.error]
                          : [AppColors.deepTeal, AppColors.accentGreen],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x3D17665B),
                        blurRadius: 20,
                        offset: Offset(0, 6),
                      )
                    ],
                  ),
                  child: Center(
                    child: Icon(
                      voiceState.status == VoiceAgentStatus.listening
                          ? Icons.stop_rounded
                          : Icons.mic_rounded,
                      size: 34,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                voiceState.status == VoiceAgentStatus.listening
                    ? "Tap to complete voice command"
                    : "Tap microphone to speak",
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.secondaryText,
                ),
              ),

              const SizedBox(height: 20),

              // Suggested Commands horizontal list
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    SuggestedCommandPill(
                      title: "How has Mom been doing?",
                      onTap: () => voiceNotifier.toggleRecording(),
                    ),
                    const SizedBox(width: 8),
                    SuggestedCommandPill(
                      title: "Remind me about her medicine",
                      onTap: () => voiceNotifier.toggleRecording(),
                    ),
                    const SizedBox(width: 8),
                    SuggestedCommandPill(
                      title: "What changed this month?",
                      onTap: () => voiceNotifier.toggleRecording(),
                    ),
                    const SizedBox(width: 8),
                    SuggestedCommandPill(
                      title: "Show recent memories",
                      onTap: () => voiceNotifier.toggleRecording(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}

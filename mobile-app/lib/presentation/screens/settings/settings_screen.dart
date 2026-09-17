import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/organic_background.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return OrganicBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded,
                color: AppColors.primaryText),
            onPressed: () => context.pop(),
          ),
          title: const Text('Settings & Preferences'),
        ),
        body: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          children: [
            Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: AppRadius.largeBorderRadius,
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.mic_outlined, color: AppColors.deepTeal),
                    title: const Text('Microphone Permission'),
                    subtitle: const Text('Enabled'),
                    trailing: const Icon(Icons.check_circle, color: AppColors.accentGreen),
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.volume_up_outlined, color: AppColors.deepTeal),
                    title: const Text('Polly Audio Playback'),
                    subtitle: const Text('Speech synthesis output enabled'),
                    trailing: Switch(
                      value: true,
                      onChanged: (v) {},
                      activeColor: AppColors.deepTeal,
                    ),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.cloud_off_rounded, color: AppColors.deepTeal),
                    title: const Text('Offline Mock Mode'),
                    subtitle: const Text('Simulate AI response when offline'),
                    trailing: Switch(
                      value: true,
                      onChanged: (v) {},
                      activeColor: AppColors.deepTeal,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.error,
                  side: const BorderSide(color: AppColors.error),
                ),
                onPressed: () => context.go('/login'),
                child: const Text('Sign Out'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

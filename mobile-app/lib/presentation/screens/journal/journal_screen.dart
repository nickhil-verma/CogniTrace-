import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/organic_background.dart';
import '../../providers/care_providers.dart';

class JournalScreen extends ConsumerWidget {
  const JournalScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final journalAsync = ref.watch(journalProvider);

    return OrganicBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded,
                color: AppColors.primaryText),
            onPressed: () => context.pop(),
          ),
          title: const Text('Caregiver Journal'),
          actions: [
            TextButton.icon(
              onPressed: () => context.push('/command-center'),
              icon: const Icon(Icons.auto_awesome, size: 16, color: AppColors.deepTeal),
              label: const Text('Summarize week', style: TextStyle(color: AppColors.deepTeal)),
            ),
          ],
        ),
        floatingActionButton: FloatingActionButton.extended(
          backgroundColor: AppColors.deepTeal,
          onPressed: () {},
          icon: const Icon(Icons.edit_rounded, color: Colors.white),
          label: const Text('New Entry', style: TextStyle(color: Colors.white)),
        ),
        body: journalAsync.when(
          data: (entries) {
            return ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              itemCount: entries.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (context, index) {
                final entry = entries[index];
                return Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: AppRadius.largeBorderRadius,
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            entry.title,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryText,
                            ),
                          ),
                          Text(
                            DateFormat('h:mm a').format(entry.timestamp),
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.secondaryText,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        entry.content,
                        style: const TextStyle(
                          fontSize: 14,
                          height: 1.45,
                          color: AppColors.secondaryText,
                        ),
                      ),
                    ],
                  ),
                );
              },
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

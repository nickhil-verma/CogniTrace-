import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/organic_background.dart';

class InsightsScreen extends StatelessWidget {
  const InsightsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return OrganicBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded,
                color: AppColors.primaryText),
            onPressed: () => context.pop(),
          ),
          title: const Text('Care Insights'),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Card: What changed?
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.deepTeal, AppColors.accentGreen],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: AppRadius.heroBorderRadius,
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x2917665B),
                      blurRadius: 20,
                      offset: Offset(0, 8),
                    )
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'What changed?',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Over the last 6 months, CogniTrace AI synthesized 48 caregiver journal entries & daily check-ins.',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.mint,
                        height: 1.45,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.deepTeal,
                      ),
                      onPressed: () => context.push('/command-center'),
                      icon: const Icon(Icons.mic_rounded, size: 18),
                      label: const Text('Ask CogniTrace Agent'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const Text(
                'Observation Timeline',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryText,
                ),
              ),
              const SizedBox(height: 14),

              _TimelineInsightCard(
                month: 'September 2026',
                title: 'High engagement in music reminiscence',
                description: 'Mom recognized songs from 1980s quickly. Evening memory recall remains stable.',
                badge: 'Stable',
              ),
              const SizedBox(height: 12),
              _TimelineInsightCard(
                month: 'August 2026',
                title: 'Evening routine support requested',
                description: 'Logged slight confusion around medication timing. Reminders set for 8:00 PM.',
                badge: 'Adapted',
              ),
              const SizedBox(height: 12),
              _TimelineInsightCard(
                month: 'July 2026',
                title: 'Increased social warmth during walks',
                description: 'Positive interactions with neighbors in morning garden walks.',
                badge: 'Positive',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TimelineInsightCard extends StatelessWidget {
  final String month;
  final String title;
  final String description;
  final String badge;

  const _TimelineInsightCard({
    required this.month,
    required this.title,
    required this.description,
    required this.badge,
  });

  @override
  Widget build(BuildContext context) {
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
                month,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.pink,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.mint.withOpacity(0.4),
                  borderRadius: AppRadius.pillBorderRadius,
                ),
                child: Text(
                  badge,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.deepTeal,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.primaryText,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            description,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.secondaryText,
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../providers/care_providers.dart';
import '../../widgets/cards/patient_status_card.dart';
import '../../widgets/cards/reminder_card.dart';
import '../../widgets/common/section_header.dart';
import '../../widgets/common/language_selector.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final patientAsync = ref.watch(patientSummaryProvider);
    final remindersAsync = ref.watch(remindersProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.refresh(patientSummaryProvider);
            ref.read(remindersProvider.notifier).loadReminders();
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header Row with Language Selector & Patient Switcher
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Good morning ☀️',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.5,
                            color: AppColors.primaryText,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          "Here's how things are going with Mom today.",
                          style: TextStyle(
                            fontSize: 13,
                            color: AppColors.secondaryText,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        const LanguageSelector(),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () => context.push('/patient-profile'),
                          child: Container(
                            width: 38,
                            height: 38,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.mint,
                            ),
                            child: const Center(
                              child: Text('👵', style: TextStyle(fontSize: 18)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Visually Dominant AI Command Banner Card
                GestureDetector(
                  onTap: () => context.push('/command-center'),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
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
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.2),
                                  borderRadius: AppRadius.pillBorderRadius,
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.auto_awesome,
                                        size: 14, color: Colors.white),
                                    SizedBox(width: 4),
                                    Text(
                                      'AI Command Center',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 10),
                              const Text(
                                'Talk to CogniTrace',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                '"Remind Mom to take medicine at 8 tonight"',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: AppColors.mint,
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          width: 52,
                          height: 52,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.mic_rounded,
                            size: 28,
                            color: AppColors.deepTeal,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Patient Care Journey Card
                patientAsync.when(
                  data: (patient) => PatientStatusCard(
                    patient: patient,
                    onTap: () => context.push('/patient-profile'),
                  ),
                  loading: () => Container(
                    height: 140,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: AppRadius.largeBorderRadius,
                    ),
                    child: const Center(
                        child: CircularProgressIndicator(color: AppColors.deepTeal)),
                  ),
                  error: (_, __) => const SizedBox.shrink(),
                ),
                const SizedBox(height: 24),

                // Today's Care Checklist Section
                SectionHeader(
                  title: "Today's Care",
                  subtitle: "Scheduled activities & medical tasks",
                  action: TextButton(
                    onPressed: () => context.push('/reminders'),
                    child: const Text('View All',
                        style: TextStyle(color: AppColors.deepTeal)),
                  ),
                ),
                remindersAsync.when(
                  data: (reminders) {
                    return ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollablePhysics(),
                      itemCount: reminders.take(3).length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final r = reminders[index];
                        return ReminderCard(
                          reminder: r,
                          onToggle: (id) {
                            ref
                                .read(remindersProvider.notifier)
                                .toggleReminder(id);
                          },
                        );
                      },
                    );
                  },
                  loading: () => const SizedBox(height: 80),
                  error: (_, __) => const SizedBox.shrink(),
                ),
                const SizedBox(height: 24),

                // Recent Observations Trend Section
                SectionHeader(
                  title: "Recent Observations",
                  subtitle: "Support needs & care patterns",
                  action: TextButton(
                    onPressed: () => context.push('/insights'),
                    child: const Text('Insights',
                        style: TextStyle(color: AppColors.deepTeal)),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: AppRadius.mediumBorderRadius,
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    children: [
                      _TrendItem(
                        icon: Icons.psychology_outlined,
                        title: 'Memory Recall',
                        subtitle: 'Stable in morning, needs evening prompts',
                        trendTag: 'Stable',
                        trendColor: AppColors.accentGreen,
                      ),
                      const Divider(height: 20, color: AppColors.border),
                      _TrendItem(
                        icon: Icons.chat_bubble_outline_rounded,
                        title: 'Communication',
                        subtitle: 'Responds warmly to familiar voice music',
                        trendTag: 'Positive',
                        trendColor: AppColors.deepTeal,
                      ),
                      const Divider(height: 20, color: AppColors.border),
                      _TrendItem(
                        icon: Icons.home_outlined,
                        title: 'Daily Independence',
                        subtitle: 'Gentle support with evening routine',
                        trendTag: 'Needs Support',
                        trendColor: AppColors.warning,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 90), // Bottom padding for floating nav bar
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TrendItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String trendTag;
  final Color trendColor;

  const _TrendItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.trendTag,
    required this.trendColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.mint.withOpacity(0.3),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 20, color: AppColors.deepTeal),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primaryText,
                ),
              ),
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.secondaryText,
                ),
              ),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: trendColor.withOpacity(0.15),
            borderRadius: AppRadius.pillBorderRadius,
          ),
          child: Text(
            trendTag,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: trendColor,
            ),
          ),
        ),
      ],
    );
  }
}

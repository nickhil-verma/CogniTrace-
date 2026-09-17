import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../widgets/common/section_header.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionHeader(
                title: 'Care Features & Tools',
                subtitle: 'Manage care routines, journal & insights',
              ),
              const SizedBox(height: 12),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: AppRadius.largeBorderRadius,
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    _MoreTile(
                      icon: Icons.alarm_rounded,
                      title: 'Reminders',
                      subtitle: 'Medication & care task reminders',
                      onTap: () => context.push('/reminders'),
                    ),
                    const Divider(height: 1),
                    _MoreTile(
                      icon: Icons.calendar_month_rounded,
                      title: 'Appointments',
                      subtitle: 'Doctor & clinic appointment schedule',
                      onTap: () => context.push('/appointments'),
                    ),
                    const Divider(height: 1),
                    _MoreTile(
                      icon: Icons.auto_graph_rounded,
                      title: 'Insights',
                      subtitle: '6-month observation synthesis',
                      onTap: () => context.push('/insights'),
                    ),
                    const Divider(height: 1),
                    _MoreTile(
                      icon: Icons.book_rounded,
                      title: 'Caregiver Journal',
                      subtitle: 'Daily log & weekly AI summaries',
                      onTap: () => context.push('/journal'),
                    ),
                    const Divider(height: 1),
                    _MoreTile(
                      icon: Icons.menu_book_rounded,
                      title: 'Resources',
                      subtitle: 'Editorial caregiving guides',
                      onTap: () => context.push('/resources'),
                    ),
                    const Divider(height: 1),
                    _MoreTile(
                      icon: Icons.person_rounded,
                      title: 'Patient Profile',
                      subtitle: "Mom's care plan details",
                      onTap: () => context.push('/patient-profile'),
                    ),
                    const Divider(height: 1),
                    _MoreTile(
                      icon: Icons.settings_rounded,
                      title: 'Settings',
                      subtitle: 'Permissions, audio & mock mode',
                      onTap: () => context.push('/settings'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 90),
            ],
          ),
        ),
      ),
    );
  }
}

class _MoreTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _MoreTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.mint.withOpacity(0.3),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: AppColors.deepTeal, size: 22),
      ),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w700,
          color: AppColors.primaryText,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(
          fontSize: 12,
          color: AppColors.secondaryText,
        ),
      ),
      trailing: const Icon(Icons.chevron_right_rounded,
          color: AppColors.secondaryText),
      onTap: onTap,
    );
  }
}

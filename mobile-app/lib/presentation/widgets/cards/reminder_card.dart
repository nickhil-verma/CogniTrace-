import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../domain/entities/cognitrace_entities.dart';

class ReminderCard extends StatelessWidget {
  final ReminderEntity reminder;
  final ValueChanged<String>? onToggle;

  const ReminderCard({
    super.key,
    required this.reminder,
    this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final isCompleted = reminder.status == ReminderStatus.completed;
    final dateStr = DateFormat('EEE, MMM d · h:mm a').format(reminder.dateTime);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppRadius.mediumBorderRadius,
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => onToggle?.call(reminder.id),
            child: Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isCompleted ? AppColors.accentGreen : Colors.transparent,
                border: Border.all(
                  color: isCompleted ? AppColors.accentGreen : AppColors.secondaryText,
                  width: 2,
                ),
              ),
              child: isCompleted
                  ? const Icon(Icons.check, size: 18, color: Colors.white)
                  : null,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  reminder.title,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: isCompleted ? AppColors.secondaryText : AppColors.primaryText,
                    decoration: isCompleted ? TextDecoration.lineThrough : null,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  dateStr,
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
              color: AppColors.mint.withOpacity(0.4),
              borderRadius: AppRadius.pillBorderRadius,
            ),
            child: Text(
              reminder.category,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.deepTeal,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

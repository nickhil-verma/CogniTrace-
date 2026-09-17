import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';

class SuggestedCommandPill extends StatelessWidget {
  final String title;
  final VoidCallback onTap;

  const SuggestedCommandPill({
    super.key,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: AppRadius.pillBorderRadius,
          border: Border.all(color: AppColors.border),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0A123B35),
              blurRadius: 8,
              offset: Offset(0, 2),
            )
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.record_voice_over_outlined,
                size: 16, color: AppColors.deepTeal),
            const SizedBox(width: 8),
            Text(
              '"$title"',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: AppColors.primaryText,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

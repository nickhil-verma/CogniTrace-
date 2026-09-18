import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../domain/entities/cognitrace_entities.dart';

class PatientStatusCard extends StatelessWidget {
  final PatientEntity patient;
  final VoidCallback? onTap;

  const PatientStatusCard({
    super.key,
    required this.patient,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: AppRadius.largeBorderRadius,
          border: Border.all(color: AppColors.border),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0C123B35),
              blurRadius: 16,
              offset: Offset(0, 6),
            )
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        color: AppColors.softPink,
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Text(
                          '👵',
                          style: TextStyle(fontSize: 22),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "${patient.relation}'s Care Journey",
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryText,
                          ),
                        ),
                        Text(
                          patient.name,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.secondaryText,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.mint.withOpacity(0.5),
                    borderRadius: AppRadius.pillBorderRadius,
                  ),
                  child: Text(
                    patient.careStage,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.deepTeal,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: AppRadius.smallBorderRadius,
              ),
              child: Text(
                patient.stageDescription,
                style: const TextStyle(
                  fontSize: 13,
                  height: 1.4,
                  color: AppColors.primaryText,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

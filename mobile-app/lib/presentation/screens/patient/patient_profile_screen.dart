import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/organic_background.dart';
import '../../providers/care_providers.dart';

class PatientProfileScreen extends ConsumerWidget {
  const PatientProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final patientAsync = ref.watch(patientSummaryProvider);

    return OrganicBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded,
                color: AppColors.primaryText),
            onPressed: () => context.pop(),
          ),
          title: const Text('Patient Profile'),
        ),
        body: patientAsync.when(
          data: (patient) {
            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: AppRadius.heroBorderRadius,
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.softPink,
                          ),
                          child: const Center(
                            child: Text('👵', style: TextStyle(fontSize: 40)),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          patient.name,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryText,
                          ),
                        ),
                        Text(
                          'Relation: ${patient.relation}',
                          style: const TextStyle(
                            fontSize: 14,
                            color: AppColors.secondaryText,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Chip(
                          label: Text(patient.careStage),
                          backgroundColor: AppColors.mint.withOpacity(0.5),
                          labelStyle: const TextStyle(
                            fontWeight: FontWeight.w700,
                            color: AppColors.deepTeal,
                          ),
                          side: BorderSide.none,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: AppRadius.largeBorderRadius,
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Care Plan Overview',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryText,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          patient.stageDescription,
                          style: const TextStyle(
                            fontSize: 14,
                            height: 1.45,
                            color: AppColors.secondaryText,
                          ),
                        ),
                      ],
                    ),
                  ),
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

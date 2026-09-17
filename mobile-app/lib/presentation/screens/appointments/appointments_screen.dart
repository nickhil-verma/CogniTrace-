import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/organic_background.dart';
import '../../providers/care_providers.dart';
import '../../widgets/cards/appointment_card.dart';

class AppointmentsScreen extends ConsumerWidget {
  const AppointmentsScreen({super.key});

  void _showAddAppointmentBottomSheet(BuildContext context, WidgetRef ref) {
    final nameCtrl = TextEditingController(text: 'Dr. Mehta');
    final specCtrl = TextEditingController(text: 'Geriatric Specialist');
    final locCtrl = TextEditingController(text: 'CogniTrace Wellness Hub');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppRadius.large),
        ),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Schedule Appointment',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryText,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: 'Doctor / Clinic Name'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: specCtrl,
                decoration: const InputDecoration(labelText: 'Medical Specialty'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: locCtrl,
                decoration: const InputDecoration(labelText: 'Location / Address'),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () {
                    ref.read(careRepositoryProvider).createAppointment(
                          nameCtrl.text,
                          specCtrl.text,
                          DateTime.now().add(const Duration(days: 3)),
                          locCtrl.text,
                        );
                    ref.refresh(appointmentsProvider);
                    Navigator.pop(context);
                  },
                  child: const Text('Save Appointment'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appointmentsAsync = ref.watch(appointmentsProvider);

    return OrganicBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded,
                color: AppColors.primaryText),
            onPressed: () => context.pop(),
          ),
          title: const Text('Doctor Appointments'),
          actions: [
            IconButton(
              icon: const Icon(Icons.add_rounded,
                  color: AppColors.deepTeal, size: 28),
              onPressed: () => _showAddAppointmentBottomSheet(context, ref),
            ),
          ],
        ),
        body: appointmentsAsync.when(
          data: (appointments) {
            return ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              itemCount: appointments.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (context, index) {
                return AppointmentCard(appointment: appointments[index]);
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

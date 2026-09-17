import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/organic_background.dart';
import '../../providers/care_providers.dart';
import '../../widgets/cards/reminder_card.dart';

class RemindersScreen extends ConsumerWidget {
  const RemindersScreen({super.key});

  void _showAddReminderBottomSheet(BuildContext context, WidgetRef ref) {
    final titleCtrl = TextEditingController(text: 'Evening Herbal Tea');
    String selectedCategory = 'Nutrition';

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
                    'New Care Reminder',
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
                controller: titleCtrl,
                decoration: const InputDecoration(
                  labelText: 'Reminder Title',
                  hintText: 'e.g. Evening Medication',
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: selectedCategory,
                items: const [
                  DropdownMenuItem(value: 'Medication', child: Text('Medication')),
                  DropdownMenuItem(value: 'Nutrition', child: Text('Nutrition')),
                  DropdownMenuItem(value: 'Activity', child: Text('Activity')),
                  DropdownMenuItem(value: 'Check-in', child: Text('Check-in')),
                ],
                onChanged: (val) {
                  if (val != null) selectedCategory = val;
                },
                decoration: const InputDecoration(labelText: 'Category'),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () {
                    ref.read(remindersProvider.notifier).createReminder(
                          titleCtrl.text,
                          DateTime.now().add(const Duration(hours: 3)),
                          selectedCategory,
                        );
                    Navigator.pop(context);
                  },
                  child: const Text('Save Reminder'),
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
    final remindersAsync = ref.watch(remindersProvider);

    return OrganicBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded,
                color: AppColors.primaryText),
            onPressed: () => context.pop(),
          ),
          title: const Text('Care Reminders'),
          actions: [
            IconButton(
              icon: const Icon(Icons.add_rounded,
                  color: AppColors.deepTeal, size: 28),
              onPressed: () => _showAddReminderBottomSheet(context, ref),
            ),
          ],
        ),
        body: remindersAsync.when(
          data: (reminders) {
            return ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              itemCount: reminders.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final r = reminders[index];
                return ReminderCard(
                  reminder: r,
                  onToggle: (id) {
                    ref.read(remindersProvider.notifier).toggleReminder(id);
                  },
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

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/care_providers.dart';
import '../../widgets/cards/memory_card.dart';
import '../../widgets/common/section_header.dart';

class MemoriesScreen extends ConsumerWidget {
  const MemoriesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final memoriesAsync = ref.watch(memoriesProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionHeader(
                title: 'Preserved Memories',
                subtitle: 'Cherished moments for family reminiscence',
                action: IconButton(
                  icon: const Icon(Icons.add_a_photo_rounded,
                      color: AppColors.deepTeal),
                  onPressed: () {
                    // Upload memory prompt
                  },
                ),
              ),
              const SizedBox(height: 12),
              memoriesAsync.when(
                data: (memories) {
                  return ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollablePhysics(),
                    itemCount: memories.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final memory = memories[index];
                      return MemoryCard(
                        memory: memory,
                        onTap: () {
                          context.push('/memory-detail/${memory.id}');
                        },
                      );
                    },
                  );
                },
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: CircularProgressIndicator(color: AppColors.deepTeal),
                  ),
                ),
                error: (_, __) => const SizedBox.shrink(),
              ),
              const SizedBox(height: 90),
            ],
          ),
        ),
      ),
    );
  }
}

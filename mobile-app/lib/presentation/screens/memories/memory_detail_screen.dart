import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/organic_background.dart';
import '../../providers/care_providers.dart';

class MemoryDetailScreen extends ConsumerWidget {
  final String memoryId;

  const MemoryDetailScreen({
    super.key,
    required this.memoryId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final memoriesAsync = ref.watch(memoriesProvider);

    return OrganicBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded,
                color: AppColors.primaryText),
            onPressed: () => context.pop(),
          ),
          title: const Text('Memory Moment'),
        ),
        body: memoriesAsync.when(
          data: (memories) {
            final memory = memories.firstWhere(
              (m) => m.id == memoryId,
              orElse: () => memories.first,
            );

            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: AppRadius.heroBorderRadius,
                    child: AspectRatio(
                      aspectRatio: 4 / 3,
                      child: CachedNetworkImage(
                        imageUrl: memory.imageUrl,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${memory.location} · ${memory.year}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.pink,
                        ),
                      ),
                      Wrap(
                        spacing: 6,
                        children: memory.tags
                            .map(
                              (t) => Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.softPink,
                                  borderRadius: AppRadius.pillBorderRadius,
                                ),
                                child: Text(
                                  t,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppColors.pink,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    memory.title,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primaryText,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    memory.description,
                    style: const TextStyle(
                      fontSize: 15,
                      height: 1.5,
                      color: AppColors.secondaryText,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'People in this memory:',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryText,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 8,
                    children: memory.people
                        .map(
                          (p) => Chip(
                            avatar: const Icon(Icons.person,
                                size: 16, color: AppColors.deepTeal),
                            label: Text(p),
                            backgroundColor: AppColors.mint.withOpacity(0.3),
                            side: BorderSide.none,
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(height: 32),

                  // Button to Launch Reminiscence Mode
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.deepTeal,
                        shape: RoundedRectangleBorder(
                          borderRadius: AppRadius.mediumBorderRadius,
                        ),
                      ),
                      onPressed: () {
                        context.push('/reminiscence/${memory.id}');
                      },
                      icon: const Icon(Icons.record_voice_over_rounded,
                          color: Colors.white),
                      label: const Text(
                        'Talk about this memory',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
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

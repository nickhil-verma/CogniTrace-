import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/organic_background.dart';

class ResourcesScreen extends StatelessWidget {
  const ResourcesScreen({super.key});

  final List<Map<String, String>> _articles = const [
    {
      'category': 'Communication',
      'title': 'Encouraging Positive Reminiscence Dialogue',
      'description': 'How warm photo prompts and simple validation reduce evening anxiety.',
      'readTime': '4 min read',
    },
    {
      'category': 'Daily Care',
      'title': 'Structuring Calm Evening Routines',
      'description': 'Practical steps for reducing cognitive overstimulation before sleep.',
      'readTime': '5 min read',
    },
    {
      'category': 'Caregiver Support',
      'title': 'Managing Caregiver Burnout & Respite',
      'description': 'Recognizing emotional fatigue and finding daily moments of peace.',
      'readTime': '3 min read',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return OrganicBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded,
                color: AppColors.primaryText),
            onPressed: () => context.pop(),
          ),
          title: const Text('Caregiver Resources'),
        ),
        body: ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          itemCount: _articles.length,
          separatorBuilder: (_, __) => const SizedBox(height: 14),
          itemBuilder: (context, index) {
            final article = _articles[index];
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: AppRadius.largeBorderRadius,
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.mint.withOpacity(0.4),
                          borderRadius: AppRadius.pillBorderRadius,
                        ),
                        child: Text(
                          article['category']!,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.deepTeal,
                          ),
                        ),
                      ),
                      Text(
                        article['readTime']!,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.secondaryText,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    article['title']!,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryText,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    article['description']!,
                    style: const TextStyle(
                      fontSize: 13,
                      height: 1.4,
                      color: AppColors.secondaryText,
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

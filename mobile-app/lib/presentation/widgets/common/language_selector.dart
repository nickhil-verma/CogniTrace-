import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../presentation/providers/care_providers.dart';

class LanguageSelector extends ConsumerWidget {
  const LanguageSelector({super.key});

  static const Map<String, String> _languages = {
    'en': 'English',
    'hi': 'Hindi (हिंदी)',
    'bn': 'Bengali (বাংলা)',
    'as': 'Assamese (অসমীয়া)',
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentLang = ref.watch(languageProvider);

    return PopupMenuButton<String>(
      initialValue: currentLang,
      onSelected: (code) {
        ref.read(languageProvider.notifier).selectLanguage(code);
      },
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.smallBorderRadius,
      ),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: AppRadius.pillBorderRadius,
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.language, size: 16, color: AppColors.deepTeal),
            const SizedBox(width: 6),
            Text(
              _languages[currentLang] ?? 'English',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.primaryText,
              ),
            ),
            const Icon(Icons.keyboard_arrow_down_rounded,
                size: 16, color: AppColors.secondaryText),
          ],
        ),
      ),
      itemBuilder: (context) {
        return _languages.entries.map((entry) {
          return PopupMenuItem<String>(
            value: entry.key,
            child: Text(
              entry.value,
              style: TextStyle(
                fontSize: 14,
                fontWeight:
                    entry.key == currentLang ? FontWeight.w700 : FontWeight.w400,
                color: AppColors.primaryText,
              ),
            ),
          );
        }).toList();
      },
    );
  }
}

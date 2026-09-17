import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/organic_background.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int _currentPage = 0;

  final List<Map<String, String>> _slides = [
    {
      'icon': '🌿',
      'title': 'Meet CogniTrace',
      'subtitle': 'Your AI companion for cognitive-care and dementia-care support.',
    },
    {
      'icon': '🎙️',
      'title': 'Talk naturally',
      'subtitle': 'Ask questions, create reminders, and log daily observations using your voice.',
    },
    {
      'icon': '🖼️',
      'title': 'Keep memories close',
      'subtitle': 'Preserve meaningful moments and engage in warm reminiscence dialogue.',
    },
    {
      'icon': '📊',
      'title': 'Stay informed',
      'subtitle': 'Understand cognitive care patterns and support needs over time with clarity.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return OrganicBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'COGNITRACE',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                      color: AppColors.primaryText,
                    ),
                  ),
                  TextButton(
                    onPressed: () => context.go('/home'),
                    child: const Text('Skip',
                        style: TextStyle(color: AppColors.secondaryText)),
                  ),
                ],
              ),
              Expanded(
                child: PageView.builder(
                  controller: _controller,
                  onPageChanged: (idx) => setState(() => _currentPage = idx),
                  itemCount: _slides.length,
                  itemBuilder: (context, index) {
                    final slide = _slides[index];
                    return Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.border),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x14123B35),
                                blurRadius: 24,
                                offset: Offset(0, 8),
                              )
                            ],
                          ),
                          child: Center(
                            child: Text(
                              slide['icon']!,
                              style: const TextStyle(fontSize: 54),
                            ),
                          ),
                        ),
                        const SizedBox(height: 36),
                        Text(
                          slide['title']!,
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -0.5,
                            color: AppColors.primaryText,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 14),
                        Text(
                          slide['subtitle']!,
                          style: const TextStyle(
                            fontSize: 15,
                            height: 1.45,
                            color: AppColors.secondaryText,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    );
                  },
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _slides.length,
                  (i) => AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: _currentPage == i ? 24 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _currentPage == i
                          ? AppColors.deepTeal
                          : AppColors.border,
                      borderRadius: AppRadius.pillBorderRadius,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: () {
                    if (_currentPage < _slides.length - 1) {
                      _controller.nextPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    } else {
                      context.go('/login');
                    }
                  },
                  child: Text(
                    _currentPage == _slides.length - 1
                        ? 'Get Started'
                        : 'Continue',
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

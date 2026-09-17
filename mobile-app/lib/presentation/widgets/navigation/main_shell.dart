import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/widgets/organic_background.dart';
import 'floating_voice_nav_bar.dart';

class MainShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const MainShell({
    super.key,
    required this.navigationShell,
  });

  @override
  Widget build(BuildContext context) {
    return OrganicBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: navigationShell,
        bottomNavigationBar: FloatingVoiceNavBar(
          currentIndex: navigationShell.currentIndex,
          onTapTab: (index) {
            navigationShell.goBranch(
              index,
              initialLocation: index == navigationShell.currentIndex,
            );
          },
          onTapVoice: () {
            context.push('/command-center');
          },
        ),
      ),
    );
  }
}

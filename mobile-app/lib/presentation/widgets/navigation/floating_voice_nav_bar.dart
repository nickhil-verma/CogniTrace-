import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';

/// Floating Bottom Navigation Bar with prominent circular central Voice Agent button.
class FloatingVoiceNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTapTab;
  final VoidCallback onTapVoice;

  const FloatingVoiceNavBar({
    super.key,
    required this.currentIndex,
    required this.onTapTab,
    required this.onTapVoice,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 80,
      margin: const EdgeInsets.only(left: 16, right: 16, bottom: 20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppRadius.pillBorderRadius,
        border: Border.all(color: AppColors.border, width: 1.5),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A123B35),
            blurRadius: 24,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _NavItem(
            icon: Icons.home_rounded,
            label: 'Home',
            isSelected: currentIndex == 0,
            onTap: () => onTapTab(0),
          ),
          _NavItem(
            icon: Icons.show_chart_rounded,
            label: 'Tracking',
            isSelected: currentIndex == 1,
            onTap: () => onTapTab(1),
          ),

          // Central Large Prominent Floating Voice Button
          GestureDetector(
            onTap: onTapVoice,
            child: Container(
              width: 58,
              height: 58,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [AppColors.deepTeal, AppColors.accentGreen],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Color(0x3D17665B),
                    blurRadius: 16,
                    offset: Offset(0, 6),
                  )
                ],
              ),
              child: const Center(
                child: Icon(
                  Icons.graphic_eq_rounded,
                  color: Colors.white,
                  size: 30,
                ),
              ),
            ),
          ),

          _NavItem(
            icon: Icons.collections_bookmark_rounded,
            label: 'Memories',
            isSelected: currentIndex == 2,
            onTap: () => onTapTab(2),
          ),
          _NavItem(
            icon: Icons.grid_view_rounded,
            label: 'More',
            isSelected: currentIndex == 3,
            onTap: () => onTapTab(3),
          ),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = isSelected ? AppColors.deepTeal : AppColors.secondaryText;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

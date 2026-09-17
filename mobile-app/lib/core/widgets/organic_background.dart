import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// Reusable subtle organic background widget with soft mint curved gradient
/// and light pink radial highlights for the calm CogniTrace healthcare aesthetic.
class OrganicBackground extends StatelessWidget {
  final Widget child;

  const OrganicBackground({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Solid background base
        Container(
          color: AppColors.background,
        ),

        // Custom painter for soft mint gradient and pink radial aura
        Positioned.fill(
          child: CustomPaint(
            painter: _OrganicShapesPainter(),
          ),
        ),

        // Foreground content child
        SafeArea(
          child: child,
        ),
      ],
    );
  }
}

class _OrganicShapesPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // 1. Soft mint top-right curved radial shape
    final mintPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          AppColors.mint.withOpacity(0.35),
          AppColors.mint.withOpacity(0.08),
          Colors.transparent,
        ],
        stops: const [0.0, 0.6, 1.0],
      ).createShader(
        Rect.fromCircle(
          center: Offset(size.width * 0.85, size.height * 0.15),
          radius: size.width * 0.7,
        ),
      );

    canvas.drawCircle(
      Offset(size.width * 0.85, size.height * 0.15),
      size.width * 0.7,
      mintPaint,
    );

    // 2. Soft pink subtle highlight near center-left
    final pinkPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          AppColors.softPink.withOpacity(0.45),
          AppColors.softPink.withOpacity(0.1),
          Colors.transparent,
        ],
        stops: const [0.0, 0.5, 1.0],
      ).createShader(
        Rect.fromCircle(
          center: Offset(size.width * 0.1, size.height * 0.55),
          radius: size.width * 0.6,
        ),
      );

    canvas.drawCircle(
      Offset(size.width * 0.1, size.height * 0.55),
      size.width * 0.6,
      pinkPaint,
    );

    // 3. Subtle accent green bottom right organic aura
    final greenPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          AppColors.accentGreen.withOpacity(0.12),
          Colors.transparent,
        ],
      ).createShader(
        Rect.fromCircle(
          center: Offset(size.width * 0.7, size.height * 0.9),
          radius: size.width * 0.5,
        ),
      );

    canvas.drawCircle(
      Offset(size.width * 0.7, size.height * 0.9),
      size.width * 0.5,
      greenPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

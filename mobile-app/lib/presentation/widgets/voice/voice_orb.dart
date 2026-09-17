import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_shadows.dart';
import '../providers/voice_agent_provider.dart';

/// Animated VoiceOrb widget - Visual identity of CogniTrace.
/// Supports 6 distinct animated states: IDLE, LISTENING, PROCESSING, EXECUTING, SPEAKING, ERROR.
class VoiceOrb extends StatefulWidget {
  final VoiceAgentStatus status;
  final double size;
  final VoidCallback? onTap;

  const VoiceOrb({
    super.key,
    required this.status,
    this.size = 180.0,
    this.onTap,
  });

  @override
  State<VoiceOrb> createState() => _VoiceOrbState();
}

class _VoiceOrbState extends State<VoiceOrb> with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _rippleController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    )..repeat(reverse: true);

    _rippleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..repeat();

    _pulseAnimation = Tween<double>(begin: 0.94, end: 1.06).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _rippleController.dispose();
    super.dispose();
  }

  Color _getPrimaryColor() {
    switch (widget.status) {
      case VoiceAgentStatus.idle:
        return AppColors.accentGreen;
      case VoiceAgentStatus.listening:
        return AppColors.deepTeal;
      case VoiceAgentStatus.processing:
        return AppColors.mint;
      case VoiceAgentStatus.executing:
        return AppColors.deepTeal;
      case VoiceAgentStatus.speaking:
        return AppColors.pink;
      case VoiceAgentStatus.error:
        return AppColors.error;
    }
  }

  String _getStatusText() {
    switch (widget.status) {
      case VoiceAgentStatus.idle:
        return "Tap to talk";
      case VoiceAgentStatus.listening:
        return "Listening...";
      case VoiceAgentStatus.processing:
        return "Understanding...";
      case VoiceAgentStatus.executing:
        return "Executing care action...";
      case VoiceAgentStatus.speaking:
        return "CogniTrace Speaking...";
      case VoiceAgentStatus.error:
        return "Tap to try again";
    }
  }

  @override
  Widget build(BuildContext context) {
    final orbColor = _getPrimaryColor();

    return GestureDetector(
      onTap: widget.onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: widget.size * 1.5,
            height: widget.size * 1.5,
            child: AnimatedBuilder(
              animation: Listenable.merge([_pulseController, _rippleController]),
              builder: (context, child) {
                return Stack(
                  alignment: Alignment.center,
                  children: [
                    // Outer Ripple Rings (LISTENING / SPEAKING)
                    if (widget.status == VoiceAgentStatus.listening ||
                        widget.status == VoiceAgentStatus.speaking)
                      CustomPaint(
                        size: Size(widget.size * 1.4, widget.size * 1.4),
                        painter: _OrbRipplesPainter(
                          progress: _rippleController.value,
                          color: orbColor,
                        ),
                      ),

                    // Breathing Aura Outer Glow
                    Transform.scale(
                      scale: _pulseAnimation.value,
                      child: Container(
                        width: widget.size * 1.15,
                        height: widget.size * 1.15,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          boxShadow: AppShadows.orbGlow,
                          gradient: RadialGradient(
                            colors: [
                              orbColor.withOpacity(0.4),
                              AppColors.mint.withOpacity(0.15),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),
                    ),

                    // Core Organic Animated Orb Surface
                    Transform.scale(
                      scale: widget.status == VoiceAgentStatus.listening
                          ? _pulseAnimation.value * 1.04
                          : _pulseAnimation.value,
                      child: Container(
                        width: widget.size,
                        height: widget.size,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              orbColor,
                              AppColors.deepTeal,
                              AppColors.mint,
                            ],
                          ),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x29123B35),
                              blurRadius: 20,
                              offset: Offset(0, 8),
                            )
                          ],
                        ),
                        child: Center(
                          child: Icon(
                            widget.status == VoiceAgentStatus.listening
                                ? Icons.mic
                                : widget.status == VoiceAgentStatus.speaking
                                    ? Icons.volume_up_rounded
                                    : widget.status == VoiceAgentStatus.error
                                        ? Icons.refresh_rounded
                                        : Icons.graphic_eq_rounded,
                            color: Colors.white,
                            size: widget.size * 0.38,
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: Text(
              _getStatusText(),
              key: ValueKey(widget.status),
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: widget.status == VoiceAgentStatus.error
                    ? AppColors.error
                    : AppColors.primaryText,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OrbRipplesPainter extends CustomPainter {
  final double progress;
  final Color color;

  _OrbRipplesPainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = size.width / 2;

    for (int i = 0; i < 3; i++) {
      final ringProgress = (progress + (i * 0.33)) % 1.0;
      final radius = ringProgress * maxRadius;
      final opacity = (1.0 - ringProgress).clamp(0.0, 1.0);

      final paint = Paint()
        ..color = color.withOpacity(opacity * 0.4)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5;

      canvas.drawCircle(center, radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _OrbRipplesPainter oldDelegate) =>
      oldDelegate.progress != progress || oldDelegate.color != color;
}

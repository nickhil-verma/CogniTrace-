import 'package:flutter/material.dart';

abstract class AppShadows {
  static const List<BoxShadow> orbGlow = [
    BoxShadow(
      color: Color(0x40123B35),
      blurRadius: 32,
      spreadRadius: 4,
      offset: Offset(0, 8),
    ),
  ];
}

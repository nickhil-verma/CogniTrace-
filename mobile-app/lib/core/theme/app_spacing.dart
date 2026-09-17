import 'package:flutter/material.dart';

abstract class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
}

abstract class AppRadius {
  static const double small = 16.0;
  static const double medium = 20.0;
  static const double large = 28.0;
  static const double hero = 32.0;
  static const double pill = 999.0;

  static BorderRadius get smallBorderRadius => BorderRadius.circular(small);
  static BorderRadius get mediumBorderRadius => BorderRadius.circular(medium);
  static BorderRadius get largeBorderRadius => BorderRadius.circular(large);
  static BorderRadius get heroBorderRadius => BorderRadius.circular(hero);
  static BorderRadius get pillBorderRadius => BorderRadius.circular(pill);
}

abstract class AppShadows {
  static const List<BoxShadow> soft = [
    BoxShadow(
      color: Color(0x0A123B35),
      blurRadius: 16,
      offset: Offset(0, 6),
      spreadRadius: 0,
    ),
    BoxShadow(
      color: Color(0x05123B35),
      blurRadius: 4,
      offset: Offset(0, 2),
      spreadRadius: 0,
    ),
  ];

  static const List<BoxShadow> elevated = [
    BoxShadow(
      color: Color(0x14123B35),
      blurRadius: 24,
      offset: Offset(0, 10),
      spreadRadius: -2,
    ),
  ];

  static const List<BoxShadow> orbGlow = [
    BoxShadow(
      color: Color(0x3D3E9C87),
      blurRadius: 32,
      spreadRadius: 4,
    ),
    BoxShadow(
      color: Color(0x2617665B),
      blurRadius: 60,
      spreadRadius: 10,
    ),
  ];
}

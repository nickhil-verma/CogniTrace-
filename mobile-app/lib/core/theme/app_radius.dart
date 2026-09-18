import 'package:flutter/material.dart';

abstract class AppRadius {
  static const double small = 8.0;
  static const double medium = 12.0;
  static const double large = 20.0;
  static const double hero = 28.0;

  static final BorderRadius smallBorderRadius =
      BorderRadius.circular(small);

  static final BorderRadius mediumBorderRadius =
      BorderRadius.circular(medium);

  static final BorderRadius largeBorderRadius =
      BorderRadius.circular(large);

  static final BorderRadius heroBorderRadius =
      BorderRadius.circular(hero);

  static final BorderRadius pillBorderRadius =
      BorderRadius.circular(999.0);
}

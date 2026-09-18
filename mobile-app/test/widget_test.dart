import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:cognitrace/main.dart';

void main() {
  testWidgets('CogniTrace app builds successfully', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: CogniTraceApp(),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.byType(CogniTraceApp), findsOneWidget);
  });
}

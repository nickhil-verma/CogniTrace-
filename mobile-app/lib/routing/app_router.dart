import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../presentation/widgets/navigation/main_shell.dart';
import '../presentation/screens/splash/splash_screen.dart';
import '../presentation/screens/onboarding/onboarding_screen.dart';
import '../presentation/screens/auth/login_screen.dart';
import '../presentation/screens/home/home_screen.dart';
import '../presentation/screens/command_center/command_center_screen.dart';
import '../presentation/screens/tracking/tracking_screen.dart';
import '../presentation/screens/memories/memories_screen.dart';
import '../presentation/screens/memories/memory_detail_screen.dart';
import '../presentation/screens/memories/reminiscence_screen.dart';
import '../presentation/screens/appointments/appointments_screen.dart';
import '../presentation/screens/reminders/reminders_screen.dart';
import '../presentation/screens/insights/insights_screen.dart';
import '../presentation/screens/journal/journal_screen.dart';
import '../presentation/screens/resources/resources_screen.dart';
import '../presentation/screens/settings/settings_screen.dart';
import '../presentation/screens/patient/patient_profile_screen.dart';
import '../presentation/screens/more/more_screen.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey =
    GlobalKey<NavigatorState>(debugLabel: 'root');

final GoRouter appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/onboarding',
      builder: (context, state) => const OnboardingScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/command-center',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const CommandCenterScreen(),
    ),
    GoRoute(
      path: '/memory-detail/:id',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? 'mem_1';
        return MemoryDetailScreen(memoryId: id);
      },
    ),
    GoRoute(
      path: '/reminiscence/:id',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? 'mem_1';
        return ReminiscenceScreen(memoryId: id);
      },
    ),
    GoRoute(
      path: '/appointments',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const AppointmentsScreen(),
    ),
    GoRoute(
      path: '/reminders',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const RemindersScreen(),
    ),
    GoRoute(
      path: '/insights',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const InsightsScreen(),
    ),
    GoRoute(
      path: '/journal',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const JournalScreen(),
    ),
    GoRoute(
      path: '/resources',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const ResourcesScreen(),
    ),
    GoRoute(
      path: '/settings',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const SettingsScreen(),
    ),
    GoRoute(
      path: '/patient-profile',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const PatientProfileScreen(),
    ),

    // Main Stateful Bottom Navigation Shell
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return MainShell(navigationShell: navigationShell);
      },
      branches: [
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/home',
              builder: (context, state) => const HomeScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/tracking',
              builder: (context, state) => const TrackingScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/memories',
              builder: (context, state) => const MemoriesScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/more',
              builder: (context, state) => const MoreScreen(),
            ),
          ],
        ),
      ],
    ),
  ],
);

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../screens/splash_screen.dart';
import '../screens/onboarding_screen.dart';
import '../screens/login_screen.dart';
import '../screens/signup_screen.dart';
import '../screens/main_screen.dart';

class AppRouter {
  static GoRouter router(AuthProvider authProvider) {
    return GoRouter(
      initialLocation: '/',
      refreshListenable: authProvider,
      redirect: (context, state) {
        final isLoggedIn = authProvider.isAuthenticated;
        final isInitialized = authProvider.isInitialized;
        final isOnSplash = state.matchedLocation == '/';
        final isOnAuth = state.matchedLocation == '/login' || 
                         state.matchedLocation == '/signup' ||
                         state.matchedLocation == '/onboarding';

        print('ROUTER DEBUG: location=${state.matchedLocation}, isLoggedIn=$isLoggedIn, isInitialized=$isInitialized, isOnAuth=$isOnAuth');

        // If on splash, let it handle navigation
        if (isOnSplash) {
          print('ROUTER: On splash, no redirect');
          return null;
        }

        // Don't redirect if not yet initialized
        if (!isInitialized) {
          print('ROUTER: Not initialized, no redirect');
          return null;
        }

        // If not logged in and not on auth pages, redirect to login
        if (!isLoggedIn && !isOnAuth) {
          print('ROUTER: Not logged in, redirecting to /login');
          return '/login';
        }

        // If logged in and on auth pages, redirect to home
        if (isLoggedIn && isOnAuth) {
          print('ROUTER: Logged in on auth page, redirecting to /home');
          return '/home';
        }

        print('ROUTER: No redirect needed');
        return null;
      },
      routes: [
        GoRoute(
          path: '/',
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
          path: '/signup',
          builder: (context, state) => const SignupScreen(),
        ),
        GoRoute(
          path: '/home',
          builder: (context, state) => const MainScreen(initialIndex: 0),
        ),
        GoRoute(
          path: '/destinations',
          builder: (context, state) => const MainScreen(initialIndex: 1),
        ),
        GoRoute(
          path: '/membership',
          builder: (context, state) => const MainScreen(initialIndex: 2),
        ),
        GoRoute(
          path: '/chat',
          builder: (context, state) => const MainScreen(initialIndex: 3),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => const MainScreen(initialIndex: 4),
        ),
      ],
    );
  }
}

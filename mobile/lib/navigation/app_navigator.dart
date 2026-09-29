import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../screens/login_screen.dart';
import 'main_shell.dart';

/// Root della navigazione (porting di `src/navigation/AppNavigator.js`):
/// mostra Login/Register se non autenticato, altrimenti il guscio principale.
class AppNavigator extends StatelessWidget {
  const AppNavigator({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    if (auth.loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    return auth.isAuthenticated ? const MainShell() : const LoginScreen();
  }
}

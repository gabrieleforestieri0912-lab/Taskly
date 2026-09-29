import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Palette dell'app (porting di `lightColors`/`darkColors` di `src/context/ThemeContext.js`).
class AppColors {
  const AppColors({
    required this.background,
    required this.surface,
    required this.surfaceAlt,
    required this.primary,
    required this.primaryLight,
    required this.text,
    required this.textSecondary,
    required this.textTertiary,
    required this.border,
    required this.error,
    required this.success,
    required this.warning,
  });

  final Color background;
  final Color surface;
  final Color surfaceAlt;
  final Color primary;
  final Color primaryLight;
  final Color text;
  final Color textSecondary;
  final Color textTertiary;
  final Color border;
  final Color error;
  final Color success;
  final Color warning;

  static const light = AppColors(
    background: Color(0xFFF9FAFB),
    surface: Color(0xFFFFFFFF),
    surfaceAlt: Color(0xFFF3F4F6),
    primary: Color(0xFF7B39FC),
    primaryLight: Color(0xFFEDE9FE),
    text: Color(0xFF111827),
    textSecondary: Color(0xFF6B7280),
    textTertiary: Color(0xFF9CA3AF),
    border: Color(0xFFE5E7EB),
    error: Color(0xFFEF4444),
    success: Color(0xFF10B981),
    warning: Color(0xFFF59E0B),
  );

  static const dark = AppColors(
    background: Color(0xFF0F0F1A),
    surface: Color(0xFF1A1A2E),
    surfaceAlt: Color(0xFF252540),
    primary: Color(0xFFA67CFF),
    primaryLight: Color(0xFF2D1B69),
    text: Color(0xFFF3F4F6),
    textSecondary: Color(0xFF9CA3AF),
    textTertiary: Color(0xFF6B7280),
    border: Color(0xFF2D2D4A),
    error: Color(0xFFF87171),
    success: Color(0xFF34D399),
    warning: Color(0xFFFBBF24),
  );
}

/// Gestione tema chiaro/scuro con salvataggio nelle preferenze.
class ThemeProvider extends ChangeNotifier {
  bool _isDark = false;
  bool get isDark => _isDark;

  AppColors get colors => _isDark ? AppColors.dark : AppColors.light;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('theme');
    final systemDark = WidgetsBinding.instance.platformDispatcher.platformBrightness ==
        Brightness.dark;
    if (saved == 'dark' || saved == 'light') {
      _isDark = saved == 'dark';
    } else {
      _isDark = systemDark;
    }
    notifyListeners();
  }

  Future<void> toggleTheme() async {
    _isDark = !_isDark;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('theme', _isDark ? 'dark' : 'light');
  }
}

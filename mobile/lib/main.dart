import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

import 'navigation/app_navigator.dart';
import 'providers/auth_provider.dart';
import 'providers/language_provider.dart';
import 'providers/theme_provider.dart';
import 'services/supabase_client.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SupabaseConfig.initialize();
  runApp(const TasklyApp());
}

/// Root dell'app: fornisce i provider e configura tema e navigazione.
class TasklyApp extends StatelessWidget {
  const TasklyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..load()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()..load()),
        ChangeNotifierProvider(create: (_) => LanguageProvider()..load()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, theme, _) {
          return MaterialApp(
            title: 'Taskly',
            debugShowCheckedModeBanner: false,
            theme: _buildTheme(theme.colors, false),
            darkTheme: _buildTheme(theme.colors, true),
            themeMode: theme.isDark ? ThemeMode.dark : ThemeMode.light,
            home: const AppNavigator(),
          );
        },
      ),
    );
  }

  ThemeData _buildTheme(AppColors colors, bool isDark) {
    return ThemeData(
      colorScheme: ColorScheme.fromSeed(
        seedColor: colors.primary,
        brightness: isDark ? Brightness.dark : Brightness.light,
        surface: colors.surface,
      ),
      scaffoldBackgroundColor: colors.background,
      dialogTheme: DialogThemeData(backgroundColor: colors.surface),
      bottomSheetTheme: BottomSheetThemeData(backgroundColor: colors.surface),
      textSelectionTheme: TextSelectionThemeData(cursorColor: colors.primary),
      snackBarTheme: const SnackBarThemeData(behavior: SnackBarBehavior.floating),
      textTheme: GoogleFonts.interTextTheme(),
    );
  }
}

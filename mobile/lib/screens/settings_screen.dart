import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../providers/auth_provider.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../widgets/screen_header.dart';

const _languages = [
  ('it', 'Italiano'),
  ('en', 'English'),
  ('es', 'Español'),
  ('fr', 'Français'),
  ('de', 'Deutsch'),
];

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key, this.inShell = false});

  final bool inShell;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  Map<String, dynamic>? _subscription;

  @override
  void initState() {
    super.initState();
    _loadSubscription();
  }

  Future<void> _loadSubscription() async {
    try {
      final data = await Api.instance.getSubscription();
      final sub = data is Map ? data['subscription'] : null;
      if (!mounted) return;
      setState(() {
        _subscription = sub is Map<String, dynamic> ? sub : null;
      });
    } catch (_) {
      // nessuna azione
    }
  }

  Future<void> _openFeedback() async {
    final nameController = TextEditingController();
    final emailController = TextEditingController();
    final messageController = TextEditingController();

    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: ctx.watch<ThemeProvider>().colors.surface,
        title: Text('Invia Feedback', style: TextStyle(color: ctx.watch<ThemeProvider>().colors.text)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: InputDecoration(
                  labelText: 'Nome (opzionale)',
                  labelStyle: TextStyle(color: ctx.watch<ThemeProvider>().colors.textSecondary),
                  filled: true,
                  fillColor: ctx.watch<ThemeProvider>().colors.background,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
                style: TextStyle(color: ctx.watch<ThemeProvider>().colors.text),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: emailController,
                decoration: InputDecoration(
                  labelText: 'Email (opzionale)',
                  labelStyle: TextStyle(color: ctx.watch<ThemeProvider>().colors.textSecondary),
                  filled: true,
                  fillColor: ctx.watch<ThemeProvider>().colors.background,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
                style: TextStyle(color: ctx.watch<ThemeProvider>().colors.text),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: messageController,
                decoration: InputDecoration(
                  labelText: 'Messaggio',
                  labelStyle: TextStyle(color: ctx.watch<ThemeProvider>().colors.textSecondary),
                  filled: true,
                  fillColor: ctx.watch<ThemeProvider>().colors.background,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
                style: TextStyle(color: ctx.watch<ThemeProvider>().colors.text),
                maxLines: 4,
                minLines: 3,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Annulla', style: TextStyle(color: ctx.watch<ThemeProvider>().colors.textSecondary)),
          ),
          Consumer<ThemeProvider>(
            builder: (_, theme, _) => FilledButton(
              onPressed: () async {
                final message = messageController.text.trim();
                if (message.isEmpty) return;
                Navigator.pop(ctx);
                await _sendFeedback(
                  name: nameController.text.trim(),
                  email: emailController.text.trim(),
                  message: message,
                );
              },
              style: FilledButton.styleFrom(backgroundColor: theme.colors.primary),
              child: const Text('Invia'),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _sendFeedback({
    required String name,
    required String email,
    required String message,
  }) async {
    final uri = Uri.https('resumari.com', '/api/supporto', {
      'nome': name,
      'email': email,
      'messaggio': message,
    });

    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Feedback inviato! Grazie.', style: TextStyle(color: context.watch<ThemeProvider>().colors.background)),
            backgroundColor: context.watch<ThemeProvider>().colors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Errore invio. Riprova più tardi.', style: TextStyle(color: context.watch<ThemeProvider>().colors.background)),
            backgroundColor: context.watch<ThemeProvider>().colors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    final theme = context.watch<ThemeProvider>();
    final t = context.watch<LanguageProvider>().t;
    final language = context.watch<LanguageProvider>().language;
    final setLanguage = context.read<LanguageProvider>().setLanguage;
    final auth = context.watch<AuthProvider>();

    final user = auth.user;
    final name = (user?['name'] as String?) ?? '';
    final email = (user?['email'] as String?) ?? '';
    final initial = name.isNotEmpty ? name[0].toUpperCase() : 'U';
    final isActive = _subscription?['status'] == 'active';

    return Scaffold(
      backgroundColor: colors.background,
      body: Column(
        children: [
          ScreenHeader(
            title: t('settings'),
            menuSpace: widget.inShell,
            onBack: widget.inShell ? null : () => Navigator.pop(context),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
              children: [
                _sectionTitle(context, t('accountSettings'), colors),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: colors.surface,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: colors.primary,
                          shape: BoxShape.circle,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          initial,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name,
                            style: TextStyle(
                              color: colors.text,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            email,
                            style: TextStyle(
                              color: colors.textSecondary,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                _sectionTitle(context, t('subscription'), colors),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: colors.surface,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        t('status'),
                        style: TextStyle(color: colors.text, fontSize: 15),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: isActive
                              ? const Color(0xFF10B981).withValues(alpha: 0.12)
                              : const Color(0xFF6B7280).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          isActive ? t('active') : t('inactive'),
                          style: TextStyle(
                            color: isActive ? colors.success : colors.textTertiary,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                _sectionTitle(context, t('language'), colors),
                Container(
                  decoration: BoxDecoration(
                    color: colors.surface,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    children: [
                      for (var i = 0; i < _languages.length; i++) ...[
                        if (i > 0)
                          Divider(height: 1, color: colors.border),
                        InkWell(
                          onTap: () => setLanguage(_languages[i].$1),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  _languages[i].$2,
                                  style: TextStyle(
                                    color: language == _languages[i].$1
                                        ? colors.primary
                                        : colors.text,
                                    fontSize: 15,
                                    fontWeight: language == _languages[i].$1
                                        ? FontWeight.w600
                                        : FontWeight.w400,
                                  ),
                                ),
                                if (language == _languages[i].$1)
                                  Icon(Icons.check, color: colors.primary, size: 20),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                _sectionTitle(context, t('appearance'), colors),
                Container(
                  decoration: BoxDecoration(
                    color: colors.surface,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: InkWell(
                    onTap: theme.toggleTheme,
                    borderRadius: BorderRadius.circular(16),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            theme.isDark ? t('lightMode') : t('darkMode'),
                            style: TextStyle(color: colors.text, fontSize: 15),
                          ),
                          Text(
                            theme.isDark ? '☀️' : '🌙',
                            style: const TextStyle(fontSize: 20),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                _sectionTitle(context, 'Feedback', colors),
                Container(
                  decoration: BoxDecoration(
                    color: colors.surface,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: InkWell(
                    onTap: _openFeedback,
                    borderRadius: BorderRadius.circular(16),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Aiutaci a migliorare',
                            style: TextStyle(color: colors.text, fontSize: 15),
                          ),
                          const Icon(Icons.feedback, size: 24),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                // Logout
                OutlinedButton(
                  onPressed: () async {
                    final ok = await showDialog<bool>(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        backgroundColor: colors.surface,
                        title: Text(
                          t('confirmLogoutTitle'),
                          style: TextStyle(color: colors.text),
                        ),
                        content: Text(
                          t('confirmLogoutDesc'),
                          style: TextStyle(color: colors.textSecondary),
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(ctx, false),
                            child: Text(
                              t('cancel'),
                              style: TextStyle(color: colors.textSecondary),
                            ),
                          ),
                          FilledButton(
                            onPressed: () => Navigator.pop(ctx, true),
                            style: FilledButton.styleFrom(
                              backgroundColor: colors.error,
                            ),
                            child: Text(t('confirmLogout')),
                          ),
                        ],
                      ),
                    );
                    if (ok == true) await auth.logout();
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: colors.error,
                    side: BorderSide(color: colors.error, width: 1.5),
                    padding: const EdgeInsets.all(16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    t('logout'),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(
    BuildContext context,
    String title,
    AppColors colors,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          color: colors.textSecondary,
          fontSize: 12,
          fontWeight: FontWeight.w700,
          letterSpacing: 1,
        ),
      ),
    );
  }
}

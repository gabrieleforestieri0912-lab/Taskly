import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../widgets/screen_header.dart';
import 'page_view_screen.dart';

class _PageType {
  const _PageType(this.id, this.icon, this.labelKey);

  final String id;
  final String icon;
  final String labelKey;
}

const _pageTypes = [
  _PageType('tasks', '📋', 'tasks'),
  _PageType('goals', '🎯', 'goals'),
  _PageType('calendar', '📅', 'calendar'),
  _PageType('notes', '📝', 'notes'),
  _PageType('braindump', '💡', 'brainDump'),
];

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key, this.inShell = false, this.onNavigateTab});

  final bool inShell;

  /// Callback per navigare verso una tab del guscio principale.
  final ValueChanged<String>? onNavigateTab;

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<dynamic> _recentTasks = [];
  Map<String, int> _stats = {'tasks': 0, 'goals': 0, 'notes': 0};

  Future<void> _loadData() async {
    try {
      final data = await Api.instance.getUserData();
      final tasks = (data['tasks'] as List?) ?? <dynamic>[];
      final pages = (data['pages'] as List?) ?? <dynamic>[];
      final goals = (data['goals'] as List?) ?? <dynamic>[];
      if (!mounted) return;
      setState(() {
        _stats = {
          'tasks': tasks.where((t) => t['status'] != 'done').length,
          'goals': goals.where((g) => g['completed'] != true).length,
          'notes': pages
              .where((p) => p['type'] == 'notes' || p['type'] == 'braindump')
              .length,
        };
        _recentTasks = tasks.take(5).toList();
      });
    } catch (_) {
      // nessun dato → stati vuoti
    }
  }

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _openPage(String type) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => PageViewScreen(type: type)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    final t = context.watch<LanguageProvider>().t;
    final user = context.watch<AuthProvider>().user;
    final name = (user?['name'] as String?) ?? '';

    return Scaffold(
      backgroundColor: colors.background,
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.only(bottom: 32),
          children: [
            ScreenHeader(
              title: t('dashboard'),
              subtitle: name.isEmpty ? null : name,
              menuSpace: widget.inShell,
              onBack: widget.inShell ? null : () => Navigator.pop(context),
              glow: true,
              badge: _VersionBadge(colors: colors, label: t('appVersionBadge')),
            ),
            // Statistiche
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                children: [
                  _StatCard(
                    value: _stats['tasks'] ?? 0,
                    label: t('tasks'),
                    color: colors.primary,
                  ),
                  const SizedBox(width: 12),
                  _StatCard(
                    value: _stats['goals'] ?? 0,
                    label: t('goals'),
                    color: const Color(0xFF10B981),
                  ),
                  const SizedBox(width: 12),
                  _StatCard(
                    value: _stats['notes'] ?? 0,
                    label: t('notes'),
                    color: const Color(0xFFF59E0B),
                  ),
                ],
              ),
            ),
            // Nuova pagina
            Padding(
              padding: const EdgeInsets.only(top: 24, bottom: 12, left: 24, right: 24),
              child: Text(
                t('newPage'),
                style: TextStyle(
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: GridView.count(
                crossAxisCount: 3,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.1,
                children: [
                  for (final pt in _pageTypes)
                    InkWell(
                      onTap: () => _openPage(pt.id),
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        decoration: BoxDecoration(
                          color: colors.surface,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(pt.icon, style: const TextStyle(fontSize: 28)),
                            const SizedBox(height: 8),
                            Text(
                              t(pt.labelKey),
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: colors.text,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // Attività in corso
            if (_recentTasks.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.only(top: 24, bottom: 12, left: 24, right: 24),
                child: Text(
                  '${t('tasks')} (${t('inProgress')})',
                  style: TextStyle(
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: [
                    for (final task in _recentTasks)
                      InkWell(
                        onTap: () => widget.onNavigateTab?.call('Tasks'),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: colors.surface,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: task['status'] == 'done'
                                      ? colors.success
                                      : task['status'] == 'inprogress'
                                          ? colors.warning
                                          : colors.textTertiary,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  task['title']?.toString() ?? '',
                                  style: TextStyle(
                                    color: colors.text,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _VersionBadge extends StatelessWidget {
  const _VersionBadge({required this.colors, required this.label});

  final AppColors colors;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: colors.primary.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: colors.primary.withValues(alpha: 0.35),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.auto_awesome, size: 14, color: colors.primary),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: colors.primary,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.value,
    required this.label,
    required this.color,
  });

  final int value;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: colors.surface,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
            ),
          ],
        ),
        child: Column(
          children: [
            Text(
              '$value',
              style: TextStyle(
                color: color,
                fontSize: 28,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(color: colors.textSecondary, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}

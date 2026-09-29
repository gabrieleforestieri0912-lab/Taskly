import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../utils/ui.dart';
import '../widgets/screen_header.dart';

class ActivityScreen extends StatefulWidget {
  const ActivityScreen({super.key, this.inShell = false});

  final bool inShell;

  @override
  State<ActivityScreen> createState() => _ActivityScreenState();
}

class _ActivityScreenState extends State<ActivityScreen> {
  List<Map<String, dynamic>> _activities = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await Api.instance.listActivity();
      final list = data is List
          ? data
          : (data is Map && data['activities'] is List)
              ? (data['activities'] as List)
              : <dynamic>[];
      if (!mounted) return;
      setState(() => _activities = list.cast<Map<String, dynamic>>());
    } catch (_) {
      // nessuna azione
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    final t = context.watch<LanguageProvider>().t;

    return Scaffold(
      backgroundColor: colors.background,
      body: Column(
        children: [
          ScreenHeader(
            title: t('activity'),
            menuSpace: widget.inShell,
            onBack: widget.inShell ? null : () => Navigator.pop(context),
          ),
          Expanded(
            child: _activities.isEmpty
                ? Center(
                    child: Text(
                      t('noRecentActivity'),
                      style: TextStyle(color: colors.textTertiary, fontSize: 16),
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _load,
                    child: ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(24, 8, 24, 100),
                      itemCount: _activities.length,
                      itemBuilder: (context, i) {
                        final item = _activities[i];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: colors.surface,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item['title']?.toString() ??
                                    item['type']?.toString() ??
                                    '',
                                style: TextStyle(
                                  color: colors.text,
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              if (item['body'] != null) ...[
                                const SizedBox(height: 4),
                                Text(
                                  item['body'].toString(),
                                  style: TextStyle(
                                    color: colors.textSecondary,
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                              const SizedBox(height: 8),
                              Text(
                                formatDateTime(item['createdAt']),
                                style: TextStyle(
                                  color: colors.textTertiary,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../widgets/screen_header.dart';

class TemplatesScreen extends StatefulWidget {
  const TemplatesScreen({super.key, this.inShell = false});

  final bool inShell;

  @override
  State<TemplatesScreen> createState() => _TemplatesScreenState();
}

class _TemplatesScreenState extends State<TemplatesScreen> {
  List<Map<String, dynamic>> _templates = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await Api.instance.listTemplates();
      final list = data is List
          ? data
          : (data is Map && data['templates'] is List)
              ? (data['templates'] as List)
              : <dynamic>[];
      if (!mounted) return;
      setState(() => _templates = list.cast<Map<String, dynamic>>());
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
            title: t('templates'),
            menuSpace: widget.inShell,
            onBack: widget.inShell ? null : () => Navigator.pop(context),
          ),
          Expanded(
            child: _templates.isEmpty
                ? Center(
                    child: Text(
                      t('noTemplates'),
                      style: TextStyle(color: colors.textTertiary, fontSize: 16),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(24, 8, 24, 100),
                    itemCount: _templates.length,
                    itemBuilder: (context, i) {
                      final item = _templates[i];
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
                              item['name']?.toString() ?? '',
                              style: TextStyle(
                                color: colors.text,
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            if (item['type'] != null) ...[
                              const SizedBox(height: 4),
                              Text(
                                item['type'].toString(),
                                style: TextStyle(
                                  color: colors.textSecondary,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

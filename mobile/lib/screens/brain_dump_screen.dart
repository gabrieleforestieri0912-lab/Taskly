import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../utils/ui.dart';
import '../widgets/screen_header.dart';

class BrainDumpScreen extends StatefulWidget {
  const BrainDumpScreen({super.key, this.inShell = false});

  final bool inShell;

  @override
  State<BrainDumpScreen> createState() => _BrainDumpScreenState();
}

class _BrainDumpScreenState extends State<BrainDumpScreen> {
  final List<Map<String, dynamic>> _ideas = [];
  final _textController = TextEditingController();
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadIdeas();
  }

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  Future<void> _loadIdeas() async {
    try {
      final data = await Api.instance.getUserData();
      final ideas = (data is Map && data['ideas'] is List)
          ? (data['ideas'] as List)
          : <dynamic>[];
      if (!mounted) return;
      setState(() {
        _ideas
          ..clear()
          ..addAll(ideas.map((raw) {
            final m = raw is Map<String, dynamic> ? raw : <String, dynamic>{};
            final created = m['createdAt']?.toString();
            return {
              'id': m['id']?.toString() ??
                  DateTime.now().microsecondsSinceEpoch.toString(),
              'content': m['title']?.toString() ?? '',
              'createdAt':
                  created != null ? DateTime.tryParse(created) ?? DateTime.now() : DateTime.now(),
            };
          }));
      });
    } catch (_) {
      // nessuna idea salvata
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<Map<String, dynamic>> _toPayload() => _ideas
      .map((i) => {
            'id': i['id'],
            'title': i['content'],
            'createdAt': (i['createdAt'] as DateTime).toIso8601String(),
          })
      .toList();

  Future<void> _syncIdeas() async {
    try {
      await Api.instance.syncUserData({'ideas': _toPayload()});
    } catch (_) {
      // sincronizzazione best-effort: lo stato locale resta valido
    }
  }

  void _addIdea() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _ideas.insert(
        0,
        {
          'id': DateTime.now().microsecondsSinceEpoch.toString(),
          'content': text,
          'createdAt': DateTime.now(),
        },
      );
    });
    _textController.clear();
    _syncIdeas();
  }

  void _removeIdea(String id) {
    setState(() => _ideas.removeWhere((i) => i['id'] == id));
    _syncIdeas();
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
            title: t('brainDump'),
            menuSpace: widget.inShell,
            onBack: widget.inShell ? null : () => Navigator.pop(context),
          ),
          // Input
          Container(
            margin: const EdgeInsets.fromLTRB(24, 0, 24, 16),
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: colors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: colors.border),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    maxLines: 3,
                    minLines: 1,
                    style: TextStyle(color: colors.text, fontSize: 16),
                    cursorColor: colors.primary,
                    decoration: InputDecoration(
                      hintText: t('writeIdea'),
                      hintStyle: TextStyle(color: colors.textTertiary),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.all(12),
                      isDense: true,
                    ),
                  ),
                ),
                InkWell(
                  onTap: _addIdea,
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: colors.primary,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      '+',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Elenco idee
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _ideas.isEmpty
                    ? Center(
                        child: Text(
                          t('captureIdeasHere'),
                          style: TextStyle(color: colors.textTertiary, fontSize: 16),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(24, 0, 24, 100),
                        itemCount: _ideas.length,
                        itemBuilder: (context, i) {
                          final idea = _ideas[i];
                          final createdAt = idea['createdAt'] as DateTime?;
                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: colors.surface,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.03),
                                  blurRadius: 4,
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  idea['content']?.toString() ?? '',
                                  style: TextStyle(
                                    color: colors.text,
                                    fontSize: 15,
                                    height: 1.4,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      createdAt != null
                                          ? formatTime(createdAt)
                                          : '',
                                      style: TextStyle(
                                        color: colors.textTertiary,
                                        fontSize: 11,
                                      ),
                                    ),
                                    InkWell(
                                      onTap: () =>
                                          _removeIdea(idea['id'] as String),
                                      child: Text(
                                        t('delete'),
                                        style: TextStyle(
                                          color: colors.error,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
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

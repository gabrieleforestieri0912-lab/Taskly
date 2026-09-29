import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../utils/ui.dart';
import '../widgets/screen_header.dart';

class NotesScreen extends StatefulWidget {
  const NotesScreen({super.key, this.inShell = false});

  final bool inShell;

  @override
  State<NotesScreen> createState() => _NotesScreenState();
}

class _NotesScreenState extends State<NotesScreen> {
  // Ogni blocco tiene il proprio controller così il salvataggio può leggere
  // il testo corrente. I blocchi sono persistiti nel backend (tabella documents).
  final List<Map<String, dynamic>> _blocks = [
    {'id': '1', 'type': 'text', 'controller': TextEditingController()},
  ];
  bool _loading = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _loadDoc();
  }

  @override
  void dispose() {
    for (final b in _blocks) {
      (b['controller'] as TextEditingController?)?.dispose();
    }
    super.dispose();
  }

  Future<void> _loadDoc() async {
    try {
      final data = await Api.instance.getDoc('personal', 'notes');
      if (data is Map && data['blocks'] is List) {
        final raw = (data['blocks'] as List).cast<Map<String, dynamic>>();
        if (raw.isNotEmpty && mounted) {
          setState(() {
            for (final b in _blocks) {
              (b['controller'] as TextEditingController?)?.dispose();
            }
            _blocks
              ..clear()
              ..addAll(raw.map((b) {
                final type = b['type']?.toString() ?? 'text';
                final text = b['text']?.toString() ?? '';
                return {
                  'id': DateTime.now().microsecondsSinceEpoch.toString(),
                  'type': type,
                  'controller': TextEditingController(
                    text: type == 'divider' ? '' : text,
                  ),
                };
              }));
          });
        }
      }
    } catch (_) {
      // nessun documento salvato → rimane il blocco vuoto iniziale
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _addBlock(String type) {
    setState(() {
      _blocks.add({
        'id': DateTime.now().microsecondsSinceEpoch.toString(),
        'type': type,
        'controller': TextEditingController(),
      });
    });
  }

  void _removeBlock(String id) {
    setState(() {
      final idx = _blocks.indexWhere((b) => b['id'] == id);
      if (idx != -1) {
        (_blocks[idx]['controller'] as TextEditingController?)?.dispose();
        _blocks.removeAt(idx);
      }
    });
  }

  Future<void> _save() async {
    final t = context.read<LanguageProvider>().t;
    final userId = context.read<AuthProvider>().user?['id']?.toString() ?? '';
    final blocks = _blocks
        .map((b) => {
              'type': b['type'],
              'text': (b['controller'] as TextEditingController).text,
            })
        .toList();
    setState(() => _saving = true);
    try {
      await Api.instance.saveDoc({
        'workspaceId': 'personal',
        'slug': 'notes',
        'title': 'Notes',
        'blocks': blocks,
        'author': userId,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(t('save')),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } on ApiException catch (e) {
      if (mounted) {
        showAppDialog(
          context,
          t('error'),
          e.isConnectionError ? t('connectionError') : e.message,
        );
      }
    } catch (_) {
      if (mounted) showAppDialog(context, t('error'), t('connectionError'));
    } finally {
      if (mounted) setState(() => _saving = false);
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
            title: t('notes'),
            menuSpace: widget.inShell,
            onBack: widget.inShell ? null : () => Navigator.pop(context),
            actions: [
              if (_loading)
                const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              else
                InkWell(
                  onTap: _saving ? null : _save,
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: colors.surfaceAlt,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: _saving
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text(
                            '💾',
                            style: TextStyle(
                              color: colors.textSecondary,
                              fontSize: 16,
                            ),
                          ),
                  ),
                ),
            ],
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 120),
              children: [
                for (final block in _blocks)
                  _BlockRow(
                    key: ValueKey(block['id']),
                    type: block['type']!,
                    controller: block['controller'] as TextEditingController,
                    canRemove: _blocks.length > 1,
                    onRemove: () => _removeBlock(block['id']!),
                  ),
                const SizedBox(height: 16),
                // Toolbar blocchi
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _ToolbarButton(
                      label: 'T',
                      onTap: () => _addBlock('text'),
                    ),
                    _ToolbarButton(
                      label: 'H',
                      onTap: () => _addBlock('heading'),
                    ),
                    _ToolbarButton(
                      label: '☐',
                      onTap: () => _addBlock('checkbox'),
                    ),
                    _ToolbarButton(
                      label: '—',
                      onTap: () => _addBlock('divider'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ToolbarButton extends StatelessWidget {
  const _ToolbarButton({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: colors.surfaceAlt,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: colors.text,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

/// Riga di un blocco: gestisce il proprio controller di testo.
class _BlockRow extends StatefulWidget {
  const _BlockRow({
    super.key,
    required this.type,
    required this.controller,
    required this.canRemove,
    required this.onRemove,
  });

  final String type;
  final TextEditingController controller;
  final bool canRemove;
  final VoidCallback onRemove;

  @override
  State<_BlockRow> createState() => _BlockRowState();
}

class _BlockRowState extends State<_BlockRow> {
  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    final t = context.watch<LanguageProvider>().t;

    final Widget block = switch (widget.type) {
      'heading' => TextField(
          controller: widget.controller,
          style: TextStyle(
            color: colors.text,
            fontSize: 22,
            fontWeight: FontWeight.w700,
          ),
          decoration: InputDecoration(
            hintText: t('headingPlaceholder'),
            hintStyle: TextStyle(color: colors.textTertiary),
            border: InputBorder.none,
            isDense: true,
          ),
        ),
      'checkbox' => Row(
          children: [
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: colors.border, width: 2),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: widget.controller,
                style: TextStyle(color: colors.text, fontSize: 16),
                decoration: InputDecoration(
                  hintText: t('checklistItem'),
                  hintStyle: TextStyle(color: colors.textTertiary),
                  border: InputBorder.none,
                  isDense: true,
                ),
              ),
            ),
          ],
        ),
      'divider' => Container(
          height: 1,
          margin: const EdgeInsets.symmetric(vertical: 12),
          color: colors.border,
        ),
      _ => TextField(
          controller: widget.controller,
          maxLines: null,
          minLines: 1,
          style: TextStyle(color: colors.text, fontSize: 16, height: 1.5),
          decoration: InputDecoration(
            hintText: t('writeSomething'),
            hintStyle: TextStyle(color: colors.textTertiary),
            border: InputBorder.none,
            isDense: true,
          ),
        ),
    };

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(child: block),
        if (widget.canRemove)
          IconButton(
            onPressed: widget.onRemove,
            icon: const Icon(Icons.close, size: 16),
            color: colors.error,
            visualDensity: VisualDensity.compact,
          ),
      ],
    );
  }
}

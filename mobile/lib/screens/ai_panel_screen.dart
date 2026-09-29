import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../widgets/screen_header.dart';

class AIPanelScreen extends StatefulWidget {
  const AIPanelScreen({super.key, this.inShell = false});

  final bool inShell;

  @override
  State<AIPanelScreen> createState() => _AIPanelScreenState();
}

class _AIPanelScreenState extends State<AIPanelScreen> {
  late final List<Map<String, String>> _messages;
  final _inputController = TextEditingController();
  final _scrollController = ScrollController();
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    // Contenuto reale per la cronologia inviata al backend; a schermo viene
    // comunque ridisegnato con `t('aiWelcome')` (vedi `build`) per seguire
    // i cambi di lingua.
    _messages = [
      {
        'role': 'assistant',
        'content': context.read<LanguageProvider>().t('aiWelcome'),
      },
    ];
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _inputController.text.trim();
    if (text.isEmpty || _loading) return;

    final history = List<Map<String, String>>.from(_messages);
    setState(() {
      _messages.add({'role': 'user', 'content': text});
      _loading = true;
    });
    _inputController.clear();
    _scrollToEnd();

    try {
      final data = await Api.instance.aiChat({'message': text, 'history': history});
      final reply = data is Map ? (data['response'] ?? data['message']) : null;
      if (!mounted) return;
      setState(() {
        _messages.add({'role': 'assistant', 'content': reply?.toString() ?? '...'});
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _messages.add({
          'role': 'assistant',
          'content': context.read<LanguageProvider>().t('connectionError'),
        });
      });
    } finally {
      if (mounted) setState(() => _loading = false);
      _scrollToEnd();
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
            title: t('aiAssistant'),
            menuSpace: widget.inShell,
            onBack: widget.inShell ? null : () => Navigator.pop(context),
          ),
          // Chat
          Expanded(
            child: ListView(
              controller: _scrollController,
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
              children: [
                for (var i = 0; i < _messages.length; i++)
                  _buildMessage(
                    _messages[i],
                    colors,
                    // Il primo messaggio è il benvenuto: contenuto sempre aggiornato.
                    contentOverride: i == 0 ? t('aiWelcome') : null,
                  ),
                if (_loading)
                  _buildMessage(
                    {'role': 'assistant', 'content': '...'},
                    colors,
                  ),
              ],
            ),
          ),
          // Barra input
          Container(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
            decoration: BoxDecoration(
              color: colors.surface,
              border: Border(top: BorderSide(color: colors.border)),
            ),
            child: SafeArea(
              top: false,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Expanded(
                    child: AppTextFieldInline(
                      controller: _inputController,
                      hint: t('askSomething'),
                      onChanged: (_) => setState(() {}),
                    ),
                  ),
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: _loading ? null : _sendMessage,
                    borderRadius: BorderRadius.circular(22),
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: _loading ? colors.textTertiary : colors.primary,
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        '→',
                        style: TextStyle(color: Colors.white, fontSize: 18),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessage(
    Map<String, String> msg,
    AppColors colors, {
    String? contentOverride,
  }) {
    final isUser = msg['role'] == 'user';
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.sizeOf(context).width * 0.8,
        ),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isUser ? colors.primary : colors.surface,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(12),
            topRight: const Radius.circular(12),
            bottomLeft: Radius.circular(isUser ? 12 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 12),
          ),
        ),
        child: Text(
          contentOverride ?? msg['content'] ?? '',
          style: TextStyle(
            color: isUser ? Colors.white : colors.text,
            fontSize: 15,
            height: 1.4,
          ),
        ),
      ),
    );
  }
}

/// Variante compatta del campo di testo per la barra chat.
class AppTextFieldInline extends StatelessWidget {
  const AppTextFieldInline({
    super.key,
    required this.controller,
    required this.hint,
    this.onChanged,
  });

  final TextEditingController controller;
  final String hint;
  final ValueChanged<String>? onChanged;

  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    return TextField(
      controller: controller,
      maxLines: 3,
      minLines: 1,
      onChanged: onChanged,
      style: TextStyle(color: colors.text, fontSize: 15),
      cursorColor: colors.primary,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: colors.textTertiary),
        filled: true,
        fillColor: colors.background,
        contentPadding: const EdgeInsets.all(12),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colors.primary, width: 1.5),
        ),
      ),
    );
  }
}

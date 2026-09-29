import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/theme_provider.dart';

/// Intestazione condivisa delle schermate.
///
/// - [menuSpace] riserva lo spazio a sinistra per il pulsante hamburger del guscio principale.
/// - [onBack] mostra un pulsante indietro (schermate aperte da Dashboard/PageView).
class ScreenHeader extends StatelessWidget {
  const ScreenHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.actions,
    this.menuSpace = false,
    this.onBack,
    this.glow = false,
    this.badge,
  });

  final String title;
  final String? subtitle;
  final List<Widget>? actions;
  final bool menuSpace;
  final VoidCallback? onBack;
  final bool glow;
  final Widget? badge;

  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    final showBack = onBack != null;
    final leftPadding = menuSpace ? 56.0 : 24.0;

    return SafeArea(
      bottom: false,
      child: Padding(
        padding: EdgeInsets.only(top: 12, bottom: 12, left: leftPadding, right: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (badge != null) ...[
              badge!,
              const SizedBox(height: 10),
            ],
            Row(
              children: [
                if (showBack) ...[
                  IconButton(
                    onPressed: onBack,
                    icon: const Icon(Icons.arrow_back_ios_new, size: 20),
                    color: colors.text,
                  ),
                  const SizedBox(width: 4),
                ],
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          color: colors.text,
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          shadows: glow
                              ? [
                                  Shadow(
                                    color: colors.primary.withValues(alpha: 0.35),
                                    blurRadius: 18,
                                    offset: const Offset(0, 2),
                                  ),
                                ]
                              : null,
                        ),
                      ),
                      if (subtitle != null) _buildSubtitle(subtitle!, colors),
                    ],
                  ),
                ),
                ...?actions,
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubtitle(String subtitle, AppColors colors) {
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Text(
        subtitle,
        style: TextStyle(color: colors.textSecondary, fontSize: 16),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';

class _NavItem {
  const _NavItem(this.route, this.icon, this.labelKey);

  final String route;
  final String icon;
  final String labelKey;
}

const _navItems = [
  _NavItem('Tasks', '📋', 'tasks'),
  _NavItem('Notes', '📝', 'notes'),
  _NavItem('Goals', '🎯', 'goals'),
  _NavItem('Calendar', '📅', 'calendar'),
  _NavItem('BrainDump', '💡', 'brainDump'),
  _NavItem('AIPanel', '🤖', 'aiAssistant'),
  _NavItem('Activity', '📊', 'activity'),
  _NavItem('Templates', '📄', 'templates'),
  _NavItem('Settings', '⚙️', 'settings'),
];

/// Sidebar scorrevole a sinistra (porting di `src/components/Sidebar.js`).
class Sidebar extends StatelessWidget {
  const Sidebar({
    super.key,
    required this.currentRoute,
    required this.onNavigate,
  });

  final String currentRoute;
  final ValueChanged<String> onNavigate;

  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    final t = context.watch<LanguageProvider>().t;
    final auth = context.watch<AuthProvider>();
    final theme = context.watch<ThemeProvider>();

    final name = (auth.user?['name'] as String?) ?? '';
    final email = (auth.user?['email'] as String?) ?? '';
    final initial = name.isNotEmpty ? name[0].toUpperCase() : 'U';

    return Drawer(
      backgroundColor: colors.surface,
      width: 280,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
      child: SafeArea(
        child: Column(
          children: [
            // Profilo utente (tap per aprire il menu a discesa)
            PopupMenuButton<String>(
              color: colors.surface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              offset: const Offset(0, 8),
              onSelected: (value) async {
                if (value == 'Settings') {
                  Navigator.pop(context);
                  onNavigate('Settings');
                } else if (value == 'Logout') {
                  Navigator.pop(context);
                  await auth.logout();
                }
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                decoration: BoxDecoration(
                  border: Border(bottom: BorderSide(color: colors.border)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: colors.primary,
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        initial,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: colors.text,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            email,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: colors.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      Icons.expand_more,
                      size: 20,
                      color: colors.textSecondary,
                    ),
                  ],
                ),
              ),
              itemBuilder: (ctx) => [
                PopupMenuItem<String>(
                  enabled: false,
                  value: 'account',
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: colors.text,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        email,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: colors.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                PopupMenuItem<String>(
                  value: 'Settings',
                  child: Row(
                    children: [
                      Icon(Icons.settings, size: 18, color: colors.text),
                      const SizedBox(width: 10),
                      Text(
                        t('settings'),
                        style: TextStyle(color: colors.text),
                      ),
                    ],
                  ),
                ),
                PopupMenuItem<String>(
                  value: 'Logout',
                  child: Row(
                    children: [
                      Icon(Icons.logout, size: 18, color: colors.error),
                      const SizedBox(width: 10),
                      Text(
                        t('logout'),
                        style: TextStyle(color: colors.error),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            // Voci di navigazione
            Expanded(
              child: ListView(
                padding: const EdgeInsets.only(top: 8, bottom: 8),
                children: [
                  for (final item in _navItems)
                    _SidebarItem(
                      item: item,
                      colors: colors,
                      t: t,
                      isActive: currentRoute == item.route,
                      onTap: () {
                        Navigator.pop(context);
                        onNavigate(item.route);
                      },
                    ),
                ],
              ),
            ),
            // Footer: toggle tema
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: colors.border)),
              ),
              child: InkWell(
                onTap: theme.toggleTheme,
                borderRadius: BorderRadius.circular(10),
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: Row(
                    children: [
                      Text(
                        theme.isDark ? '☀️' : '🌙',
                        style: const TextStyle(fontSize: 18),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        theme.isDark ? t('lightMode') : t('darkMode'),
                        style: TextStyle(color: colors.text, fontSize: 14),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  const _SidebarItem({
    required this.item,
    required this.colors,
    required this.t,
    required this.isActive,
    required this.onTap,
  });

  final _NavItem item;
  final AppColors colors;
  final String Function(String) t;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 8),
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
        decoration: BoxDecoration(
          color: isActive ? colors.primaryLight : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            SizedBox(
              width: 28,
              child: Text(item.icon, style: const TextStyle(fontSize: 18)),
            ),
            const SizedBox(width: 4),
            Text(
              t(item.labelKey),
              style: TextStyle(
                color: isActive ? colors.primary : colors.text,
                fontSize: 15,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

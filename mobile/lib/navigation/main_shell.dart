import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/theme_provider.dart';
import '../screens/activity_screen.dart';
import '../screens/ai_panel_screen.dart';
import '../screens/brain_dump_screen.dart';
import '../screens/calendar_screen.dart';
import '../screens/dashboard_screen.dart';
import '../screens/goals_screen.dart';
import '../screens/notes_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/tasks_screen.dart';
import '../screens/templates_screen.dart';
import '../widgets/sidebar.dart';

/// Guscio principale (porting di `src/navigation/MainTabs.js`):
/// sidebar hamburger + schermate + tab bar inferiore.
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  static const List<String> _routes = [
    'Dashboard',
    'Tasks',
    'Notes',
    'Goals',
    'Calendar',
    'BrainDump',
    'AIPanel',
    'Activity',
    'Templates',
    'Settings',
  ];

  static const List<String> _tabItems = [
    'Dashboard',
    'Tasks',
    'Notes',
    'AIPanel',
    'Settings',
  ];

  static const List<String> _tabIcons = ['🏠', '📋', '📝', '🤖', '⚙️'];

  String _activeRoute = 'Dashboard';

  void _goToRoute(String route) {
    setState(() => _activeRoute = route);
  }

  Widget _buildScreen(String route) {
    switch (route) {
      case 'Dashboard':
        return DashboardScreen(
          inShell: true,
          onNavigateTab: _goToRoute,
        );
      case 'Tasks':
        return const TasksScreen(inShell: true);
      case 'Notes':
        return const NotesScreen(inShell: true);
      case 'Goals':
        return const GoalsScreen(inShell: true);
      case 'Calendar':
        return const CalendarScreen(inShell: true);
      case 'BrainDump':
        return const BrainDumpScreen(inShell: true);
      case 'AIPanel':
        return const AIPanelScreen(inShell: true);
      case 'Activity':
        return const ActivityScreen(inShell: true);
      case 'Templates':
        return const TemplatesScreen(inShell: true);
      case 'Settings':
        return const SettingsScreen(inShell: true);
      default:
        return const TasksScreen(inShell: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    final topInset = MediaQuery.paddingOf(context).top;

    return Scaffold(
      key: _scaffoldKey,
      drawer: Sidebar(currentRoute: _activeRoute, onNavigate: _goToRoute),
      body: Stack(
        children: [
          Positioned.fill(
            child: IndexedStack(
              index: _routes.indexOf(_activeRoute),
              children: [for (final route in _routes) _buildScreen(route)],
            ),
          ),
          // Pulsante hamburger
          Positioned(
            top: topInset + 10,
            left: 16,
            child: Material(
              color: colors.surface,
              elevation: 3,
              borderRadius: BorderRadius.circular(12),
              child: InkWell(
                onTap: () => _scaffoldKey.currentState?.openDrawer(),
                borderRadius: BorderRadius.circular(12),
                child: const SizedBox(
                  width: 40,
                  height: 40,
                  child: Center(
                    child: Text('☰', style: TextStyle(fontSize: 20)),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: colors.surface,
          border: Border(top: BorderSide(color: colors.border)),
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Row(
              children: [
                for (var i = 0; i < _tabItems.length; i++)
                  Expanded(
                    child: InkWell(
                      onTap: () => _goToRoute(_tabItems[i]),
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        decoration: BoxDecoration(
                          color: _activeRoute == _tabItems[i]
                              ? colors.primaryLight
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          _tabIcons[i],
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 22),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

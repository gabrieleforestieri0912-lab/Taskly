import 'package:flutter/material.dart';

import 'brain_dump_screen.dart';
import 'calendar_screen.dart';
import 'goals_screen.dart';
import 'notes_screen.dart';
import 'tasks_screen.dart';

/// Schermata aperta dal Dashboard "Nuova pagina" (porting di `src/screens/PageViewScreen.js`).
class PageViewScreen extends StatelessWidget {
  const PageViewScreen({super.key, required this.type});

  final String type;

  @override
  Widget build(BuildContext context) {
    switch (type) {
      case 'notes':
        return const NotesScreen(inShell: false);
      case 'goals':
        return const GoalsScreen(inShell: false);
      case 'calendar':
        return const CalendarScreen(inShell: false);
      case 'braindump':
        return const BrainDumpScreen(inShell: false);
      default:
        return const TasksScreen(inShell: false);
    }
  }
}

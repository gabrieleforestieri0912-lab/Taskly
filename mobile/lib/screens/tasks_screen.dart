import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../utils/ui.dart';
import '../widgets/screen_header.dart';

const _statuses = ['todo', 'inprogress', 'done'];

const _priorityColors = {
  'low': Color(0xFF6B7280),
  'medium': Color(0xFFF59E0B),
  'high': Color(0xFFEF4444),
  'urgent': Color(0xFFDC2626),
};

class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key, this.inShell = false});

  final bool inShell;

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  List<Map<String, dynamic>> _tasks = [];
  bool _loading = true;
  String _filter = 'all';
  bool _kanban = false;
  final _titleController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadTasks();
  }

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  Future<void> _loadTasks() async {
    try {
      // Il backend richiede lo `workspace` (default 'personal').
      final params = <String, dynamic>{'workspace': 'personal'};
      if (_filter != 'all') params['status'] = _filter;
      final data = await Api.instance.listTasks(params);
      final list = _extractList(data, 'tasks');
      if (!mounted) return;
      setState(() => _tasks = list);
    } catch (_) {
      // nessuna azione
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<Map<String, dynamic>> _extractList(dynamic data, String key) {
    if (data is List) return data.cast<Map<String, dynamic>>();
    if (data is Map && data[key] is List) {
      return (data[key] as List).cast<Map<String, dynamic>>();
    }
    return [];
  }

  /// Crea l'attività e ricarica la lista (nessun uso di `context` dopo `await`).
  Future<void> _createTask(String title) async {
    await Api.instance.createTask({'title': title});
    _titleController.clear();
    await _loadTasks();
  }

  Future<void> _toggleStatus(Map<String, dynamic> task) async {
    final current = task['status'] as String? ?? 'todo';
    final next = current == 'todo'
        ? 'inprogress'
        : current == 'inprogress'
            ? 'done'
            : 'todo';
    try {
      await Api.instance.updateTask(task['_id'] as String, {'status': next});
      await _loadTasks();
    } catch (_) {
      // nessuna azione
    }
  }

  Future<void> _handleDelete(Map<String, dynamic> task) async {
    final t = context.read<LanguageProvider>().t;
    final ok = await confirmDialog(
      context,
      title: t('delete'),
      message: t('deleteConfirm'),
      cancelLabel: t('cancel'),
      confirmLabel: t('delete'),
    );
    if (!ok) return;
    try {
      await Api.instance.deleteTask(task['_id'] as String);
      await _loadTasks();
    } catch (_) {
      // nessuna azione
    }
  }

  String _statusLabel(String status, String Function(String) t) {
    switch (status) {
      case 'todo':
        return t('todo');
      case 'inprogress':
        return t('inProgress');
      case 'done':
        return t('done');
      default:
        return status;
    }
  }

  Widget _buildKanban(AppColors colors, String Function(String) t) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (final status in _statuses)
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(
                      _statusLabel(status, t).toUpperCase(),
                      style: TextStyle(
                        color: colors.textSecondary,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  for (final task in _tasks.where((x) => x['status'] == status))
                    _KanbanCard(
                      task: task,
                      onTap: () => _toggleStatus(task),
                      onLongPress: () => _handleDelete(task),
                    ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    final t = context.watch<LanguageProvider>().t;

    final filtered = _filter == 'all'
        ? _tasks
        : _tasks.where((x) => x['status'] == _filter).toList();

    return Scaffold(
      backgroundColor: colors.background,
      body: Column(
        children: [
          ScreenHeader(
            title: t('tasks'),
            menuSpace: widget.inShell,
            onBack: widget.inShell ? null : () => Navigator.pop(context),
            actions: [
              // Toggle vista lista/kanban
              InkWell(
                onTap: () => setState(() => _kanban = !_kanban),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: colors.surfaceAlt,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _kanban ? '📌' : '📋',
                    style: TextStyle(color: colors.textSecondary, fontSize: 12),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Pulsante aggiungi
              InkWell(
                onTap: () => _openAddSheet(colors),
                borderRadius: BorderRadius.circular(18),
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: colors.primary,
                    shape: BoxShape.circle,
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
          // Filtri
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              children: [
                for (final s in ['all', ..._statuses])
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      onTap: () => setState(() => _filter = s),
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: _filter == s
                              ? colors.primary
                              : colors.surfaceAlt,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          s == 'all' ? t('all') : _statusLabel(s, t),
                          style: TextStyle(
                            color: _filter == s
                                ? Colors.white
                                : colors.textSecondary,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Contenuto
          Expanded(
            child: _kanban
                ? SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: _buildKanban(colors, t),
                  )
                : RefreshIndicator(
                    onRefresh: _loadTasks,
                    child: filtered.isEmpty
                        ? ListView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            children: [
                              Padding(
                                padding: const EdgeInsets.only(top: 60),
                                child: Text(
                                  _loading ? t('loading') : t('noTasks'),
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    color: colors.textTertiary,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                            ],
                          )
                        : ListView.builder(
                            physics: const AlwaysScrollableScrollPhysics(),
                            padding: const EdgeInsets.fromLTRB(24, 8, 24, 100),
                            itemCount: filtered.length,
                            itemBuilder: (context, i) {
                              final task = filtered[i];
                              return _TaskCard(
                                task: task,
                                colors: colors,
                                t: t,
                                onTap: () => _toggleStatus(task),
                                onLongPress: () => _handleDelete(task),
                              );
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }

  void _openAddSheet(AppColors colors) {
    _titleController.clear();
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: colors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => _AddTaskSheet(
        titleController: _titleController,
        onCreate: _createTask,
      ),
    );
  }
}

/// Bottom sheet per creare una nuova attività.
/// Widget stateful dedicato così lo spinner si aggiorna correttamente.
class _AddTaskSheet extends StatefulWidget {
  const _AddTaskSheet({
    required this.titleController,
    required this.onCreate,
  });

  final TextEditingController titleController;
  final Future<void> Function(String title) onCreate;

  @override
  State<_AddTaskSheet> createState() => _AddTaskSheetState();
}

class _AddTaskSheetState extends State<_AddTaskSheet> {
  bool _creating = false;

  Future<void> _submit() async {
    final title = widget.titleController.text.trim();
    if (title.isEmpty || _creating) return;
    setState(() => _creating = true);
    try {
      await widget.onCreate(title);
      if (mounted) Navigator.pop(context);
    } catch (_) {
      if (mounted) {
        final t = context.read<LanguageProvider>().t;
        showAppDialog(context, t('error'), t('cannotCreateTask'));
      }
    } finally {
      if (mounted) setState(() => _creating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    final t = context.watch<LanguageProvider>().t;

    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.paddingOf(context).bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            t('addTask'),
            style: TextStyle(
              color: colors.text,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 16),
          AppTextField(
            controller: widget.titleController,
            hint: t('taskTitle'),
            autofocus: true,
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: _creating ? null : () => Navigator.pop(context),
                child: Text(
                  t('cancel'),
                  style: TextStyle(
                    color: colors.textSecondary,
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: _creating ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: colors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _creating
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : Text(
                        t('create'),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TaskCard extends StatelessWidget {
  const _TaskCard({
    required this.task,
    required this.colors,
    required this.t,
    required this.onTap,
    required this.onLongPress,
  });

  final Map<String, dynamic> task;
  final AppColors colors;
  final String Function(String) t;
  final VoidCallback onTap;
  final VoidCallback onLongPress;

  @override
  Widget build(BuildContext context) {
    final done = task['status'] == 'done';
    final priority = task['priority'] as String?;
    final priorityColor = priority != null ? _priorityColors[priority] : null;
    final dueDate = task['dueDate'];

    return GestureDetector(
      onTap: onTap,
      onLongPress: onLongPress,
      child: Container(
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
        child: Row(
          children: [
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                color: done ? colors.success : Colors.transparent,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: done ? colors.success : colors.border,
                  width: 2,
                ),
              ),
              alignment: Alignment.center,
              child: done
                  ? const Text(
                      '✓',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    task['title']?.toString() ?? '',
                    style: TextStyle(
                      color: colors.text,
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      decoration: done ? TextDecoration.lineThrough : null,
                    ),
                  ),
                  if (priority != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(
                        t(priority),
                        style: TextStyle(
                          color: priorityColor,
                          fontSize: 11,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            if (dueDate != null)
              Text(
                formatDate(dueDate),
                style: TextStyle(color: colors.textTertiary, fontSize: 11),
              ),
          ],
        ),
      ),
    );
  }
}

class _KanbanCard extends StatelessWidget {
  const _KanbanCard({
    required this.task,
    required this.onTap,
    required this.onLongPress,
  });

  final Map<String, dynamic> task;
  final VoidCallback onTap;
  final VoidCallback onLongPress;

  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    final t = context.watch<LanguageProvider>().t;
    final priority = task['priority'] as String?;
    final priorityColor = priority != null ? _priorityColors[priority] : null;

    return GestureDetector(
      onTap: onTap,
      onLongPress: onLongPress,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: colors.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: colors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              task['title']?.toString() ?? '',
              style: TextStyle(color: colors.text, fontSize: 13),
            ),
            if (priority != null && priorityColor != null) ...[
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 6,
                  vertical: 2,
                ),
                decoration: BoxDecoration(
                  color: priorityColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  t(priority),
                  style: TextStyle(
                    color: priorityColor,
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

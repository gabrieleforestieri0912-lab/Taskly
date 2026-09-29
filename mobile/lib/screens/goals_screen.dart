import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../utils/ui.dart';
import '../widgets/screen_header.dart';

class GoalsScreen extends StatefulWidget {
  const GoalsScreen({super.key, this.inShell = false});

  final bool inShell;

  @override
  State<GoalsScreen> createState() => _GoalsScreenState();
}

class _GoalsScreenState extends State<GoalsScreen> {
  List<Map<String, dynamic>> _goals = [];
  bool _loading = true;
  final _titleController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadGoals();
  }

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  Future<void> _loadGoals() async {
    try {
      final data = await Api.instance.getUserData();
      final goals = (data['goals'] as List?) ?? <dynamic>[];
      if (!mounted) return;
      setState(() => _goals = goals.cast<Map<String, dynamic>>());
    } catch (_) {
      // nessuna azione
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _createGoal(String title) async {
    final newGoal = <String, dynamic>{
      'id': DateTime.now().microsecondsSinceEpoch.toString(),
      'title': title,
      'description': '',
      'completed': false,
      'subGoals': <dynamic>[],
    };
    final updated = [..._goals, newGoal];
    try {
      await Api.instance.syncUserData({'goals': updated});
      if (!mounted) return;
      setState(() => _goals = updated);
    } catch (_) {
      if (mounted) {
        final t = context.read<LanguageProvider>().t;
        showAppDialog(context, t('error'), t('cannotCreateGoal'));
      }
    }
  }

  Future<void> _toggleGoal(String id) async {
    final updated = _goals
        .map((g) =>
            g['id'] == id ? {...g, 'completed': !(g['completed'] == true)} : g)
        .toList();
    setState(() => _goals = updated);
    try {
      await Api.instance.syncUserData({'goals': updated});
    } catch (_) {
      // nessuna azione
    }
  }

  Future<void> _toggleSubGoal(String goalId, String subId) async {
    final updated = _goals.map((g) {
      if (g['id'] != goalId) return g;
      final subGoals = ((g['subGoals'] as List?) ?? <dynamic>[])
          .map((sg) => sg is Map<String, dynamic> && sg['id'] == subId
              ? {...sg, 'completed': !(sg['completed'] == true)}
              : sg)
          .toList();
      return {...g, 'subGoals': subGoals};
    }).toList();
    setState(() => _goals = updated);
    try {
      await Api.instance.syncUserData({'goals': updated});
    } catch (_) {
      // nessuna azione
    }
  }

  Future<void> _addSubGoal(String goalId) async {
    final t = context.read<LanguageProvider>().t;
    final controller = TextEditingController();
    final title = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(t('newSubGoal')),
        content: AppTextField(controller: controller, hint: t('title')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(t('cancel')),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, controller.text.trim()),
            child: Text(t('create')),
          ),
        ],
      ),
    );
    controller.dispose();
    if (title == null || title.isEmpty) return;
    final updated = _goals.map((g) {
      if (g['id'] != goalId) return g;
      final subGoals = (g['subGoals'] as List?) ?? <dynamic>[];
      return {
        ...g,
        'subGoals': [
          ...subGoals,
          {
            'id': DateTime.now().microsecondsSinceEpoch.toString(),
            'title': title,
            'completed': false,
          },
        ],
      };
    }).toList();
    setState(() => _goals = updated);
    try {
      await Api.instance.syncUserData({'goals': updated});
    } catch (_) {
      // nessuna azione
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    final t = context.watch<LanguageProvider>().t;

    final progress = _goals.isEmpty
        ? 0
        : ((_goals.where((g) => g['completed'] == true).length / _goals.length) *
                100)
            .round();

    return Scaffold(
      backgroundColor: colors.background,
      body: Column(
        children: [
          ScreenHeader(
            title: t('goals'),
            menuSpace: widget.inShell,
            onBack: widget.inShell ? null : () => Navigator.pop(context),
            actions: [
              InkWell(
                onTap: () => _openAddSheet(colors, t),
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
          if (_goals.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
              child: Row(
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: progress / 100,
                        minHeight: 8,
                        backgroundColor: colors.surfaceAlt,
                        valueColor: AlwaysStoppedAnimation(colors.success),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    '$progress%',
                    style: TextStyle(
                      color: colors.textSecondary,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          Expanded(
            child: _goals.isEmpty && !_loading
                ? Center(
                    child: Text(
                      t('noGoals'),
                      style: TextStyle(color: colors.textTertiary, fontSize: 16),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(24, 0, 24, 100),
                    itemCount: _goals.length,
                    itemBuilder: (context, i) => _GoalCard(
                      goal: _goals[i],
                      colors: colors,
                      t: t,
                      onToggleGoal: () => _toggleGoal(_goals[i]['id'] as String),
                      onToggleSub: (subId) =>
                          _toggleSubGoal(_goals[i]['id'] as String, subId),
                      onAddSub: () => _addSubGoal(_goals[i]['id'] as String),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  void _openAddSheet(AppColors colors, String Function(String) t) {
    _titleController.clear();
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: colors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 24,
          bottom: MediaQuery.paddingOf(ctx).bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              t('newGoal'),
              style: TextStyle(
                color: colors.text,
                fontSize: 20,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 16),
            AppTextField(
              controller: _titleController,
              hint: t('goalTitle'),
              autofocus: true,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
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
                  onPressed: () {
                    final title = _titleController.text.trim();
                    if (title.isEmpty) return;
                    Navigator.pop(ctx);
                    _createGoal(title);
                  },
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
                  child: Text(
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
      ),
    );
  }
}

class _GoalCard extends StatelessWidget {
  const _GoalCard({
    required this.goal,
    required this.colors,
    required this.t,
    required this.onToggleGoal,
    required this.onToggleSub,
    required this.onAddSub,
  });

  final Map<String, dynamic> goal;
  final AppColors colors;
  final String Function(String) t;
  final VoidCallback onToggleGoal;
  final ValueChanged<String> onToggleSub;
  final VoidCallback onAddSub;

  @override
  Widget build(BuildContext context) {
    final done = goal['completed'] == true;
    final subGoals = (goal['subGoals'] as List?) ?? <dynamic>[];

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
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
          InkWell(
            onTap: onToggleGoal,
            borderRadius: BorderRadius.circular(8),
            child: Row(
              children: [
                _GoalCheckbox(checked: done, size: 22),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    goal['title']?.toString() ?? '',
                    style: TextStyle(
                      color: colors.text,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      decoration: done ? TextDecoration.lineThrough : null,
                    ),
                  ),
                ),
              ],
            ),
          ),
          for (final sg in subGoals.cast<Map<String, dynamic>>())
            InkWell(
              onTap: () => onToggleSub(sg['id'] as String),
              borderRadius: BorderRadius.circular(6),
              child: Padding(
                padding: const EdgeInsets.only(top: 8, left: 34),
                child: Row(
                  children: [
                    _GoalCheckbox(checked: sg['completed'] == true, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        sg['title']?.toString() ?? '',
                        style: TextStyle(
                          color: colors.textSecondary,
                          fontSize: 14,
                          decoration: sg['completed'] == true
                              ? TextDecoration.lineThrough
                              : null,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.only(top: 8, left: 34),
            child: TextButton(
              onPressed: onAddSub,
              style: TextButton.styleFrom(
                padding: EdgeInsets.zero,
                minimumSize: const Size(0, 32),
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Text(
                t('addSubGoal'),
                style: TextStyle(color: colors.primary, fontSize: 13),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _GoalCheckbox extends StatelessWidget {
  const _GoalCheckbox({required this.checked, required this.size});

  final bool checked;
  final double size;

  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: checked ? colors.success : Colors.transparent,
        shape: BoxShape.circle,
        border: Border.all(
          color: checked ? colors.success : colors.border,
          width: 2,
        ),
      ),
      alignment: Alignment.center,
      child: checked
          ? Text(
              '✓',
              style: TextStyle(
                color: Colors.white,
                fontSize: size * 0.55,
                fontWeight: FontWeight.w700,
              ),
            )
          : null,
    );
  }
}

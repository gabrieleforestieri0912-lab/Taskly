import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../i18n/translations.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../widgets/screen_header.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key, this.inShell = false});

  final bool inShell;

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  late final DateTime _today;
  late int _currentMonth; // 1-based
  late int _currentYear;
  int? _selectedDate;

  @override
  void initState() {
    super.initState();
    _today = DateTime.now();
    _currentMonth = _today.month;
    _currentYear = _today.year;
  }

  void _prevMonth() {
    setState(() {
      if (_currentMonth == 1) {
        _currentMonth = 12;
        _currentYear -= 1;
      } else {
        _currentMonth -= 1;
      }
    });
  }

  void _nextMonth() {
    setState(() {
      if (_currentMonth == 12) {
        _currentMonth = 1;
        _currentYear += 1;
      } else {
        _currentMonth += 1;
      }
    });
  }

  /// Cellule del calendario: `{'day': int, 'other': bool}`.
  List<Map<String, dynamic>> _buildDays() {
    final firstDay = DateTime(_currentYear, _currentMonth, 1).weekday % 7; // 0 = domenica
    final daysInMonth = DateTime(_currentYear, _currentMonth + 1, 0).day;
    final daysInPrevMonth = DateTime(_currentYear, _currentMonth, 0).day;

    final days = <Map<String, dynamic>>[];
    for (var i = firstDay - 1; i >= 0; i--) {
      days.add({'day': daysInPrevMonth - i, 'other': true});
    }
    for (var i = 1; i <= daysInMonth; i++) {
      days.add({'day': i, 'other': false});
    }
    var next = 1;
    while (days.length % 7 != 0) {
      days.add({'day': next, 'other': true});
      next++;
    }
    return days;
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.watch<ThemeProvider>().colors;
    final language = context.watch<LanguageProvider>().language;
    final t = context.watch<LanguageProvider>().t;

    final monthNames = Translations.months[language] ?? Translations.months['it']!;
    final dayNames = Translations.weekdays[language] ?? Translations.weekdays['it']!;
    final days = _buildDays();

    return Scaffold(
      backgroundColor: colors.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          ScreenHeader(
            title: t('calendar'),
            menuSpace: widget.inShell,
            onBack: widget.inShell ? null : () => Navigator.pop(context),
          ),
          // Navigazione mese
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              children: [
                InkWell(
                  onTap: _prevMonth,
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.all(8),
                    child: Text(
                      '←',
                      style: TextStyle(
                        color: colors.primary,
                        fontSize: 24,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: Text(
                    '${monthNames[_currentMonth - 1]} $_currentYear',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: colors.text,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                InkWell(
                  onTap: _nextMonth,
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.all(8),
                    child: Text(
                      '→',
                      style: TextStyle(
                        color: colors.primary,
                        fontSize: 24,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Nomi dei giorni
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                for (final d in dayNames)
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Text(
                        d,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: colors.textTertiary,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          // Griglia dei giorni
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GridView.count(
              crossAxisCount: 7,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                for (final d in days) _buildDayCell(d, colors),
              ],
            ),
          ),
          // Dettaglio del giorno
          Expanded(
            child: Container(
              width: double.infinity,
              margin: const EdgeInsets.only(top: 16),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: colors.surface,
                border: Border(top: BorderSide(color: colors.border)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _selectedDate != null
                        ? '$_selectedDate ${monthNames[_currentMonth - 1]} $_currentYear'
                        : t('selectDay'),
                    style: TextStyle(
                      color: colors.text,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (_selectedDate != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      t('noActivityForDay'),
                      style: TextStyle(color: colors.textTertiary, fontSize: 14),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDayCell(Map<String, dynamic> d, AppColors colors) {
    final day = d['day'] as int;
    final other = d['other'] as bool;
    final isToday = !other &&
        day == _today.day &&
        _currentMonth == _today.month &&
        _currentYear == _today.year;
    final isSelected = !other && day == _selectedDate;

    return Padding(
      padding: const EdgeInsets.all(1),
      child: InkWell(
        onTap: other ? null : () => setState(() => _selectedDate = day),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isSelected
                ? colors.primary
                : isToday
                    ? colors.primaryLight
                    : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            '$day',
            style: TextStyle(
              color: other
                  ? colors.textTertiary
                  : isSelected
                      ? Colors.white
                      : colors.text,
              fontWeight: isToday ? FontWeight.w700 : FontWeight.w400,
              fontSize: 14,
            ),
          ),
        ),
      ),
    );
  }
}

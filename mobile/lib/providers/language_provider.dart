import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../i18n/translations.dart';

/// Gestione lingua con lookup delle traduzioni (porting di `src/context/LanguageContext.js`).
class LanguageProvider extends ChangeNotifier {
  String _language = 'it';
  String get language => _language;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('language');
    if (saved != null && Translations.all.containsKey(saved)) {
      _language = saved;
      notifyListeners();
    }
  }

  Future<void> setLanguage(String lang) async {
    if (!Translations.all.containsKey(lang)) return;
    _language = lang;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language', lang);
  }

  /// Traduce una chiave; fallback sulla lingua italiana, poi sulla chiave.
  String t(String key) {
    final table = Translations.all[_language];
    if (table != null && table.containsKey(key)) return table[key]!;
    return Translations.all['it']?[key] ?? key;
  }
}

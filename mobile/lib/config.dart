import 'dart:io';

import 'package:flutter/foundation.dart';

/// Configurazione dell'app (porting di `src/config.js`).
///
/// - Emulatore Android → `10.0.2.2` raggiunge la macchina host
/// - Simulatore iOS → `localhost` funziona
/// - Dispositivo fisico → usa l'IP della tua macchina sulla LAN
class Config {
  Config._();

  /// Cambia qui l'URL quando deployi o testi su device fisico.
  static String get apiBase {
    if (!kIsWeb && Platform.isAndroid) return 'http://10.0.2.2:3000/api';
    return 'http://localhost:3000/api';
  }

  static const String socketUrl = 'http://localhost:3000';
}

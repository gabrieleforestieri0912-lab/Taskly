import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../services/api_client.dart';
import '../services/supabase_client.dart';

/// Stato di autenticazione basato su Supabase Auth (porting di `AuthContext.js`).
///
/// La sessione è persistita automaticamente da `supabase_flutter`, quindi
/// `load()` ripristina l'utente corrente senza richiamare il backend.
class AuthProvider extends ChangeNotifier {
  Map<String, dynamic>? _user;
  bool _loading = true;

  Map<String, dynamic>? get user => _user;
  bool get loading => _loading;
  bool get isAuthenticated => _user != null;

  SupabaseClient get _supabase => SupabaseConfig.client;

  /// Ripristina l'utente dalla sessione Supabase persistita.
  Future<void> load() async {
    try {
      final session = _supabase.auth.currentSession;
      if (session != null) {
        _user = _userFromSession(session);
      }
    } catch (_) {
      // riparte non autenticato
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  /// Costruisce l'oggetto `user` (shape compatibile col backend: id, name, email, picture).
  Map<String, dynamic> _userFromSession(Session session) {
    final u = session.user;
    final meta = u.userMetadata ?? <String, dynamic>{};
    final name = meta['name']?.toString() ?? u.email?.split('@').first;
    return <String, dynamic>{
      'id': u.id,
      'name': name,
      'email': u.email,
      'picture': meta['picture']?.toString(),
    };
  }

  Future<void> login(String email, String password) async {
    final res = await _supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );
    if (res.session == null) {
      throw ApiException(401, 'Invalid credentials');
    }
    _user = _userFromSession(res.session!);
    notifyListeners();
  }

  Future<void> register(String name, String email, String password) async {
    final res = await _supabase.auth.signUp(
      email: email,
      password: password,
      data: {'name': name},
    );
    // Se è richiesta la conferma email, Supabase non restituisce la sessione.
    if (res.session == null) {
      throw ApiException(
        201,
        'Account creato. Controlla la tua email per confermare la registrazione.',
      );
    }
    _user = _userFromSession(res.session!);
    notifyListeners();
  }

  /// Login con Google tramite flusso OAuth (browser di sistema).
  Future<void> googleAuth([String? _]) async {
    final ok = await _supabase.auth.signInWithOAuth(OAuthProvider.google);
    if (!ok) {
      throw ApiException(400, 'Google login non riuscito');
    }
  }

  Future<void> logout() async {
    await _supabase.auth.signOut();
    _user = null;
    notifyListeners();
  }
}

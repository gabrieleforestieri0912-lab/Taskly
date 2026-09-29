import 'package:dio/dio.dart';

import '../config.dart';
import '../services/supabase_client.dart';

/// Eccezione applicativa con il messaggio restituito dal backend.
class ApiException implements Exception {
  const ApiException(
    this.statusCode,
    this.message, {
    this.isConnectionError = false,
  });

  final int? statusCode;
  final String message;

  /// `true` quando non c'è risposta (errore di rete): il messaggio
  /// viene mostrato localizzato dall'interfaccia.
  final bool isConnectionError;

  @override
  String toString() => message;
}

/// Client HTTP equivalente ad `axios` (`src/api/client.js`).
///
/// Il token Bearer è la sessione Supabase dell'utente corrente: il backend
/// lo verifica con `SUPABASE_JWT_SECRET`, quindi i dati sono gli stessi del
/// progetto web.
class Api {
  Api._() {
    _dio = Dio(
      BaseOptions(
        baseUrl: Config.apiBase,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {'Content-Type': 'application/json'},
      ),
    );
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token =
              SupabaseConfig.client.auth.currentSession?.accessToken;
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (e, handler) {
          // Il 401 viene gestito in `_guard` (tenta il refresh del token).
          handler.next(e);
        },
      ),
    );
  }

  static final Api instance = Api._();

  late final Dio _dio;

  dynamic _guard(Future<Response<dynamic>> Function() request) async {
    try {
      final res = await request();
      return res.data;
    } on DioException catch (e) {
      return _handleError(e, request);
    }
  }

  /// Gestisce un errore Dio: in caso di 401 tenta il refresh della sessione
  /// Supabase e ritenta una sola volta, specchiando il comportamento del client web.
  Future<dynamic> _handleError(
    DioException e,
    Future<Response<dynamic>> Function() request,
  ) async {
    if (e.response?.statusCode == 401) {
      final refreshed = await _tryRefresh();
      if (refreshed) {
        try {
          final res = await request();
          return res.data;
        } on DioException catch (e2) {
          await _clearSession();
          return _fail(e2);
        }
      }
      await _clearSession();
    }
    return _fail(e);
  }

  /// Elimina la sessione Supabase salvata.
  Future<void> _clearSession() async {
    try {
      await SupabaseConfig.client.auth.signOut();
    } catch (_) {
      // ignora: la sessione è già stata rimossa
    }
  }

  /// Tenta il refresh della sessione Supabase (usa il refresh token salvato
  /// internamente da `supabase_flutter`).
  Future<bool> _tryRefresh() async {
    try {
      final res = await SupabaseConfig.client.auth.refreshSession();
      return res.session != null;
    } catch (_) {
      return false;
    }
  }

  dynamic _fail(DioException e) {
    final isConnection = e.response == null;
    var message = 'Connessione al server non riuscita.';
    final data = e.response?.data;
    if (data is Map && data['message'] != null) {
      message = data['message'].toString();
    }
    throw ApiException(
      e.response?.statusCode,
      message,
      isConnectionError: isConnection,
    );
  }

  // ─── USER ────────────────────────────────────────────────────────────────
  Future<dynamic> getUserData() => _guard(() => _dio.get('/user/data'));

  Future<dynamic> syncUserData(Map<String, dynamic> data) =>
      _guard(() => _dio.post('/user/data', data: data));

  Future<dynamic> getSubscription() =>
      _guard(() => _dio.get('/user/subscription'));

  // ─── TASKS ───────────────────────────────────────────────────────────────
  Future<dynamic> listTasks([Map<String, dynamic>? params]) =>
      _guard(() => _dio.get('/tasks', queryParameters: params));

  Future<dynamic> getTask(String id) => _guard(() => _dio.get('/tasks/$id'));

  Future<dynamic> createTask(Map<String, dynamic> data) =>
      _guard(() => _dio.post('/tasks', data: data));

  Future<dynamic> updateTask(String id, Map<String, dynamic> data) =>
      _guard(() => _dio.put('/tasks/$id', data: data));

  Future<dynamic> deleteTask(String id) =>
      _guard(() => _dio.delete('/tasks/$id'));

  // ─── AI ──────────────────────────────────────────────────────────────────
  Future<dynamic> aiChat(Map<String, dynamic> data) =>
      _guard(() => _dio.post('/ai/chat', data: data));

  // ─── DOCS ────────────────────────────────────────────────────────────────
  Future<dynamic> searchDocs([Map<String, dynamic>? params]) =>
      _guard(() => _dio.get('/doc/search', queryParameters: params));

  Future<dynamic> getDoc(String workspace, String slug) =>
      _guard(() => _dio.get('/doc/$workspace/$slug'));

  Future<dynamic> saveDoc(Map<String, dynamic> data) =>
      _guard(() => _dio.post('/doc/save', data: data));

  Future<dynamic> getDocVersions(String id) =>
      _guard(() => _dio.get('/doc/$id/versions'));

  // ─── BILLING ─────────────────────────────────────────────────────────────
  Future<dynamic> checkout(Map<String, dynamic> data) =>
      _guard(() => _dio.post('/billing/checkout', data: data));

  Future<dynamic> billingPortal() => _guard(() => _dio.post('/billing/portal'));

  // ─── ACTIVITY ────────────────────────────────────────────────────────────
  Future<dynamic> listActivity([Map<String, dynamic>? params]) =>
      _guard(() => _dio.get('/activity/recent', queryParameters: params));

  Future<dynamic> createActivity(Map<String, dynamic> data) =>
      _guard(() => _dio.post('/activity', data: data));

  Future<dynamic> markActivityRead(Map<String, dynamic> data) =>
      _guard(() => _dio.post('/activity/mark-read', data: data));

  // ─── NOTIFICATIONS ───────────────────────────────────────────────────────
  Future<dynamic> listNotifications([Map<String, dynamic>? params]) =>
      _guard(() => _dio.get('/notifications', queryParameters: params));

  Future<dynamic> createNotification(Map<String, dynamic> data) =>
      _guard(() => _dio.post('/notifications', data: data));

  Future<dynamic> markNotificationRead(String id) =>
      _guard(() => _dio.put('/notifications/$id/read'));

  // ─── TEMPLATES ───────────────────────────────────────────────────────────
  Future<dynamic> listTemplates([Map<String, dynamic>? params]) =>
      _guard(() => _dio.get('/templates', queryParameters: params));

  Future<dynamic> getTemplate(String id) =>
      _guard(() => _dio.get('/templates/$id'));

  Future<dynamic> createTemplate(Map<String, dynamic> data) =>
      _guard(() => _dio.post('/templates', data: data));

  Future<dynamic> deleteTemplate(String id) =>
      _guard(() => _dio.delete('/templates/$id'));

  // ─── SEARCH ──────────────────────────────────────────────────────────────
  Future<dynamic> vectorSearch(Map<String, dynamic> data) =>
      _guard(() => _dio.post('/search/vector', data: data));
}

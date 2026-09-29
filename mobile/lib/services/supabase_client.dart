import 'package:supabase_flutter/supabase_flutter.dart';

/// Configurazione e client Supabase (stesso progetto del backend web).
///
/// Le credenziali sono pubbliche (anon key): RLS e le policy lato Supabase
/// proteggono i dati. NON usare mai la `SUPABASE_SERVICE_ROLE_KEY` qui, perché
/// eluderebbe RLS ed esporrebbe l'intero database.
class SupabaseConfig {
  SupabaseConfig._();

  static const String url =
      String.fromEnvironment('SUPABASE_URL', defaultValue: 'https://nlobrgmhxcqelaxxbmtx.supabase.co');

  static const String publishableKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sb2JyZ21oeGNxZWxheHhibXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0Nzk4NTQsImV4cCI6NDEwMjQ0NDgwMH0.A3Ht9VBpMM1pJQSQyex1miOpcJ1uruSCFWZ7DNUUSTc',
  );

  static bool _initialized = false;

  /// Inizializza Supabase prima di `runApp`.
  static Future<void> initialize() async {
    if (_initialized) return;
    await Supabase.initialize(
      url: url,
      publishableKey: publishableKey,
      authOptions: const FlutterAuthClientOptions(
        // Persistenza della sessione gestita da supabase_flutter.
        persistSession: true,
      ),
    );
    _initialized = true;
  }

  static SupabaseClient get client => Supabase.instance.client;
}

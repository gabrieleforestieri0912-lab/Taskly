# Flutter project

Taskly è ora un'app **Flutter** (conversione del precedente progetto React Native/Expo).

Prima di scrivere codice:
- Segui le convenzioni Flutter standard (le schermate vivono in `lib/screens/`, i provider in `lib/providers/`, i servizi in `lib/services/`).
- Usa i provider `ThemeProvider`, `LanguageProvider` e `AuthProvider` esistenti per tema, traduzioni e autenticazione: non reintrodurre pattern React.
- Il client API (`lib/services/api_client.dart`) usa `dio`; le traduzioni sono in `lib/i18n/translations.dart`.

Comandi utili:

```
flutter run
flutter analyze
flutter test
```

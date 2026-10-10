# Zerknij

Prosty timer 20-20-20 dla oczu: co 20 minut przypomina, żeby przez 20 sekund popatrzeć w dal. Aplikacja tylko na Androida, do własnego użytku (instalacja z pliku APK).

Expo SDK 57, Expo Router, TypeScript.

## Uruchamianie

```bash
npm install
npm run android      # build deweloperski na emulatorze lub podłączonym telefonie
npm run build:apk    # APK release (arm64) w android/app/build/outputs/apk/release/
```

## Struktura

- `src/app/` – ekrany (Expo Router)
- `design/` – design system, tokeny, ikony i screeny z projektu (źródło, nie trafia do aplikacji)

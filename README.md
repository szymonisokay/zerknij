# Zerknij

Prosty timer 20-20-20 dla oczu: co 20 minut przypomina, żeby przez 20 sekund popatrzeć w dal. Aplikacja tylko na Androida, do własnego użytku (instalacja z pliku APK).

Expo SDK 57, Expo Router, TypeScript, lokalny moduł natywny w Kotlinie.

## Uruchamianie

```bash
npm install
npm run android      # build deweloperski na emulatorze lub podłączonym telefonie
npm run build:apk    # APK release (arm64) w android/app/build/outputs/apk/release/
```

Po zmianach w `app.json` albo w module natywnym: `npx expo prebuild -p android --clean` (`build:apk` robi to sam).

## Struktura

- `src/app/` – ekrany (Expo Router)
- `src/state/` – ustawienia (kv-store) i stan sesji (kopia stanu z modułu natywnego)
- `modules/zerknij-timer/` – moduł natywny: sesja, usługa pierwszoplanowa, alarmy, powiadomienia, dźwięki
- `design/` – design system, tokeny, ikony i screeny z projektu (źródło, nie trafia do aplikacji)
- `scripts/make-icons.swift` – generuje ikony aplikacji (`swift scripts/make-icons.swift`)

## Jak działa timer w tle

Sesją zarządza moduł natywny, nie JS – dzięki temu liczy także przy zgaszonym ekranie i zamkniętej aplikacji:

- stan sesji jest w SharedPreferences, fazy wynikają ze znaczników czasu,
- koniec każdej fazy budzi telefon dokładnym alarmem (`setAlarmClock`, stąd ikona budzika na pasku),
- na czas sesji działa usługa pierwszoplanowa ze stałym powiadomieniem (odliczanie, Pauza / Przerwa teraz / Stop),
- początek przerwy: dźwięk, wibracja i wyskakujące powiadomienie, a przy zablokowanym telefonie ekran przerwy na pełnym ekranie.

Na Samsungu warto zostawić aplikacji baterię „Bez ograniczeń” – przy pierwszym starcie aplikacja sama o to zapyta.

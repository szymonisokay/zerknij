# Zerknij – design system

Aplikacja ma wyłącznie ciemny motyw. Kolorami rozróżnia dwie fazy:

- **zieleń (mint)** oznacza pracę i odliczanie,
- **bursztyn** oznacza przerwę.

Kolor nigdy nie jest jedyną informacją o fazie. Zawsze towarzyszy mu tekst („Praca” / „Przerwa”) i inna jasność tła.

Wszystkie wartości są w dp/px przy szerokości ekranu 390. Tokeny do kodu są w pliku `theme.ts`.

---

## 1. Kolory

### Neutralne (tło, powierzchnie, tekst)

| Token | Hex | Użycie |
|---|---|---|
| `bg` | `#0E1311` | Tło ekranów pracy, startu i ustawień |
| `bgDeep` | `#0A0D0C` | Tło ekranu blokady / powiadomień |
| `scrim` | `#060807` | Przyciemnienie pod panelem dolnym (bottom sheet) |
| `surface` | `#171E1B` | Karty, grupy ustawień, panel dolny |
| `surfaceRaised` | `#1F2824` | Przyciski drugorzędne, opcje w panelu, przyciski −/+ |
| `surfacePressed` | `#24302B` | Wiersz listy wciśnięty, przyciski w powiadomieniu |
| `surfaceRaisedPressed` | `#33413B` | Przycisk drugorzędny wciśnięty |
| `surfaceDisabled` | `#131915` | Wiersz listy nieaktywny |
| `border` | `#2A3530` | Separatory, obrys chipów, tor przełącznika (wył.) |
| `borderStrong` | `#3A4540` | Obrys przycisków konturowych, uchwyt panelu |
| `text` | `#E8EFEA` | Tekst główny |
| `textSecondary` | `#C9D4CE` | Tekst pomocniczy na kartach |
| `textMuted` | `#9AABA2` | Podpisy, etykiety, ikony nieaktywne |
| `textDisabled` | `#5C6B64` | Tekst nieaktywny |
| `iconDisabled` | `#46524C` | Ikony nieaktywne |

### Akcent pracy (mint)

| Token | Hex | Użycie |
|---|---|---|
| `work` | `#7DD3A8` | Przycisk Start, pierścień postępu, aktywne przełączniki, wybrany chip |
| `workPressed` | `#62BD90` | Przycisk główny wciśnięty |
| `workLight` | `#A8E6C6` | Linki wciśnięte |
| `workSoft` | `#16241D` | Tło plakietki „Praca” |
| `workHalo` | `rgba(125,211,168,0.18)` | Poświata wokół wciśniętego przycisku okrągłego / przełącznika |
| `onWork` | `#0B1A12` | Tekst i ikony na tle `work` |

### Akcent przerwy (bursztyn)

| Token | Hex | Użycie |
|---|---|---|
| `breakBg` | `#17120B` | Tło ekranu przerwy |
| `breakSurface` | `#2A1F12` | Przyciski i plakietka na ekranie przerwy, tor pierścienia, karta powiadomienia |
| `breakSurfacePressed` | `#3D2D19` | Przycisk przerwy wciśnięty |
| `breakBorder` | `#3A2C1A` | Obrys przycisku „Zakończ” |
| `break` | `#F4B860` | Pierścień przerwy, kropka fazy, ikona |
| `onBreak` | `#2A1F12` | Tekst na tle `break` |
| `breakText` | `#F5EDE2` | Tekst główny na ekranie przerwy |
| `breakTextSecondary` | `#CDBFAC` | Opis pod nagłówkiem |
| `breakTextMuted` | `#B8A891` | Podpisy |
| `breakDisabledBg` / `breakDisabledText` | `#1F180F` / `#5E5141` | Stan nieaktywny |

**Kontrast:** tekst `text` na `bg` ma ~15:1, a `textMuted` na `bg` ~7:1. Tekst `onWork` na `work` ma ~10:1. Wszystkie pary spełniają WCAG AA.

---

## 2. Typografia

Aplikacja używa dwóch krojów z Google Fonts. Oba działają offline, bo są wkompilowane w aplikację.

- **Space Grotesk** (500, 700) służy do liczb na timerze, nagłówków i głównego przycisku.
- **DM Sans** (400, 500, 600, 700) służy do tekstu, etykiet i przycisków.

| Token | Krój / waga | Rozmiar / interlinia | Odstęp liter | Użycie |
|---|---|---|---|---|
| `clock` | Space Grotesk 500 | 76 / 76 | −2 | Zegar na ekranie blokady |
| `timerXL` | Space Grotesk 500 | 72 / 72 | −2 | Odliczanie pracy |
| `timerL` | Space Grotesk 500 | 64 / 64 | −2 | Odliczanie przerwy |
| `valueL` | Space Grotesk 500 | 40 / 44 | −1 | Czas w kartach konfiguracji |
| `display` | Space Grotesk 700 | 36 / 42 | −0.6 | „Spójrz w dal” |
| `valueM` | Space Grotesk 500 | 32 / 36 | 0 | Liczba w stepperze cykli |
| `h1` | Space Grotesk 700 | 30 / 35 | −0.5 | Nagłówek ekranu startowego |
| `h2` | Space Grotesk 700 | 24 / 30 | 0 | Tytuł panelu dolnego |
| `h3` | Space Grotesk 700 | 22 / 28 | −0.3 | Pasek aplikacji (logo, „Ustawienia”) |
| `stat` | Space Grotesk 500 | 20 / 26 | 0 | Statystyki sesji |
| `buttonL` | Space Grotesk 700 | 18 / 22 | 0 | Przycisk Start |
| `title` | DM Sans 600 | 17 / 22 | 0 | Tytuł powiadomienia |
| `bodyL` | DM Sans 400 | 16 / 24 | 0 | Opis na ekranie przerwy |
| `button` | DM Sans 600 | 16 / 20 | 0 | Przyciski 56 dp |
| `body` | DM Sans 400 | 15 / 22 | 0 | Tekst, wiersze listy |
| `label` | DM Sans 600 | 14 / 18 | 0 | Chipy, plakietki, małe przyciski |
| `bodyS` | DM Sans 400 | 14 / 21 | 0 | Opisy w panelu |
| `caption` | DM Sans 400 | 13 / 18 | 0 | Podpisy pod wierszami, nagłówki sekcji (600) |
| `micro` | DM Sans 400 | 12 / 16 | 0 | Etykiety pod przyciskami, statystyki |

---

## 3. Odstępy

Odstępy opierają się na siatce 4 dp: `xxs 4 · xs 8 · sm 12 · md 16 · lg 20 · xl 24 · xxl 28 · xxxl 32`.

| Miejsce | Wartość |
|---|---|
| Margines ekranu (poziomo) | 20 |
| Margines ekranu góra / dół | 24 / 28 |
| Odstęp między sekcjami | 20–24 |
| Odstęp w grupie (karty, przyciski) | 8–12 |
| Wnętrze karty | 16 × 20 |

---

## 4. Promienie zaokrągleń

| Token | Wartość | Użycie |
|---|---|---|
| `sm` | 10 | Pole godziny (17:00) |
| `md` | 14 | Wiersz listy (samodzielny) |
| `lg` | 18 | Opcje w panelu |
| `xl` | 20 | Karty, grupy ustawień |
| `xxl` | 24 | Karta powiadomienia |
| `sheet` | 28 | Górne rogi panelu dolnego |
| `full` | 999 | Przyciski, chipy, plakietki, przełącznik |

---

## 5. Rozmiary elementów

| Element | Rozmiar |
|---|---|
| Minimalny obszar dotyku | 44 × 44 |
| Przycisk ikonowy (pasek aplikacji, −/+) | 48 × 48 |
| Przycisk główny (Start) | pełna szerokość × 64 |
| Przycisk standardowy (Zapisz, Pomiń) | × 56 |
| Pauza (okrągły główny) | 88 × 88, ikona 30 |
| Stop / Przerwa teraz (okrągły drugorzędny) | 64 × 64, ikona 22–24 |
| Chip | wys. 40 (mały 36), padding 16 |
| Plakietka fazy | wys. 36, kropka 8 |
| Wiersz ustawień | min. 56–60 |
| Przełącznik | 48 × 28, kciuk 22 |
| Radio | 24, kropka 12 |
| Pierścień pracy | Ø 300, grubość 14, promień 130 |
| Pierścień przerwy | Ø 260, grubość 12, promień 114 |
| Pasek postępu (powiadomienie) | wys. 6 |
| Ikony | 20–24, obrys 1.8–2, zaokrąglone końce |

---

## 6. Komponenty i stany

Telefon nie ma stanu „hover”. Jego rolę pełni **wciśnięcie**:

- tło o jeden stopień ciemniejsze lub jaśniejsze,
- skala 0.96,
- fala (ripple) przez 300 ms,
- krótka wibracja przy Start, Pauza i Stop.

| Komponent | Domyślny | Wciśnięty | Fokus | Nieaktywny |
|---|---|---|---|---|
| Główny | `work` / `onWork` | `workPressed` + skala 0.96 | obrys 3 `text`, odstęp 3 | `border` / `textDisabled` |
| Okrągły główny | `work` | `workPressed` + halo 8 `workHalo` | obrys 3 `text` | `border` / `textDisabled` |
| Okrągły drugorzędny | `surfaceRaised` | `surfaceRaisedPressed` | obrys 3 `work` | `#161C19` / `iconDisabled` |
| Chip | obrys `border` | tło `surfaceRaised`, obrys `#3F4D47` | obrys 3 `work` | wybrany: `work` / `onWork` |
| Przycisk przerwy | `breakSurface` | `breakSurfacePressed` | obrys 3 `break` | `breakDisabledBg` |
| Wiersz listy | `surface` | `surfacePressed` | obrys wewnętrzny 3 `work` | `surfaceDisabled` |
| Przełącznik | wł.: `work`, kciuk `onWork`; wył.: `border`, kciuk `textMuted` | kciuk 26 + halo | obrys 3 `text` | `surfaceRaised` |

---

## 7. Ruch

| Zdarzenie | Czas |
|---|---|
| Ripple | 300 ms |
| Przełącznik | 150 ms |
| Przejście praca → przerwa | 300 ms, płynna zmiana koloru tła |
| Pierścień | aktualizacja co 1 s, liniowo |

---

## 8. Ekrany

| # | Ekran | Plik eksportu |
|---|---|---|
| 1 | Start / konfiguracja | `01-start.png` |
| 2 | Praca (odliczanie) | `02-praca.png` |
| 3 | Przerwa | `03-przerwa.png` |
| 4 | Ustawienia | `04-ustawienia.png` |
| 4a | Limit cykli (panel dolny) | `04a-limit-cykli.png` |
| 5 | Powiadomienie w tle | `05-powiadomienie.png` |
| – | Stany przycisków | `06-stany-przyciskow.png` |

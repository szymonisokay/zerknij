/// <reference types="node" />
import { execSync } from 'node:child_process';
import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Numer builda = liczba commitów w repo. Każdy APK z nowszego kodu ma wyższy numer,
 * a w ustawieniach widać, która wersja jest zainstalowana („wersja 1.0.14”).
 */
function buildNumber() {
  try {
    const count = execSync('git rev-list --count HEAD', { stdio: ['ignore', 'pipe', 'ignore'] });
    return Number(count.toString().trim()) || 1;
  } catch {
    return 1;
  }
}

// Reszta konfiguracji jest w app.json.
export default ({ config }: ConfigContext): ExpoConfig => {
  const build = buildNumber();
  return {
    ...config,
    name: config.name ?? 'Zerknij',
    slug: config.slug ?? 'zerknij',
    version: `1.0.${build}`,
    android: { ...config.android, versionCode: build },
  };
};

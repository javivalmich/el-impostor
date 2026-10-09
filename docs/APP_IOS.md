# App iOS (Capacitor)

Bundle ID `es.puntostudio.puntofalso`, nombre «Punto Falso», solo iPhone (`TARGETED_DEVICE_FAMILY = 1`), solo vertical, iOS 15.0+, Team `R7TF673FZ7`, Capacitor 8.5.3 con UIScene.
La web **no cambia de sitio**: GitHub Pages sigue sirviendo la raíz. `npm run web` copia lo necesario a `www/` (ignorado por git; sin `beta/`, `tienda/`, `docs/`, `tests/`, `sw.js`…).

```
npm install
npm run cap:sync     # copia la web a www/ y sincroniza ios/
npm run cap:abrir    # lo anterior + abre Xcode
```
Hace falta un Mac con Xcode y CocoaPods (`cd ios/App && pod install`). La capability *Sign in with Apple* ya está en `App.entitlements`.

## Sign in with Apple
App nativa: `@capacitor-community/apple-sign-in` → `signInWithIdToken` (nonce: hash a Apple, original a Supabase) → el `authorizationCode` se manda a la Edge Function
`apple-canjear-codigo` (repo de Punto Ciego) con `clientId: es.puntostudio.puntofalso`; la función lo valida contra su lista permitida y lo guarda en `apple_tokens.client_id`.
En Supabase → Providers → Apple, el Bundle ID de Falso debe estar en *Client IDs*. Google no se ofrece en la app.

## Enlaces y área segura
- Privacidad, Términos, Soporte y Punto Ciego llevan `data-ext="<URL absoluta de puntostudio.es>"`: en la app se abren con `@capacitor/browser`; en la web, el enlace normal.
- Enlaces para compartir sala/partida y redirecciones de OAuth llevan `https://puntostudio.es/punto-falso/` en la app.
- `body::before` es una cabecera opaca de `env(safe-area-inset-top)` sobre la barra de estado; abajo, `padding-bottom: env(safe-area-inset-bottom)`.
- `NSMicrophoneUsageDescription` (walkie) en `ios/App/App/Info.plist`. `ITSAppUsesNonExemptEncryption = NO` (solo TLS estándar), `UIRequiredDeviceCapabilities = arm64` y `CFBundleDevelopmentRegion = es`.
- `ios/App/App/PrivacyInfo.xcprivacy` (sin seguimiento ni datos recogidos; `UserDefaults` con razón `CA92.1`, que usa el plugin de Apple). `@capacitor/haptics` no usa APIs de «razón requerida» y no necesita más.

## Vibración y Ajustes
- `@capacitor/haptics` 8.0.2 (versión exacta): `vibra()` convierte el patrón de `navigator.vibrate` en golpes `impact` (LIGHT < 60 ms, MEDIUM < 140 ms, HEAVY el resto) con sus pausas, usando `window.Capacitor.Plugins.Haptics` (nunca `registerPlugin`). En la web sigue `navigator.vibrate`.
- Ajustes (⚙ en la portada) y el menú ☰ comparten `SETTINGS` (`impostor-sound`, `impostor-vibra`, `impostor-theme` en localStorage). La versión que enseña Ajustes es `APP_VERSION` en `index.html`: ponla igual que `MARKETING_VERSION` al subir versión.
- `EN_LOCAL` no vale dentro de la app (`!EN_APP`): `?sblib` y `?grace` no actúan en el WebView (`capacitor://localhost`).
- Antes de archivar: `npm install && npm run cap:sync` y, en `ios/App`, `pod install` (el Podfile ya incluye `CapacitorHaptics`).

## Sonido y silencio
- `AudioSesion.swift`: sesión de audio nativa. Al arrancar (`AppDelegate`) queda en `AVAudioSession.Category.ambient`: los sonidos del juego se silencian solos con el iPhone en modo silencio (no se detecta el interruptor). La vibración no depende de esto.
- Plugin local `AudioSesion` (registrado en `PuntoViewController`, que usa `SceneDelegate` en vez de `CAPBridgeViewController`). La web lo llama con `audioModo('walkie' | 'ambient')`: `WK.abrir()` → `playAndRecord` (`defaultToSpeaker`, `allowBluetooth`, `mixWithOthers`) y `WK.cerrar()` → `ambient`. Se reaplica tras interrupciones y reinicios del audio del sistema.
- Cada cambio escribe en la consola de Xcode `AUDIO sesión … ok (categoría real: …)`.
- Además de la categoría nativa (respaldo), `audioModo()` fija `navigator.audioSession.type` (iOS 16.4+): `ambient` al iniciar y al cerrar el walkie, `play-and-record` solo con el walkie abierto. Registro temporal en consola: `AUDIO tipo=…`. Los efectos son `<audio>` (WAV generados con OfflineAudioContext); el walkie usa Web Audio en directo.

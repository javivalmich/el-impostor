# App iOS (Capacitor)

Bundle ID `es.puntostudio.puntofalso`, nombre «Punto Falso», solo vertical, iOS 15.0+, Team `R7TF673FZ7`, Capacitor 8.5.3 con UIScene.
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
- `NSMicrophoneUsageDescription` (walkie) en `ios/App/App/Info.plist`.

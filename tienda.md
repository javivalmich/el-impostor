# Punto Falso: material para las fichas

## Datos básicos

| Campo | Texto | Límite |
|---|---|---|
| Nombre | **Punto Falso** | 30 (ambas) |
| Subtítulo (App Store) | **El juego social del impostor** (28) | 30 |
| Descripción breve (Google Play) | **Todos tienen la misma palabra menos uno. ¿Quién es el impostor?** (66) | 80 |
| Texto promocional (App Store, opcional) | Con un móvil o con cada uno el suyo, en persona o a distancia. Gratis y sin anuncios. | 170 |
| Palabras clave (App Store) | impostor,fiesta,amigos,palabra,votar,adivinar,grupo,party,social,mentiras | 100 |
| Categoría | Juegos › Palabras / Fiesta (Google: Juegos › Palabras; Apple: Juegos › Palabras o Familia) | |
| Idioma principal | Español (España) | |
| URL de privacidad | https://javivalmich.github.io/el-impostor/privacidad.html | |
| URL de soporte | https://javivalmich.github.io/el-impostor/soporte.html | |
| Correo de contacto | javivalmich@gmail.com | |
| Borrado de cuenta (Google exige URL) | https://javivalmich.github.io/el-impostor/soporte.html#borrar-cuenta | |

## Descripción larga (máx. 4000)

Todos tenéis la misma palabra secreta... menos uno. El impostor no sabe cuál es y tendrá que disimular. ¿Sabréis descubrirlo antes de que sea tarde?

Punto Falso es el juego social del impostor para jugar con amigos y familia, en el sofá, en una cena o a distancia. Cada jugador ve su palabra en su propio móvil, o podéis pasaros un solo móvil de mano en mano.

CÓMO SE JUEGA
• Una persona crea la sala y comparte el código, el QR o el enlace.
• Cada uno mantiene pulsada su tarjeta para ver su palabra. Si la pantalla se pone roja, eres el impostor.
• Por turnos, decid una palabra relacionada sin ser demasiado obvios. El impostor intenta pasar desapercibido.
• Cuando queráis, se abre la votación: cada uno vota en su móvil y se descubre al más votado.
• Si cazáis al impostor, ganan los inocentes. Si los impostores igualan en número, ganan ellos.

LO MEJOR
• Muchas palabras en categorías que eliges tú.
• Tres niveles de pista para el impostor: sin pista, solo la categoría o una pista vaga.
• De 3 jugadores en adelante, con uno o varios impostores.
• Walkie-talkie integrado para jugar a distancia: habla en directo o escribe mensajes. Tu voz no se graba ni se guarda.
• Modo «un solo móvil»: sin conexión, el móvil se va pasando entre los jugadores.
• Ranking de la sesión, efectos de sonido y vibración (se pueden apagar).
• Crea tu personaje (opcional) y juega con tu nombre y tu aspecto.
• Gratis, sin anuncios y sin compras. Para jugar no hace falta cuenta.

TU PRIVACIDAD
Sin cuenta no guardamos nada. Con cuenta, solo tu correo, tu nombre y tu personaje, y puedes borrarla desde la app cuando quieras.

Reúne a tu grupo y descubre quién miente mejor.

## Permisos y para qué se usan

| Permiso | Para qué | Cuándo se pide |
|---|---|---|
| Micrófono (`RECORD_AUDIO` / `NSMicrophoneUsageDescription`) | Hablar por el walkie-talkie con el resto de la sala | Solo al pulsar el botón de hablar por primera vez; se abre solo mientras hablas. La voz no se graba ni se guarda. Hay una nota explicativa en el panel antes de pedirlo |
| Internet (`INTERNET`) | Salas en línea (Supabase Realtime) y cuentas | Siempre; el modo «un solo móvil» no usa red durante la partida |
| Vibración (`VIBRATE`) | Avisos de la partida (se abre la votación, eres impostor...) | Sin diálogo de permiso; se puede apagar en ☰ → Vibración |

No usa: ubicación, cámara, contactos, fotos, notificaciones push, publicidad ni analítica.

Texto sugerido para iOS (`NSMicrophoneUsageDescription`): «Punto Falso usa el micrófono solo mientras mantienes pulsado el botón de hablar del walkie-talkie. Tu voz se envía en directo al grupo y no se graba ni se guarda.»

## Cuestionarios de las tiendas (respuestas previstas)

- **Google Play, Seguridad de los datos**: recopila correo y nombre/ID de usuario (solo con cuenta), y «Audio: voz o sonido» solo en tránsito, no almacenado ni compartido; no se venden ni se comparten con terceros para publicidad; cifrado en tránsito; el usuario puede pedir el borrado (en la app y por URL).
- **Apple, Privacidad de la app**: «Datos de contacto: correo» e «Identificadores/Contenido del usuario: nombre y personaje», vinculados al usuario, solo para funcionalidad de la app; sin seguimiento (no hay tracking).
- **Moderación (Apple 1.2)**: el chat no está moderado, pero hay **bloquear** (botón en la lista de jugadores y ⚑ en el walkie; local al móvil) y **reportar** (correo a soporte con nombre, código de sala y fecha), y el aviso de que es un chat entre amigos sin moderar.
- **Clasificación por edades**: sin violencia gráfica ni contenido adulto; hay un cuchillo de dibujos animados en el logo (violencia de fantasía leve). Chat de texto y voz entre jugadores sin moderación: marcar «interacción entre usuarios» (en Apple, 12+ recomendado; en Google, PEGI 12 / IARC aprox.).

## Capturas de pantalla (`tienda/capturas/`)

Generadas con Playwright (`npx playwright test tests/tienda.spec.js`), 8 pantallas cada tamaño: portada, crear partida, sala de espera con QR, tu palabra, eres el impostor, debate, votación y resultado.

| Carpeta | Tamaño | Uso |
|---|---|---|
| `google-1080x1920/` | 1080×1920 | Google Play, teléfono (mín. 2, máx. 8) |
| `apple-6.9-1320x2868/` | 1320×2868 | App Store, iPhone 6,9" (obligatorio) |
| `apple-6.5-1284x2778/` | 1284×2778 | App Store, iPhone 6,5" |
| `apple-5.5-1242x2208/` | 1242×2208 | App Store, iPhone 5,5" |

Iconos en `icons/`: `icon-512.png` (Google Play, 512×512) e `icon-1024.png` (App Store, 1024×1024, sin transparencia), más `icon-maskable-*.png` (con margen para recortes redondos). Están **redibujados como vector** (el fuente es `icons/icono.svg` / `icono-maskable.svg`) y se regeneran con `node icons/generar-iconos.js`, sin ampliar el logo de 419 px. `icons/vista-previa-recortes.png` (no se versiona) muestra cómo queda recortado en círculo y en cuadrado redondeado.
La sala de espera usa un código de sala real y temporal.

## Pendiente de que rellenes tú

- [ ] Gráfico de funciones de Google Play (1024×500): no está hecho.
- [ ] Capturas de iPad y tablet de 7"/10" si la app va a ser compatible con ellas (si no, restringe a iPhone/teléfono).
- [ ] Nombre del desarrollador / titular legal y dirección postal (Apple y Google los piden; en la UE, como «trader», la dirección se muestra públicamente).
- [ ] Cuentas de desarrollador: Google Play Console (25 USD, una vez) y Apple Developer Program (99 USD/año).
- [ ] Activar Sign in with Apple en Supabase (ver `docs/APPLE_SIGNIN.md` en Punto Ciego): Apple lo exige si ofreces «Entrar con Google». Después, desplegar la revocación del token al borrar la cuenta (`docs/BORRADO_APPLE.md` en Punto Ciego; la cuenta y el proyecto Supabase son compartidos).
- [ ] Credenciales de revisión para Apple/Google: una cuenta de prueba (correo + contraseña), y decir que jugar no la requiere.
- [ ] Cuestionarios de clasificación por edades y de seguridad de datos (respuestas previstas arriba).
- [ ] Revisar las capturas: usan nombres ficticios (Ana, Luis, Marta, Pablo).

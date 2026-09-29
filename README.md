# Punto Falso

**El juego social del impostor**, para jugar con el móvil, en persona o a distancia. Es una web estática: casi todo va en `index.html` (más un `sw.js` mínimo para que el modo sin conexión funcione sin cobertura). Es hermano de [Punto Ciego](https://javivalmich.github.io/Punto-Ciego/).

Jugar: https://javivalmich.github.io/el-impostor/ (la URL conserva el nombre anterior del proyecto; no se ha movido para no romper enlaces, QR ya compartidos ni el alta en Supabase).

## Cómo se juega

- Quien crea la partida elige impostores, nivel de pista, categorías y si jugáis a distancia, y pone su nombre. Entra en la **sala de espera** con un código de 5 caracteres, un QR y un enlace. Ese móvil es el **anfitrión**.
- Los demás abren el enlace o el QR (o tocan «Unirme» y escriben el código) y ponen su nombre. Se ven en la sala con un punto verde. Cuando están todos, el anfitrión pulsa «Empezar» (mínimo 3). Desde ahí también puede sacar a alguien (X) y cambiar el número de impostores.
- Quien entra con la partida empezada espera: el anfitrión recibe un aviso para aceptarlo y entra al pasar de ronda.
- Cada uno mantiene pulsada su tarjeta para ver su palabra. Si la pantalla se pone roja, es el impostor. Hay tres niveles de pista, elegidos al crear la partida: sin pista, solo el nombre de la categoría (el nivel por defecto) o una pista vaga (una palabra suelta, floja a propósito, que vale para varias palabras de esa categoría, no solo la suya).
- Ronda: **palabra → votación → resultado**. Cuando queráis, cualquiera pulsa «Pasar a votar» y se abre un recuadro con la votación para todos a la vez; cada uno vota en su móvil (no a sí mismo, y se puede cambiar hasta que voten todos). Se ve cuántos han votado, no a quién. El anfitrión puede cancelar una votación abierta por error, y solo él puede cerrarla.
- Al cerrar, se descubre al más votado en todas las pantallas. Si era impostor y no quedan más, ganan los inocentes; si los impostores igualan a los inocentes, ganan ellos. Si empatan, se repite entre los empatados y, si vuelven a empatar, nadie sale. Los eliminados miran y escuchan, pero no votan ni hablan hasta la siguiente ronda. La partida pasa sola a la siguiente ronda tras una cuenta atrás de unos segundos; el anfitrión puede acelerarlo («Ir ya») o terminar la partida y volver todos a la sala de espera.
- Hay un marcador de la sesión (victorias y veces que ha sido impostor cada uno).
- Se puede **salir de la partida en cualquier momento** con el botón (✕) fijo en la esquina. Si sales, desapareces de la sala y del recuento de la votación en curso; si erais menos de 3 tras salir tú, la ronda se corta y el resto vuelve a la sala de espera.
- **Walkie-talkie**: botón fijo abajo, en la sala de espera y en la partida. Mantén para hablar, o toca una vez para grabar y otra para enviar. También mensajes de texto. Quien habla sale con su nombre y su avatar. Si se marcó «Jugamos a distancia», se abre solo al entrar en la sala. Al empezar la partida sigue abierto y conserva los mensajes. Los que esperan a entrar en la siguiente ronda escuchan y leen, pero no hablan hasta que el anfitrión los acepta; los eliminados escuchan hasta la siguiente ronda; a quien se saca o se rechaza se le corta. Dentro de WhatsApp/Instagram el micrófono no funciona: hay que abrir el enlace en Safari o Chrome (el texto sí va).
  Dentro del panel se ve cuántos y quiénes están en la llamada, y hay un botón «Salir de la llamada» que corta el micrófono y deja de recibir voz y mensajes sin salir de la partida; «Entrar en la llamada» lo reconecta. Cerrar el panel (✕) no es salir de la llamada: son cosas distintas. Al salir de la partida o terminarla, la llamada se corta sola.
- **Sonido y vibración**: pistas cortas para el ritmo de la ronda (empieza, se abre y se cierra la votación, alguien vota, revelación y victoria/derrota) y avisos por vibración (se abre la votación, te expulsan, eres el impostor al destapar la tarjeta, empieza ronda nueva, quedan 3 s para pasar solos). Nunca hay sonido mientras miras tu tarjeta, para no delatar al impostor. Los efectos bajan de volumen si alguien está hablando por el walkie. Dos interruptores en el menú (☰ → Sonido / Vibración) los apagan, guardados en ese móvil.

## Cuentas (opcional)

Jugar nunca requiere cuenta. Con «Entrar con mi cuenta de Punto Ciego» (con correo, con Google o, cuando esté activado, con Apple) se usa tu nombre y tu personaje (mismo proyecto de Supabase y misma sesión que [Punto Ciego](https://javivalmich.github.io/Punto-Ciego/)). El personaje viaja por presencia y lo ven los demás. Sin sesión se juega con la mascota.

Con sesión iniciada, «Mi cuenta» (en la portada o en el menú ☰ de la partida) abre:
- **Editar personaje y nombre**: mismo editor de capucha, sudadera, estampado, guantes y ojos, y mismo nombre de jugador, guardados en la tabla `profiles` que comparte con Punto Ciego. Si el nombre ya lo usa otra persona, avisa. Si estás en una sala, el cambio se ve al momento en la lista de jugadores, sin salir.
- **Eliminar cuenta**: reutiliza la función `eliminar_mi_cuenta()` de Supabase (la misma de Punto Ciego, aplicada en el proyecto real). Explica que no se puede deshacer y que es la misma cuenta que Punto Ciego: se pierde también allí, con el personaje. Pide la contraseña para confirmar, o escribir BORRAR si entraste con Google o Apple. Si estás en una partida, sales de la sala antes de borrar.

## Cómo funciona por dentro

- Al empezar, el anfitrión fija la lista de jugadores y genera la semilla, y las envía con los ajustes. La palabra y los impostores de cada ronda se calculan en cada móvil a partir de esa lista, esa semilla y el número de ronda; **no viaja por red quién es impostor**.
- Cada móvil tiene un identificador fijo (PID) guardado en el navegador: al recargar vuelve a su sitio con su nombre, y el walkie identifica a quien habla por ese PID (no por el número de jugador). Si el mismo jugador se abre en otra pestaña, la antigua se aparta.
- Lo compartido (fase, ronda, eliminados, quién ha votado, resultado) lo decide el anfitrión y se difunde por **Supabase Realtime** (un canal por sala, `impostor-<CÓDIGO>`, con broadcast y presence, con la clave publicable, sin cuenta; no usa tablas). Los demás solo envían acciones (su voto).
- Si el anfitrión se desconecta más de 30 s (también en la sala de espera), pasa a serlo el siguiente jugador conectado según el orden de la lista (en la sala, el que entró antes).
- El código solo sirve para encontrar la sala; antes de darlo por bueno se comprueba por presencia que no hay otra sala con él.
- Si una sala en línea pierde la conexión a mitad de partida, cada móvil sigue con lo que tiene de la misma forma.
- Los votos los ve el anfitrión en su móvil; por el canal pasan como mensajes (no se muestran a nadie). El canal no está cifrado: cualquiera que tenga el código de partida puede unirse. Es un juego entre amigos.

## Un solo móvil (sin conexión)

- Desde la portada, «Jugar con un solo móvil»: quien lo organiza escribe los nombres (de 3 a 18, sin repetir), elige impostores, nivel de pista, categorías y si la votación es en voz alta o secreta. El móvil recuerda los nombres de la última vez.
- El móvil se va pasando: pantalla neutra «Pásale el móvil a…», tarjeta para ver la palabra (o el aviso de impostor) y «Ya lo he visto» antes de pasarlo al siguiente. Nunca queda a la vista la palabra ni el rojo del jugador anterior. Hay un botón discreto para volver a ver la propia palabra en el debate, pidiendo confirmar quién eres. Aquí sí se conserva el debate como pantalla propia y el botón «Siguiente ronda»: al ser un solo móvil no hay nada que sincronizar entre jugadores. El botón (✕) para terminar la partida también está disponible en cualquier pantalla.
- La votación secreta también pasa el móvil de jugador en jugador; la de voz alta es una sola pantalla donde se toca a quien ha salido más votado. Después se aplican las mismas reglas que en línea (empates, marcador, impostores ganan si igualan a los inocentes…), reutilizando el mismo cálculo de palabra/impostores y la misma animación de revelación que la sala en línea.
- No hace ninguna petición de red durante la partida ni usa el walkie. Guarda la partida en el navegador: si el móvil se recarga a mitad, la recupera. Un `sw.js` cachea la página para que abra sin cobertura tras la primera visita con conexión.
- Los enlaces antiguos de la versión anterior (`#j=...`) ya no funcionan: llevan a la portada con un aviso.

## Publicar y actualizar

GitHub Pages sirve `index.html` (y `sw.js`) desde la raíz de `main`. Para actualizar, edita, haz commit y push; Pages se publica solo en uno o dos minutos. El service worker pide siempre la red primero, así que los móviles reciben lo último publicado en cuanto tienen conexión.

Para probarlo en local: `npx http-server . -p 8000` (o `python -m http.server 8000`, pero entonces no hay service worker) y abre `http://localhost:8000`. En local, `?grace=5` acorta a 5 s la espera para relevar al anfitrión.

## Pruebas

`npm test` ejecuta las pruebas de Playwright del modo de un solo móvil (`tests/`): partidas completas con voto en voz alta y voto secreto, empates, victorias de cada bando, «volver a ver mi palabra», recuperar la partida al recargar y que no haya peticiones de red durante la partida. `npx playwright test tests/screenshots.spec.js` guarda capturas de esas pantallas en varios tamaños de móvil en `test-results/screenshots/`.

## Avisos

- Los proyectos gratuitos de Supabase se **pausan** si no se usan durante días. Entonces las votaciones y el walkie pasan al modo sin conexión hasta que lo reactives desde el panel de Supabase.
- Para los botones «Entrar con Google»/«Iniciar sesión con Apple», la URL de este juego tiene que estar en *Authentication > URL Configuration > Redirect URLs* del proyecto de Supabase.
- El botón de Apple solo aparece si el proveedor Apple está activado en Supabase (igual que Google). Hasta entonces el código está listo pero oculto; ver los pasos para activarlo más abajo.

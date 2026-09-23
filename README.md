# El impostor

Juego del impostor para jugar con el móvil, en persona o a distancia. Es una web estática: casi todo va en `index.html` (más un `sw.js` mínimo para que el modo sin conexión funcione sin cobertura).

Jugar: https://javivalmich.github.io/el-impostor/

## Cómo se juega

- Quien crea la partida elige impostores, pista, categorías y si jugáis a distancia, y pone su nombre. Entra en la **sala de espera** con un código de 5 caracteres, un QR y un enlace. Ese móvil es el **anfitrión**.
- Los demás abren el enlace o el QR (o tocan «Unirme» y escriben el código) y ponen su nombre. Se ven en la sala con un punto verde. Cuando están todos, el anfitrión pulsa «Empezar» (mínimo 3). Desde ahí también puede sacar a alguien (X) y cambiar el número de impostores.
- Quien entra con la partida empezada espera: el anfitrión recibe un aviso para aceptarlo y entra al pasar de ronda.
- Cada uno mantiene pulsada su tarjeta para ver su palabra. Si la pantalla se pone roja, es el impostor.
- Ronda: **palabra → debate → votación → resultado**. El anfitrión abre el debate y la votación; cada uno vota en su móvil (no a sí mismo, y se puede cambiar hasta que voten todos). Se ve cuántos han votado, no a quién.
- Al cerrar, se descubre al más votado en todas las pantallas. Si era impostor y no quedan más, ganan los inocentes; si los impostores igualan a los inocentes, ganan ellos. Si empatan, se repite entre los empatados y, si vuelven a empatar, nadie sale. Los eliminados miran y escuchan, pero no votan ni hablan hasta la siguiente ronda.
- Hay un marcador de la sesión (victorias y veces que ha sido impostor cada uno).
- **Walkie-talkie**: botón fijo abajo, en la sala de espera y en la partida. Mantén para hablar, o toca una vez para grabar y otra para enviar. También mensajes de texto. Quien habla sale con su nombre y su avatar. Si se marcó «Jugamos a distancia», se abre solo al entrar en la sala. Al empezar la partida sigue abierto y conserva los mensajes. Los que esperan a entrar en la siguiente ronda escuchan y leen, pero no hablan hasta que el anfitrión los acepta; los eliminados escuchan hasta la siguiente ronda; a quien se saca o se rechaza se le corta. Dentro de WhatsApp/Instagram el micrófono no funciona: hay que abrir el enlace en Safari o Chrome (el texto sí va).

## Cuentas (opcional)

Jugar nunca requiere cuenta. Con «Entrar con mi cuenta de Punto Ciego» se usa tu nombre y tu personaje (mismo proyecto de Supabase y misma sesión que [Punto Ciego](https://javivalmich.github.io/Punto-Ciego/)). El personaje viaja por presencia y lo ven los demás. Sin sesión se juega con la mascota.

## Cómo funciona por dentro

- Al empezar, el anfitrión fija la lista de jugadores y genera la semilla, y las envía con los ajustes. La palabra y los impostores de cada ronda se calculan en cada móvil a partir de esa lista, esa semilla y el número de ronda; **no viaja por red quién es impostor**.
- Cada móvil tiene un identificador fijo (PID) guardado en el navegador: al recargar vuelve a su sitio con su nombre, y el walkie identifica a quien habla por ese PID (no por el número de jugador). Si el mismo jugador se abre en otra pestaña, la antigua se aparta.
- Lo compartido (fase, ronda, eliminados, quién ha votado, resultado) lo decide el anfitrión y se difunde por **Supabase Realtime** (un canal por sala, `impostor-<CÓDIGO>`, con broadcast y presence, con la clave publicable, sin cuenta; no usa tablas). Los demás solo envían acciones (su voto).
- Si el anfitrión se desconecta más de 30 s (también en la sala de espera), pasa a serlo el siguiente jugador conectado según el orden de la lista (en la sala, el que entró antes).
- El código solo sirve para encontrar la sala; antes de darlo por bueno se comprueba por presencia que no hay otra sala con él.
- Si una sala en línea pierde la conexión a mitad de partida, cada móvil sigue con lo que tiene de la misma forma.
- Los votos los ve el anfitrión en su móvil; por el canal pasan como mensajes (no se muestran a nadie). El canal no está cifrado: cualquiera que tenga el código de partida puede unirse. Es un juego entre amigos.

## Un solo móvil (sin conexión)

- Desde la portada, «Jugar con un solo móvil»: quien lo organiza escribe los nombres (de 3 a 18, sin repetir), elige impostores, pista, categorías y si la votación es en voz alta o secreta. El móvil recuerda los nombres de la última vez.
- El móvil se va pasando: pantalla neutra «Pásale el móvil a…», tarjeta para ver la palabra (o el aviso de impostor) y «Ya lo he visto» antes de pasarlo al siguiente. Nunca queda a la vista la palabra ni el rojo del jugador anterior. Hay un botón discreto para volver a ver la propia palabra en el debate, pidiendo confirmar quién eres.
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
- Para el botón «Entrar con Google», la URL de este juego tiene que estar en *Authentication > URL Configuration > Redirect URLs* del proyecto de Supabase.

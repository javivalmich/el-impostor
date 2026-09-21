# El impostor

Juego del impostor para jugar con el móvil, en persona o a distancia. Es una web estática: todo va en `index.html`.

Jugar: https://javivalmich.github.io/el-impostor/

## Cómo se juega

- Quien crea la partida escribe los nombres, elige cuántos impostores hay, si hay pista, las categorías y si jugáis a distancia. Ese móvil es el **anfitrión**.
- Los demás entran con el QR o el enlace y tocan su nombre (un punto verde indica quién ya está conectado).
- Cada uno mantiene pulsada su tarjeta para ver su palabra. Si la pantalla se pone roja, es el impostor.
- Ronda: **palabra → debate → votación → resultado**. El anfitrión abre el debate y la votación; cada uno vota en su móvil (no a sí mismo, y se puede cambiar hasta que voten todos). Se ve cuántos han votado, no a quién.
- Al cerrar, se descubre al más votado en todas las pantallas. Si era impostor y no quedan más, ganan los inocentes; si los impostores igualan a los inocentes, ganan ellos. Si empatan, se repite entre los empatados y, si vuelven a empatar, nadie sale. Los eliminados miran y escuchan, pero no votan ni hablan hasta la siguiente ronda.
- Hay un marcador de la sesión (victorias y veces que ha sido impostor cada uno).
- **Walkie-talkie**: botón fijo abajo. Mantén para hablar, o toca una vez para grabar y otra para enviar. También mensajes de texto. Dentro de WhatsApp/Instagram el micrófono no funciona: hay que abrir el enlace en Safari o Chrome (el texto sí va).

## Cuentas (opcional)

Jugar nunca requiere cuenta. Con «Entrar con mi cuenta de Punto Ciego» se usa tu nombre y tu personaje (mismo proyecto de Supabase y misma sesión que [Punto Ciego](https://javivalmich.github.io/Punto-Ciego/)). El personaje viaja por presencia y lo ven los demás. Sin sesión se juega con la mascota.

## Cómo funciona por dentro

- La palabra y los impostores de cada ronda se calculan en cada móvil a partir del código de partida y el número de ronda; **no viaja por red quién es impostor**.
- Lo compartido (fase, ronda, eliminados, quién ha votado, resultado) lo decide el anfitrión y se difunde por **Supabase Realtime** (un canal por partida, `impostor-<CÓDIGO>`, con broadcast y presence, con la clave publicable, sin cuenta). Los demás solo envían acciones (su voto).
- Si el anfitrión se desconecta más de 30 s, pasa a serlo el siguiente jugador conectado según el orden de la lista.
- Sin conexión o si Realtime falla, funciona como antes: cada móvil lleva su ronda, se vota en voz alta y se usa «Ver solución».
- Los votos los ve el anfitrión en su móvil; por el canal pasan como mensajes (no se muestran a nadie). El canal no está cifrado: cualquiera que tenga el código de partida puede unirse. Es un juego entre amigos.

## Publicar y actualizar

GitHub Pages sirve `index.html` desde la raíz de `main`. Para actualizar, edita `index.html`, haz commit y push; Pages se publica solo en uno o dos minutos.

Para probarlo en local: `python -m http.server 8000` y abre `http://localhost:8000`. En local, `?grace=5` acorta a 5 s la espera para relevar al anfitrión.

## Avisos

- Los proyectos gratuitos de Supabase se **pausan** si no se usan durante días. Entonces las votaciones y el walkie pasan al modo sin conexión hasta que lo reactives desde el panel de Supabase.
- Para el botón «Entrar con Google», la URL de este juego tiene que estar en *Authentication > URL Configuration > Redirect URLs* del proyecto de Supabase.

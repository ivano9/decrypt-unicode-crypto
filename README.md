El razonamiento para resolver este crypto básicamente fue seguir esta [documentación](http://bribes.org/crypto/substitution_mono.html) la cual está explicada en frances.
Yo hice mi versión de la solución en lenguaje JavaScript, cabe aclarar que el poder de calculo que se necesita no es apropiada para la plataforma de NodeJS, se debería aplicar el modulo Worker Threads para un procesamiento mas eficiente.

Los pasos que se toman para decodificar este tipo de cryptos generalmente son los siguientes:

1. En el caso de tipos de cryptos unicode `U+0370` – `U+03FF` que contienen los símbolos griegos, eliminar todos los espacios, puntos y comas. En el caso de que sea un crypto con código unicode `UTF-8`,  eliminar todos los espacios, puntos, comas, acentos y pasar todas las letras a mayúsculas.
2. Calcular los diferentes símbolos o caracteres que se encuentran en el crypto.
3. Reemplazar cada símbolo del crypto por una letra del alfabeto.
4. La función `RS_sub(string crypto, int max_iter, float coolratio)` que utiliza el algoritmo de recocido simulado. Es un algoritmo de búsqueda meta-heurístico, que en general lo que hace es encontrar una buena aproximación al valor óptimo de una función en un espacio de búsqueda grande. Este algoritmo utiliza un archivo que contiene una lista de cuadrigramas, los cuadrigramas son conjuntos de letras agrupadas de a 4 y con un numero asociado que indica su frecuencia de uso ordenados de mayor a menor. Están basados en estadísticas de textos de libros del proyecto Gutemberg. El archivo por defecto son los que contienen los cuadrigrama en ingles.
Aplicar la función con el crypto alfabetizado y setear el `max_iter= 30000`, para que de una aproximación mas certera, el `CoolRatio` (coeficiente de enfriamiento) dejarlo por defecto.
Cuando terminó de hacer el recocido simulado devolverá un score, el alfabeto decifrante y el texto casi descifrado.
Observe que el texto contendrá palabras con un poco de sentido del alfabeto pero el problema es que el algoritmo sustituirá el espacio por una letra del alfabeto. Entonces una hipótesis para solventar esto es tomar el alfabeto decifrante que retornó con el mejor score y verificar que letra le corresponde al alfabeto normal, por ejemplo: 

	si en el texto aparece una letra como la `S` en ves de un espacio, tomamos los alfabetos:

	`ENSLATRFIOWBYVPMUKHGDCZQJX` (alfabeto decifrante)

	`ABCDEFGHIJKLMNOPQRSTUVWXYZ` (alabeto normal)

	y vemos que letra le corresponde al alfabeto normal, en este caso le corresponde a la letra `C`. Luego reemplazamos la letra `C` por `_` en el texto que se obtuvo de reemplazar los símbolos por letras del alfabeto que se realizó en el punto anterior (3).

5. Corremos la función `RS_sub()` de nuevo pero esta ves con el `max_iter` por defecto y cambiaremos los cuadrigramas de idioma español con espacios en la función `log_score()`. Una ves que haya  terminado el proceso obtendremos el resultado con los espacios reemplazados con `_`.
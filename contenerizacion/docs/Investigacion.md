# Investigación T1 BD2

> **Título original:** Contenerización de un servicio con Docker
> **Fuente:** `Investigación T1 BD2.docx`
> **Nota:** conversión a Markdown sin imágenes embebidas ni el material no académico del final del documento.

---

Investigación de la T1 BD2

Contenerización de un servicio con Docker


## Tema 1: Contenerización y Docker

### Mejores prácticas para los Dockerfiles:

Usar compilaciones de varias etapas: Con las compilaciones de varias etapas, usas múltiples FROM en el Dockerfile. Cada uno puede usar una base distinta y cada uno inicia una nueva etapa de la compilación. Podés copiar las varas de una etapa a la otra, dejando atrás lo que no ocupes. Vea el siguiente ejemplo:


Solo necesitas este Dockerfile; no hay necesidad de otro script de compilación; solo corra “docker build”.

El resultado es una pequeña imagen que solo contiene el archivo binario. Ninguna de las herramientas de compilación necesarias para compilar la app está incluida en la imagen resultante.

Cómo funciona? El segundo FROM inicia una nueva etapa de compilación con la imagen base. La línea COPY - -from = 0 copia solo el artefacto compilado de la etapa anterior a esta nueva. El SDK de Go y cualquier otra vara se conservan y no se guardan en la imagen final. Por defecto, las etapas no están nombradas y te refieres a ellas por su número entero (empezando desde 0 en el primer FROM). Se pueden nombrar agregando un “AS <name> en la instrucción FROM

Este modelo reduce el tamaño final de la imagen separando la compilación de la imagen y el output final, por lo que si lo usas, mantendrás solo lo necesario para correr la imagen. También te ayuda a compilar más eficientemente al ejecutar los pasos de compilación en paralelo

Crea etapas reutilizables: Si tienes muchas etapas con un montón de varas en común, mejor crear una etapa reutilizable que incluya todos los componentes compartidos y basarse en ella. Docker solo necesitaría compilar la etapa común una vez, lo que significa, que las imágenes derivadas utilizarán la memoria en el host de Docker de manera más eficiente, rápida y mantenible


Escoge la imagen base correcta: Cuando se escoge una imagen, hay que asegurarse de que sea de una fuente confiable y que sea pequeña.Considera usar 2 tipos de imagen: una para la compilación y la unidad de testeo y otra imagen para producción (buena práctica). Algunas fuentes son:https://hub.docker.com/search?badges=official&_gl=1*1f8mtc4*_gcl_au*MTAwNTQzMDk4NC4xNzg4NDkyNjI2*_ga*Mjc3NDUzNzIzLjE3ODg0OTI2MjY.*_ga_XJWPQMJYHQ*czE3ODg0OTI2MjUkbzEkZzEkdDE3ODg0OTI4MDQkajYwJGwwJGgw


https://hub.docker.com/search?badges=verified_publisher&_gl=1*1f8mtc4*_gcl_au*MTAwNTQzMDk4NC4xNzg4NDkyNjI2*_ga*Mjc3NDUzNzIzLjE3ODg0OTI2MjY.*_ga_XJWPQMJYHQ*czE3ODg0OTI2MjUkbzEkZzEkdDE3ODg0OTI4MDQkajYwJGwwJGgw


https://hub.docker.com/search?badges=open_source&_gl=1*1gitnv5*_gcl_au*MTAwNTQzMDk4NC4xNzg4NDkyNjI2*_ga*Mjc3NDUzNzIzLjE3ODg0OTI2MjY.*_ga_XJWPQMJYHQ*czE3ODg0OTI2MjUkbzEkZzEkdDE3ODg0OTI4MDQkajYwJGwwJGgw


Recompila las imágenes seguido: Las imágenes de Docker son inmutables. Recompilar una imagen es tomar una foto de la imagen en ese momento; eso incluye todo. Para mantener las imágenes al día y seguras, recompílalas regularmente con dependencias actualizadas


Usar el comando - -pull para obtener las imágenes más recientes: Esto es porque a veces manualmente podés instalar una imagen parecida pero diferente, entonces mejor podés usar el comando - -pull de la siguiente manera: docker build --pull -t my-image:my-tag


Usar el comando - -no-cache para compilaciones más limpias: Este comando desactiva la compilación del cache, forzando a Docker a recompilar todas las capas desde cero: docker build --no-cache -t my-image:my-tag


Este comando y el anterior se pueden usar juntos para obtener una imagen reciente y reejecutar todos los pasos de compilación: docker build --pull --no-cache -t my-image:my-tag


Excluir con .dockerignore: Para excluir archivos que no son necesarios para la compilación, podés usar un archivo .dockerignore, funciona parecido a un .gitignore. Más información: https://docs.docker.com/build/concepts/context/#dockerignore-files


### Instrucciones de un Dockerfile

FROM

Imágenes Oficiales: Siempre que sea posible, utiliza imágenes oficiales de Docker Hub en lugar de imágenes de terceros no verificadas.

Etiquetas específicas: Evita usar la etiqueta latest. Es mejor fijar una versión específica (ej. node:20.5.0-alpine) para garantizar que la construcción sea determinista y reproducible en el futuro.

Imágenes mínimas: Se recomienda usar variantes reducidas como Alpine o Slim si tu aplicación no requiere todas las bibliotecas de un sistema operativo completo. Esto reduce drásticamente el tamaño final y la superficie de ataque.

RUN

Concatenación y caché: Dado que cada instrucción RUN crea una nueva capa, es una buena práctica agrupar comandos lógicos usando && y separar las líneas con \.

Instalación de paquetes: Al usar gestores de paquetes como apt, siempre debes combinar el comando update con el install en la misma instrucción RUN (ej. RUN apt-get update && apt-get install -y paquete). Si los separas en distintos RUN, la caché puede guardar un update viejo y fallar al instalar.

Limpieza: Elimina siempre las cachés de los gestores de paquetes dentro de la misma capa (ej. rm -rf /var/lib/apt/lists/*) para no arrastrar basura que infle el tamaño de la imagen.

COPY vs ADD

Preferencia por COPY: En el 99% de los casos, debes usar COPY. Su comportamiento es transparente y solo se limita a copiar archivos de tu contexto local al contenedor.

Cuándo usar ADD: Solo utilízalo cuando necesites sus características especiales, como extraer automáticamente un archivo .tar comprimido directamente en el sistema de archivos del contenedor.

CMD vs ENTRYPOINT

ENTRYPOINT: Define el comando principal o el proceso ejecutable central del contenedor. Suele usarse cuando el contenedor está diseñado para funcionar como un binario de un solo uso.

CMD: Se usa para proporcionar argumentos por defecto al ENTRYPOINT o para definir un comando por defecto si no hay un ENTRYPOINT.

Formato JSON: Ambas instrucciones deben escribirse preferiblemente en formato de arreglo (ej. CMD ["ejecutable", "param1"] o exec form) en lugar del formato shell (CMD comando param1). El formato exec permite que el contenedor reciba las señales del sistema operativo (como un SIGTERM para apagarse correctamente).

WORKDIR

Rutas absolutas: Siempre utiliza WORKDIR /ruta/absoluta en lugar de usar RUN cd /ruta para moverte entre directorios. WORKDIR crea el directorio si no existe y asegura que todas las instrucciones subsecuentes (RUN, CMD, COPY) se ejecuten en esa ruta.

USER

Principio de menor privilegio: Si un servicio puede ejecutarse sin privilegios de administrador, crea un usuario y un grupo dedicados y cambia a él usando USER nombre_usuario. Nunca ejecutes aplicaciones como root si no es estrictamente necesario, para mejorar la seguridad del sistema.

ENV

Se utiliza para definir variables de entorno persistentes que los contenedores utilizarán en tiempo de ejecución (por ejemplo, definir el path ENV PATH=/usr/local/nginx/bin:$PATH).

EXPOSE

Sirve como mecanismo de documentación. Le indica a la persona que va a ejecutar el contenedor en qué puertos están escuchando la aplicación internamente, aunque no publica el puerto automáticamente hacia el host.

VOLUME

Se debe utilizar para exponer cualquier parte de la base de datos, almacenamiento o archivos de configuración creados por el contenedor que necesiten persistencia fuera de su ciclo de vida.


## Tema 2. Docker Compose:

### Cómo funciona Docker Compose?

Compose usa un archivo de configuración YAML para configurar los servicios de la aplicación y luego creas e inicias todos los servicios de la configuración con el “Compose CLI”

El archivo compose sigue las siguientes reglas en cómo definir aplicaciones multicontenedor:

Los componentes informáticos de una aplicación son los “services”. Estos son conceptos abstractos que se implementan en plataformas mediante la ejecución de la misma imagen de contenedor y configuración una o más veces

Los servicios se comunican entre sí a través de “networks”. En este contexto, una red es una abstracción de la capacidad de la plataforma para establecer una ruta IP entre contenedores de servicios conectados entre sí

Los servicios almacenan y comparten datos persistentes en “volumes”. Se describen dichos datos como un montaje de sistema de archivos de alto nivel con opciones globales

Algunos servicios requieren datos de configuración que dependen del tiempo de ejecución o la plataforma. Por esto, se define el concepto “configs”. Dentro del contenedor, se comportan como volúmenes. Sin embargo, a nivel de plataforma son definidos de manera distinta

Un “secret” es un tipo de dato de configuración para los datos sensibles que no deberían ser expuestos sin considerar la seguridad. Los secretos se ponen a disposición de los servicios como archivos montados en sus contenedores, pero los datos de la plataforma para brindar datos sensibles son lo suficientemente específicos como para ser distinguidos por “secrets”

Un “project” es una implementación individual de una especificación de la aplicación en la plataforma. El nombre del proyecto se establece con el atributo “name”. Este nombre es usado para reunir recursos y aislarlos de otras aplicaciones u otras instalaciones de la misma aplicación compose con distintos parámetros. Si se están creando recursos en la plataforma, debe anteponer el nombre del prospecto a los nombres de los recursos y establecer la etiqueta com.docker.compose.project.

Compose ofrece una manera de establecer un nombre de proyecto personalizado y anular este nombre, por lo que, el mismo archivo compose.yml puede ser desplegado 2 veces en la misma infraestructura, sin cambios, solo con pasar un nombre diferente


El path default del archivo compose es compose.yaml o compose.yml, el cual está colocado en el directorio en el que se esté trabajando

Se pueden usar “fragments” y “extensiones” para mantener el archivo compose eficiente y fácil de mantener. -En la bibliografía van a estar los links porque que pereza xD

Múltiples archivos compose pueden unirse para definir el modelo de la aplicación. La combinación de varios archivos YAML se implementa agregando o sobreescribiendo elementos YAML según el orden de los archivos Compose que se haya establecido.


Si se quiere reusar archivos Compose o factorizar partes del modelo de la aplicación en otros archivos Compose, se puede usar “include”, lo cual es bastante útil

### CLI

El CLI de Docker te deja interactuar con las aplicaciones del Docker Compose a través de comandos y subcomandos. En Docker Desktop está incluído por default


Usando CLI, podemos manejar el ciclo de vida de las aplicaciones multicontenedor definidas en el .yml. Algunos de estos comandos son:

Para iniciar todos los servicios del .yml: $ docker compose up

Para detener todos los servicios: $ docker compose down

Si quieres monitorear la salida de los contenedores que están corriendo y debuggear, se pueden ver los logs con: $ docker compose logs

Para listar todos los servicios con su estado actual: $ docker compose ps

Más comandos: https://docs.docker.com/reference/cli/docker/compose/


### Ejemplo Ilustrativo

Considera una aplicación dividida en una aplicación web (frontend) y un servicio (backend)

El frontend está configurado en tiempo de ejecución con un archivo de configuración HTTP manejado por la infraestructura, proveyendo un nombre de dominio y un certificado de servidor HTTPS

El backend almacena datos en un volumen persistente

Ambos servicios se comunican a través de una red de nivel inferior aislada, mientras que el frontend también está conectado a una red de nivel superior y expone el puerto 443 para uso externo


Esta aplicación de ejemplo está compuesta de las siguientes partes:

Dos servicios, respaldados por imágenes de Docker: webapp y database

Un secret (certificado HTTPS), inyectado en el frontend

Una configuración (HTTP), inyectada en el frontend

Un volumen persistente, adjunto al backend

Dos networks


El comando “docker compose up” inicia los servicios de frontend y backend, crea las networks y volúmenes necesarias e inyecta la configuración y el secret en el servicio del frontend


### Networking en Compose

Compose maneja el networking por default, pero cuando se necesita, te deja tener un buen grado de control.


Por default, Compose establece una sola red para la aplicación. Cada contenedor de un servicio se une a la red predeterminada y es accesible para otros contenedores en esa red, además de poder ser detectado por su nombre de servicio. Esta red utiliza el controlador de puente.


Para la mayoría de setups de desarrollo, la red default es suficiente. Cuando se corre el comando “docker compose up”, Compose crea una red llamada <nombre-proyecto>_default y lo adjunta a todos los servicios. Cada servicio registra su nombre con un servidor DNS interno, por lo que, los contenedores podrán alcanzarlo usando el nombre del servicio directamente.


Por ejemplo, la aplicación está en un directorio llamado “myapp”, entonces el .yml se ve así:


Compose automáticamente conecta todos los servicios a la red default

Cuando se corre “docker compose up” pasa lo siguiente:

Una red llamada myapp_default es creada

Un contenedor es creado usando la configuración de la web. Se une a myapp_default bajo el nombre de “web”

Un contenedor es creado usando la configuración de la db. Se une a myapp_default bajo el nombre de “db”

Ahora cada contenedor puede ver el nombre del servicio “web” o “db” y obtener la dirección IP del contenedor


El “HOST_PORT” y el “CONTAINER_PORT” tienen diferentes propósitos. En el ejemplo, para “db”, el HOST_PORT es 8001 y el puerto del contenedor es 5432.


Si se hace un cambio de configuración en un servicio y se corre el comando “docker compose up” para actualizarlo, el contenedor viejo es removido y el nuevo se une a la red bajo una dirección IP distinta, pero usando el mismo nombre. Por lo que los contenedores se podrán buscar el nombre y conectarse a la nueva IP y la anterior dejará de funcionar

Si algún contenedor tenía una conexión abierta con el contenedor viejo, se cierra automáticamente


Por defecto, cada servicio se une a la red puente del proyecto. Es el modo más seguro. Si no se especifica el “network_mode”, este es el tipo de red que estás creando


Se puede sobrescribir el modo de la red para cada servicio individualmente. La opción network_mode acepta los siguientes valores:


host: El contenedor comparte la pila de red del host. No se requiere ni se admite el mapeo de puertos y la resolución DNS del nombre del servicio no funciona. Se usa para herramientas de nivel de sistema, como monitores de red, que requieren acceso directo a las interfaces del host. Un contenedor que utilice network_mode:host puede acceder a todos los puertos del host y observar todo el tráfico de red en él. Solo usarlo en caso de ser necesario

none: Apaga todas las conexiones de red de los contenedores

service:{name}: Le da acceso al contenedor a un contenedor especificado por su nombre de servicio

container:{name}: Le da acceso al contenedor a un contenedor especificado por su ID


Se pueden mezclar modos en un solo proyecto:


En vez de utilizar la red de aplicación default, podemos especificar nuestras propias redes con la llave de alto nivel “networks”. Esto nos deja crear topologías más complejas y especificar drivers de red y opciones personalizadas. También, puede usarse para conectar servicios a redes creadas externamente que no sean manejadas por el Compose


Cada servicio puede especificar a qué red quiere conectarse con la llave a nivel de servicio “networks”, la cual es una lista de nombres referenciando entradas bajo la llave de alto nivel “networks”


El siguiente ejemplo muestra un archivo Compose el cual define 2 redes personalizadas. El servicio “proxy” está aislado del servicio “db” porque no comparten una red en común. Solo “app” puede hablarles a los dos:


Las redes pueden ser configuradas con una dirección IP estática al establecer la dirección ipv4 y/o la dirección ipv6 para cada red adjunta

A las redes también se les puede dar un nombre personalizado:


Más info sobre esto, en el 4to link de las referencias


## Tema 3. Volúmenes

### Qué son los volúmenes?

Son almacenamientos de datos persistentes para contenedores, creados y manejados por Docker. Puedes crearlos usando el comando “docker volume create” o Docker puede crear el volumen durante la creación de un contenedor o servicio


Cuando vos creás el volumen, este se almacena dentro de un directorio en el host de Docker. Cuando montas un volumen dentro de un contenedor, este directorio es el que se monta en el contenedor. Esto es similar al funcionamiento de los “bind mounts” (enlaces montados), con la diferencia de que los volúmenes son gestionados por Docker y están aislados de la funcionalidad principal del host

### Cuándo usarlos?

Son una buena opción para los siguientes casos de uso:

Los volúmenes son más fáciles de restaurar o migrar que los enlaces montados

Puedes manejar volúmenes usando comandos de Docker CLI o la API de Docker

Funcionan para contenedores Linux y Windows

Pueden ser más seguros compartirlos entre múltiples contenedores

Nuevos volúmenes pueden tener su contenido prellenado por algún contenedor o compilación

Cuando la aplicación requiere I/O de alto rendimiento


Los volúmenes son una mala idea si necesitas acceder a los archivos desde el host, ya que son completamente manejados por Docker. Si ocupas acceder a archivos o directorios del contenedor y el host, usa bind mounts


Los volúmenes son usualmente una mejor opción que escribir directamente los datos en el contenedor, debido a que el volumen no aumenta el tamaño del contenedor. Aparte es más rápido, porque para escribirlos a mano el contenedor requiere un driver de almacenamiento para manejar el filesystem, lo que disminuye el rendimiento


Si el contenedor genera datos no persistentes, considere usar un “tmpfs mount” para evitar almacenar datos en algún lugar permanentemente y para mejorar el rendimiento del contenedor


Los volúmenes usan la propagación de enlaces “rprivate” (recursive private), esta no es configurable

### Ciclo de vida de un volumen

Los contenidos del volumen existen más allá de los contenedores. Cuando un contenedor es destruido, sus datos escritos también lo son. Usar un volumen te asegura que los datos persistan incluso si se elimina el contenedor


Un solo volumen puede montarse en varios contenedores simultáneamente. Cuando un volumen no está siendo usado, este todavía está disponible y no es borrado automáticamente, entonces si querés borrarlo, usá el comando “docker volume prune”

### Montar un volumen sobre datos existentes

Si montás un volumen que no está vacío dentro de un directorio en el contenedor el cual tiene varas, los archivos que ya existían quedan ocultos por el montaje


Con contenedores, no hay manera de quitar el montaje para volver a  revelar los archivos ocultos. La mejor opción es recrear el contenedor sin el montaje


En cambio, si se monta un volumen vacío, las varas del directorio se copian en el volumen predeterminadamente. Similarmente, si inicias un contenedor y especificas un volumen que no existe, un volumen vacío se creará para ti. Esta es una buena manera de prellenar datos que otro contenedor necesita


Para prevenir este prellenado dentro de un volumen, usa la opción “volume-nocopy”

### Sintaxis

Para montar un volumen con el comando “docker run”, podés usar tanto la bandera “--mount” o “--volume”


Generalmente, “--mount” es mejor. La principal diferencia es que la bandera –mount es más explícita y soporta todas las opciones disponibles. Debes usarlo si:

Vas a especificar las opciones de los drivers de volúmenes

Montar un subdirectorio del volumen

Montar un volumen en un servicio Swarm


Para más info acerca de las banderas –mount y –volume, revise el 5to enlace de las referencias en los apartados “Options for –mount” y “Options for –volume”

### Crear y manejar volúmenes

A diferencia de un bind mount, podemos crear y manejar volúmenes fuera del alcance de cualquier contenedor


Crear un volumen:


Listar volúmenes:


Inspeccionar volúmenes:


Quitar volúmenes:


### Usar un volumen con Docker Compose

El siguiente ejemplo muestra un servicio de Docker Compose con un volumen:


Correr “docker compose up” por primera vez crea el volumen. Docker reusa el mismo volumen cuando corres el comando varias veces


Podés crear un volumen fuera de Compose usando “docker volume create” y luego referenciándolo dentro del archivo compose.yml:


Para más información sobre usar volúmenes con Compose: https://docs.docker.com/reference/compose-file/volumes/


Y para más información y más detallada sobre volúmenes en general, acceder al 5to link de las referencias


## Tema 4. Gestión de arranque y Healthchecks

Podés controlar el orden del inicio y del apagado del servicio con el atributo “depends_on”. Compose siempre inicia y detiene contenedores en orden de dependencia, donde las dependencias están determinadas por “depends_on”, “links”, “volumes_from” y “network_mode:service:...”


Por ejemplo, si la aplicación necesita acceder a la db y los dos servicios se inician con “docker compose up”, hay una chance de que falle porque el servicio de la aplicación puede que inicie antes que el servicio de la db y no la encuentre para ejecutar la sentencia SQL

### Gestión de arranque

Al iniciarse, Compose no espera a que un contenedor esté listo, solo a que corra. Esto puede causar problemas si, por ejemplo, tenés un sistema de bases de datos relacional que necesita iniciar sus propios servicios antes de que pueda manejar conexiones entrantes


La solución para detectar el estado “listo” de un servicio es usar el atributo “condition” con una de las siguientes opciones:

service_started

service_healthy. Este especifica qué dependencia se espera que esté “sana”, la cual es definida con “healthcheck” antes de iniciar un servicio dependiente

service_completed_successfully. Este especifica que una dependencia se espera que corra hasta que esté correctamente iniciada antes de iniciar un servicio dependiente


Ejemplo:


Compose crea los servicios en orden de dependencias. “db” y “redis” son creados antes que “web”


Compose espera a que los healthchecks se completen correctamente en las dependencias marcadas como service_healthy. Se espera que db esté “sana” antes de que web sea creada


restart: true asegura que si la base de datos se actualizó o se reinicia debido a una operación de Compose, por ejemplo “docker  compose restart”, el servicio web también se reinicia automáticamente, lo que garantiza que restablezca correctamente las conexiones o dependencias


El healthcheck del servicio de la db usa el comando “pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}” para checar si la base de datos Postgres está lista. El servicio se reintenta cada 10 segundos, hasta 5 veces.


Compose también quita los servicios en orden de dependencia. “web” es removido antes que “db” y “redis”

### Healthcheck

El atributo healthcheck declara una comprobación que se ejecuta para determinar si los contenedores del servicio están en buen estado. Funciona de la misma manera y tiene los mismos valores que la instrucción HEALTHCHECK del Dockerfile establecida por el servicio de la imagen de Docker. El archivo Compose puede sobrescribir los valores establecidos en el Dockerfile


interval, timeout, start_period y start_interval son duraciones de tiempo


test define el comando que Compose ejecuta para comprobar el estado del contenedor. Puede ser una cadena de texto o una lista. Si es una lista, el primer ítem debe ser “NONE”, “CMD” o “CMD-SHELL”. Si es una cadena de texto, es equivalente a especificar “CMD-SHELL” seguido de dicha cadena de texto


El comando CMD-SHELL ejecuta la instrucción configurada como una cadena utilizando el intérprete de comandos del contenedor. Ambas de las siguientes formas son lo mismo:


“NONE” deshabilita el healthcheck y es mayormente útil para desactivar la instrucción Healthcheck del Dockerfile establecido por la imagen del servicio de Docker. También se puede desactivar colocando:


Más info sobre la instrucción Healthcheck de la imagen de Docker: https://docs.docker.com/reference/dockerfile/#healthcheck


## Tema 5. Keycloak y Autenticación Delegada

### ¿Qué es Keycloak?

Keycloak es una plataforma de gestión de identidad y acceso (Identity and Access Management, IAM) que permite centralizar la autenticación, autorización y gestión de usuarios en aplicaciones digitales. Su objetivo principal es simplificar y estandarizar cómo las aplicaciones gestionan el acceso, delegando estas funciones en un sistema especializado y seguro.

En entornos tecnológicos modernos, Keycloak se utiliza como una capa transversal que conecta aplicaciones, usuarios y servicios bajo una misma lógica de identidad, reduciendo la complejidad técnica y mejorando la seguridad global del sistema.

### ¿Para qué sirve Keycloak?

Keycloak sirve para gestionar de forma centralizada quién puede acceder a qué, bajo qué condiciones y con qué nivel de permisos. En lugar de implementar sistemas de autenticación independientes en cada aplicación, Keycloak permite definir reglas comunes y reutilizables.

Desde una perspectiva estratégica, Keycloak permite:

Centralizar la autenticación de múltiples aplicaciones.

Gestionar usuarios, roles y permisos desde un único punto.

Mejorar la seguridad sin aumentar la complejidad del código.

Reducir costes de desarrollo y mantenimiento.

Facilitar la escalabilidad de plataformas digitales.

Por ello, es especialmente relevante en productos tecnológicos que crecen en número de usuarios, aplicaciones o integraciones.

### Cómo funciona Keycloak

Keycloak actúa como un proveedor de identidad entre el usuario y la aplicación. Cuando una persona intenta acceder a una aplicación protegida, esta delega la verificación en Keycloak, que valida la identidad y devuelve la información necesaria para autorizar o denegar el acceso.

La aplicación no gestiona directamente contraseñas ni credenciales sensibles. En su lugar, confía en Keycloak para autenticar al usuario y proporcionar un contexto de seguridad estructurado, lo que reduce riesgos y responsabilidad técnica.

Este enfoque permite aplicar políticas de acceso coherentes en todo el ecosistema digital.


### Correr Keycloak en un contenedor

La imagen del contenedor default Keycloak viene lista para ser configurada y optimizada

Para el mejor inicio del contenedor Keycloak, genera una imagen al correr el paso “build” durante la construcción del contenedor. Este paso te ahorrará tiempo en todas las demás fases de inicialización del contenedor


Fun fact: un Containerfile es funcionalmente idéntico a un Dockerfile, solo que el término Containerfile es usado para ser más agnóstico con las herramientas, especialmente fuera del ambiente de Docker. En Docker, para usar un Containerfile ejecutas el siguiente comando:


“docker build -f Containerfile -t mykeycloak”


Un ejemplo de un Containerfile que crea una imagen Keycloak preconfigurada que habilita los endpoints de salud y métricas, usa varas de tokens y usa Postgres:FROM quay.io/keycloak/keycloak:latest AS builder


# Enable health and metrics support

ENV KC_HEALTH_ENABLED=true

ENV KC_METRICS_ENABLED=true


# Configure a database vendor

ENV KC_DB=postgres


WORKDIR /opt/keycloak

# for demonstration purposes only, please make sure to use proper certificates in production instead

RUN keytool -genkeypair -storepass password -storetype PKCS12 -keyalg RSA -keysize 2048 -dname "CN=server" -alias server -ext "SAN:c=DNS:localhost,IP:127.0.0.1" -keystore conf/server.keystore

RUN /opt/keycloak/bin/kc.sh build


FROM quay.io/keycloak/keycloak:latest

COPY --from=builder /opt/keycloak/ /opt/keycloak/


# change these values to point to a running postgres instance

ENV KC_DB=postgres

ENV KC_DB_URL=<DBURL>

ENV KC_DB_USERNAME=<DBUSERNAME>

ENV KC_DB_PASSWORD=<DBPASSWORD>

ENV KC_HOSTNAME=localhost

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]


El proceso de compilación incluye diferentes etapas:

Correr el comando build para establecer las opciones de construcción del server para crear una imagen optimizada

Los archivos generados por la etapa build se copian en una nueva imagen

En la imagen final, opciones de configuración adicionales para el hostname y la base de datos son establecidas para que no las tengas que correr de nuevo cuando corra el contenedor

En el entrypoint, “kc.sh” habilita acceso a todos los subcomandos de distribución


Para instalar proveedores personalizados, nada más necesitas definir un paso para incluir archivos JAR en el directorio /opt/keycloak/providers. Este paso es antes de correr el comando build. Ejemplo:


# An example build step that downloads a JAR file from a URL and adds it to the providers directory

FROM quay.io/keycloak/keycloak:latest as builder


...


# Add the provider JAR file to the providers directory

ADD --chown=keycloak:keycloak --chmod=644 <MY_PROVIDER_JAR_URL> /opt/keycloak/providers/myprovider.jar


...


# Context: RUN the build command

RUN /opt/keycloak/bin/kc.sh build

### Compilar la imagen del contenedor

Para construir la imagen actual del contenedor, tenés que correr el siguiente comando en el directorio que contiene al contenedor:


“podman | docker build . -t mykeycloak -f Containerfile”


### Iniciar la imagen optimizada Keycloak del contenedor

Corra esto:


podman|docker run --name mykeycloak -p 8443:8443 -p 9000:9000 \

-e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=change_me \

mykeycloak \

start --optimized --hostname=localhost


Keycloak se inicia en modo producción, usando solo comunicación HTTPS y está disponible en https://localhost:8443


Los endpoints del Health check están disponibles en https://localhost:9000/health, https://localhost:9000/health/ready, https://localhost:9000/health/live


Abrir https://localhost:9000/metrics nos envía a una página conteniendo las métricas operacionales que pueden ser usadas para monitorear la solución

### Problemas conocidos con Docker

Si el comando RUN dnf install parece estar tomando mucho tiempo, probablemente tu servicio systemd Docker tenga el límite de archivos LimitNOFILE configurado incorrectamente. Podés actualizar la configuración del servicio para usar un mejor valor o usar --ulimit en el “docker build command”


Si estás incluyendo proveedores JAR y tu contenedor falla al iniciar con --optimized con una notificación que dice que un proveedor JAR ha cambiado, esto se debe a que Docker trunca o modifica de otro modo las timestamps de la compilación de los archivos, alterando el valor registrado por el comando de compilación respecto al que se observa en tiempo de ejecución. En este caso, deberás forzar a la imagen a usar un timestamp conocido de tu preferencia con el comando “touch” antes de correr una compilación:


...

# ADD or copy one or more provider jars

ADD --chown=keycloak:keycloak --chmod=644 some-jar.jar /opt/keycloak/providers/

...

RUN touch -m --date=@1743465600 /opt/keycloak/providers/*

RUN /opt/keycloak/bin/kc.sh build

...


### Exponer el contenedor a otro puerto

Por default, el server está constantemente viendo si hay requests http o https usando los puertos 8080 y 8443, respectivamente


Si querés exponer el contenedor usando un puerto distinto, tenés que establecer el hostname de la siguiente manera:


Exponiendo un contenedor usando un puerto distinto a los defaults

podman|docker run --name mykeycloak -p 3000:8443 \

-e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=change_me \

mykeycloak \

start --optimized --hostname=https://localhost:3000


Al establecer la opción de hostname a un full url, podés acceder al server desde https://localhost:3000

### Probando Keycloak en modo desarrollador

La manera más fácil de probar Keycloak en un contenedor para propósitos de desarrollo o testing es usando el Development mode. Usás el comando start-dev  :


podman|docker run --name mykeycloak -p 127.0.0.1:8080:8080 \

-e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=change_me \

quay.io/keycloak/keycloak:latest \

start-dev


Al invocar este comando, inicias el server Keycloak en modo desarrollador

Este modo debe ser prevenido en ambientes de producción

### Proveer credenciales iniciales de admin cuando corra un contenedor

Keycloak solo permite crear al usuario inicial admin desde una red local. Este no es el caso cuando corre en un contenedor, entonces necesitas darle las siguientes variables de ambiente cuando corras la imagen:


# setting the admin username

-e KC_BOOTSTRAP_ADMIN_USERNAME=<admin-user-name>


# setting the initial password

-e KC_BOOTSTRAP_ADMIN_PASSWORD=change_me


### Importar un Realm en la inicialización

Los contenedores Keycloak tienen este directorio: /opt/keycloak/data/import. Si ponés uno o más archivos importados en ese directorio vía volume mount o algún otro y agregás el argumento --import-realm, el contenedor Keycloak importará la información en la inicialización

podman|docker run --name keycloak_unoptimized -p 127.0.0.1:8080:8080 \

-e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=change_me \

-v /path/to/realm/data:/opt/keycloak/data/import \

quay.io/keycloak/keycloak:latest \

start-dev --import-realm


### Topología y Conceptos Fundamentales

Keycloak opera como un Proveedor de Identidad (IdP) y Servidor de Autorización (Authorization Server). Su arquitectura se basa en la separación estricta de dominios de seguridad para garantizar que múltiples aplicaciones puedan coexistir sin comprometer la integridad de los datos.

| Unidad Lógica | Descripción Técnica Profunda | Impacto en el Diseño del Sistema |
| --- | --- | --- |
| Master Realm | Es el espacio de nombres de nivel superior (top-level namespace). Su único propósito es gobernar el servidor Keycloak y administrar otros Realms. | Nunca debe utilizarse para alojar usuarios de aplicaciones. Es una mala práctica de seguridad que compromete la administración del clúster. |
| Application Realm | Un tenant aislado con su propio almacén de usuarios, registro de clientes, configuración de sesiones y par de llaves criptográficas (RSA) para la firma de tokens. | Garantiza que la validación de tokens sea exclusiva para la aplicación en desarrollo, evitando colisiones de roles con otros servicios. |
| Client (OIDC) | La abstracción de un software que delega la autenticación a Keycloak. Puede ser un frontend (Vue, React) o un backend (API HTTP). | Define el contrato de confianza. El cliente especificará qué flujos de OAuth 2.0 están permitidos (ej. Implicit Flow vs Authorization Code). |
| Identity Provider (IdP) | Mecanismo mediante el cual Keycloak puede delegar, a su vez, la autenticación a terceros (Google, GitHub, LDAP/Active Directory). | Permite implementar Single Sign-On (SSO) empresarial sin modificar el código fuente de la aplicación principal. |

### Configuración Avanzada del Realm y Políticas de Seguridad

Al instanciar un nuevo Realm, el administrador asume el control sobre las políticas de seguridad y el ciclo de vida de las sesiones. Las configuraciones por defecto de Keycloak están orientadas a producción, lo que puede requerir ajustes en entornos de desarrollo contenerizados.

#### Gestión de Llaves Criptográficas

Keycloak genera automáticamente un par de llaves RSA (tamaño por defecto de 2048 bits) al crear un Realm. La llave privada se retiene en la base de datos interna de Keycloak y nunca se expone. Se utiliza para generar la firma criptográfica (tercera parte de un JWT). La llave pública se expone a través del endpoint JWKS (JSON Web Key Set), permitiendo a cualquier cliente verificar matemáticamente la autenticidad del token. Es fundamental entender que la validación en el backend no requiere llamadas de red a Keycloak si las llaves públicas han sido cacheadas.

#### Ciclo de Vida del Token

En la pestaña "Tokens" del Realm, se define el tiempo de expiración (TTL).

Access Token Lifespan: Por defecto suele ser de 1 a 5 minutos. Debe mantenerse corto para reducir la ventana de vulnerabilidad en caso de robo del token, ya que un token revocado localmente en Keycloak seguirá siendo validado como exitoso por un backend remoto hasta que expire (a menos que se implementen arquitecturas de validación online de alto costo).

Refresh Token Lifespan: Puede durar días o semanas. Se utiliza exclusivamente para solicitar un nuevo Access Token cuando este expira, sin que el usuario deba volver a ingresar sus credenciales.

### Gestión de Clientes (Clients) e Inyección de Reclamaciones (Mappers)

La configuración del Cliente dicta cómo la API se comunicará con Keycloak. Para una API backend, el cliente debe configurarse en modo Client authentication (Bearer-only). Esto significa que el cliente no maneja el proceso de redirección de inicio de sesión del usuario final.

#### Protocol Mappers

Los Mappers son herramientas de transformación que permiten inyectar atributos específicos dentro del token JWT antes de que Keycloak lo firme y lo envíe al usuario. Si el dominio de la aplicación requiere que el token contenga un dato personalizado (por ejemplo, el número de identificación de un estudiante), se debe configurar un User Attribute Mapper en el cliente.

Token Claim Name: Define el nombre de la propiedad en el JSON resultante (ej. student_id).

Claim JSON Type: Puede forzarse a String, Integer o Boolean para facilitar el parsing (deserialización) en lenguajes fuertemente tipados.

### Control de Acceso Basado en Roles (RBAC) y Anatomía del JWT

El modelo RBAC de Keycloak permite granularidad absoluta. Es vital comprender cómo se estructura la información de los roles dentro del token JWT (que es, en esencia, un string codificado en Base64Url).

#### Estructura del Payload del Token (Decodificado)

Al decodificar la sección intermedia de un JWT emitido por Keycloak, la aplicación HTTP observará una estructura JSON similar a esta:

{  "exp": 1693051200,  "iat": 1693050900,  "iss": "http://keycloak:8080/realms/tarea-corta-realm",  "sub": "a1b2c3d4-e5f6-7890-1234-567890abcdef",  "typ": "Bearer",  "azp": "api-backend",  "preferred_username": "fabricio_admin",  "realm_access": {    "roles": [      "default-roles-tarea-corta-realm",      "creador",      "editor"    ]  },  "resource_access": {    "api-backend": {      "roles": [        "acceso_api"      ]    }  }}

Proceso de Autorización en el Backend: Cuando el servicio recibe una petición POST /recurso, el interceptor o middleware de seguridad debe: 1. Verificar que el token no haya expirado comparando el epoch de exp con el reloj del sistema. 2. Verificar que el emisor (iss) coincide exactamente con la configuración esperada. 3. Extraer el arreglo realm_access.roles y comprobar si contiene el rol "creador". Si no está presente, se aborta la operación y se retorna un HTTP 403 Forbidden, previniendo así la mutación no autorizada de la base de datos.

### Integración de Persistencia Externa (PostgreSQL)

Por defecto, la imagen de Docker de Keycloak utiliza una base de datos embebida en memoria (H2). Esta configuración es inaceptable para un entorno orquestado donde los contenedores son efímeros, ya que cualquier configuración de clientes o roles se perderá al recrear el contenedor (un evento docker compose down).

Keycloak está diseñado en Java y utiliza controladores JDBC (Java Database Connectivity) para conectarse nativamente a motores relacionales. Para un diseño robusto, se debe apuntar Keycloak hacia el contenedor de PostgreSQL principal de la arquitectura.

#### Configuración de Variables de Entorno en Docker Compose

Se deben proporcionar las siguientes variables de entorno al servicio de Keycloak para delegar la persistencia:

keycloak:  image: quay.io/keycloak/keycloak:latest  environment:    - KC_DB=postgres    - KC_DB_URL=jdbc:postgresql://postgres-db:5432/keycloak    - KC_DB_USERNAME=${DB_USER}    - KC_DB_PASSWORD=${DB_PASS}    - KC_BOOTSTRAP_ADMIN_USERNAME=${KC_ADMIN}    - KC_BOOTSTRAP_ADMIN_PASSWORD=${KC_PASS}  depends_on:    postgres-db:      condition: service_healthy  command: start-dev --import-realm

Consideración Crítica: Es imperativo crear una base de datos lógica dedicada para Keycloak (ej. `CREATE DATABASE keycloak;`) dentro de la instancia de PostgreSQL, separada de la base de datos lógica que utilizará la aplicación HTTP de dominio, para evitar superposición de tablas o colisiones de esquemas (schema collisions).

### Lógica de Validación de Tokens en Backend

La integración en el código fuente de la aplicación depende fuertemente de bibliotecas especializadas que implementan las complejas matemáticas criptográficas y el caché de llaves. No se debe programar la decodificación JWT "a mano".

#### Flujo Operativo del Backend

Arranque (Readiness): La aplicación backend realiza una petición GET a la URL de descubrimiento (/.well-known/openid-configuration) usando el nombre de red interno de Docker (ej. http://keycloak:8080/...).

Extracción del JWKS: Obtiene la propiedad jwks_uri y realiza una segunda petición a esa dirección para descargar los certificados públicos actuales. Estos se almacenan en caché en memoria ram del contenedor backend.

Intercepción de Solicitud: Cuando un cliente externo llama a una ruta protegida (ej. POST), el middleware inspecciona el encabezado Authorization: Bearer [TOKEN].

Verificación RSA: Se extrae el segmento de firma del JWT y se procesa utilizando la llave pública cacheada. Si la firma es matemáticamente válida, la información del payload es confiable y se procede a verificar la expiración y los roles.

### Automatización, Importación y Preparación de Pruebas

Para garantizar un despliegue reproducible ("un solo comando levanta todo"), la configuración completa del Realm debe externalizarse en un archivo JSON y mapearse a través de volúmenes de Docker.

#### Montaje de Volúmenes (Bind Mounts)

Se debe crear un archivo realm-export.json en el repositorio, obtenido de la interfaz de exportación gráfica parcial de Keycloak (incluyendo clientes, roles y usuarios). En el archivo Compose, el volumen se declara así:

volumes:      - ./config/realm-export.json:/opt/keycloak/data/import/realm-export.json:ro

El modificador :ro (Read-Only) garantiza que el contenedor de Keycloak no pueda modificar o dañar el archivo original versionado en Git. La bandera --import-realm en el comando de ejecución obliga al servidor a parsear este directorio durante la inicialización, poblando la base de datos PostgreSQL con todo el estado necesario para que las pruebas de integración funcionen inmediatamente.

### Pruebas de Integración y Scripts de Consola (cURL)

Para las pruebas de integración (E2E), el motor de pruebas requerirá obtener un token válido de manera programática antes de intentar consumir los endpoints protegidos. Esto se logra utilizando el flujo Resource Owner Password Credentials Grant (conocido como Direct Access Grants en Keycloak).

#### Simulación del Flujo de Autenticación

El siguiente script de consola demuestra cómo obtener dinámicamente un token de acceso pasando credenciales configuradas y almacenarlo en una variable, para luego inyectarlo en la llamada a la API local.

# 1. Obtener el token realizando un POST url-encoded a Keycloakexport TOKEN=$(curl -s -X POST \  http://localhost:8080/realms/tarea-corta-realm/protocol/openid-connect/token \  -H "Content-Type: application/x-www-form-urlencoded" \  -d "grant_type=password" \  -d "client_id=api-backend" \  -d "username=usuario_prueba" \  -d "password=clave_segura" | jq -r '.access_token')# 2. Consumir la API utilizando el token inyectado en la cabeceracurl -X POST http://localhost:5000/recurso \  -H "Authorization: Bearer $TOKEN" \  -H "Content-Type: application/json" \  -d '{"campo1": "valor", "campo2": 42}'

Si el usuario usuario_prueba no tiene el rol asignado, Keycloak igual emitirá el token correctamente (HTTP 200 en el primer paso), pero la aplicación receptora en el puerto 5000 debe inspeccionar el payload y retornar el HTTP 403 esperado. Esto garantiza que las pruebas de integración sean exhaustivas e independientes de la interfaz gráfica.

### Diagnóstico y Troubleshooting

Durante la etapa de contenerización, es frecuente encontrar errores arquitectónicos. A continuación se detallan las fallas comunes y su resolución en el contexto de Docker.

Error "Connection Refused" al validar JWT: Ocurre si la API intenta verificar el token llamando a localhost:8080. Dentro de la red de Docker, localhost se refiere al propio contenedor de la API. La variable de entorno para el emisor de OIDC debe apuntar a http://keycloak:8080 (usando el nombre del servicio en Compose).

Error "Invalid Signature": Sucede si el token fue emitido por una instancia anterior de Keycloak y luego el contenedor fue destruido y recreado sin persistencia de base de datos. Keycloak generará un nuevo par de llaves RSA al reiniciar, invalidando todos los tokens emitidos previamente. Configurar correctamente el volumen para PostgreSQL resuelve esto.

Base de datos no inicializa: Si el log de Keycloak indica que no puede contactar a la base de datos relacional (PostgreSQL), asegúrese de que el depends_on del docker-compose.yml utiliza la sintaxis extendida con condition: service_healthy, lo cual detiene el arranque de Keycloak hasta que PostgreSQL acepte conexiones reales, evitando interrupciones en el servicio de identidad.


### Fundamentos: OAuth 2.0 vs OpenID Connect (OIDC)

Para comprender la validación de tokens, primero se debe demarcar la frontera entre autorización y autenticación. OAuth 2.0 es un marco de autorización delegada; fue diseñado para otorgar acceso a recursos de forma condicional, pero no para autenticar al usuario (no proporciona información sobre "quién" es el usuario).

OpenID Connect (OIDC) soluciona esta carencia al construirse como una capa de identidad sobre OAuth 2.0. OIDC introduce un nuevo artefacto obligatorio: el ID Token. Mientras que en OAuth 2.0 un Access Token puede ser una cadena opaca (sin formato específico), OIDC exige que el ID Token (y frecuentemente el Access Token emitido por proveedores modernos como Keycloak) adopte el formato JSON Web Token (JWT).

### Anatomía Criptográfica del JSON Web Token (JWT)

Un JWT es un estándar abierto (RFC 7519) que define una forma compacta y autónoma de transmitir información. El término "autónoma" es crítico aquí: el backend no necesita consultar la base de datos de Keycloak en cada petición para saber si el token es válido; toda la información necesaria (y la prueba de su integridad) viaja dentro del mismo token. Un JWT consta de tres partes separadas por puntos (.), codificadas en Base64Url:

#### El Encabezado

Contiene metadatos sobre el tipo de token y el algoritmo criptográfico utilizado para firmarlo. En el contexto de OIDC, dos campos son obligatorios para la validación de firmas asimétricas:

alg (Algorithm): Generalmente RS256 (RSA Signature with SHA-256). Indica que el token fue firmado con una llave privada RSA.

kid (Key ID): Un identificador alfanumérico único. Como los proveedores rotan sus llaves criptográficas por seguridad, el kid le dice al backend exactamente qué llave pública debe buscar en el servidor para validar este token en particular.

#### El Cuerpo

Contiene las declaraciones (claims) sobre el usuario y metadatos del ciclo de vida del token. Según la especificación Core de OIDC, los claims esenciales para la validación son:

iss (Issuer): La URL exacta del servidor que emitió el token (ej. http://keycloak:8080/realms/mi-realm).

sub (Subject): El identificador único e inmutable del usuario (típicamente un UUID).

aud (Audience): El destinatario previsto del token (el client_id de la API).

exp (Expiration Time): El timestamp (Epoch) exacto en que el token deja de ser válido.

iat (Issued At): El timestamp en que el token fue creado.

#### La Firma

Es el resultado de tomar el Header codificado, el Payload codificado, unirlos con un punto, y aplicarles el algoritmo criptográfico (ej. RS256) utilizando la llave privada del servidor de identidad. Es matemáticamente imposible regenerar esta firma o alterar un solo carácter del Payload sin poseer la llave privada.

### El Documento de Descubrimiento (OIDC Discovery) y jwks_uri

Para que un servicio backend pueda validar la firma de manera autónoma, necesita acceder a las llaves públicas del proveedor. OpenID Connect define un protocolo de descubrimiento (RFC 8414) para que la API no tenga las URLs configuradas de forma rígida en el código.

El backend debe realizar una petición HTTP GET a la ruta estándar de configuración del proveedor:

http://keycloak:8080/realms/{realm}/.well-known/openid-configuration

Este endpoint retorna un documento JSON masivo. El campo más crítico para la seguridad del servicio HTTP es el jwks_uri (JSON Web Key Set URI). Esta es la URL que aloja el catálogo de llaves públicas actuales del servidor.

#### Estructura del JWKS

Al consultar el jwks_uri, el servidor responde con un arreglo de llaves (keys). Cada objeto define los componentes matemáticos de una llave pública RSA.

{  "keys": [    {      "kid": "QWVyZ...1B2c",       "kty": "RSA",      "alg": "RS256",      "use": "sig",      "n": "vXvR..._9xQ",      "e": "AQAB"    }  ]}

El backend utiliza el campo kid (proveniente del Header del token entrante) para buscar la llave coincidente en este arreglo. Una vez localizada, utiliza el módulo (n) y el exponente (e) para reconstruir la llave pública RSA en memoria y aplicar la validación de la firma.

### Especificación Core 1.0: Reglas Estrictas de Validación

La Sección 3.1.3.7 de la especificación OIDC Core 1.0 dicta los pasos ineludibles que cualquier Cliente o API debe ejecutar para aceptar un token. La omisión de cualquiera de estos pasos compromete la integridad del sistema y genera vulnerabilidades críticas (como ataques de suplantación de emisor o replay attacks).

Extracción Inicial (Sin validación de firma): El backend decodifica la cabecera en Base64Url para leer el alg y el kid, identificando qué algoritmo se espera y qué llave se necesita buscar en el JWKS.

Validación del Emisor (Issuer matching): El valor del claim iss del token debe ser exactamente idéntico a la URL del emisor esperada por la API. Si difiere por una sola barra diagonal (slash) o cambia de localhost al nombre de un contenedor de Docker, el token debe ser rechazado inmediatamente con un error 401.

Validación de la Audiencia (Audience check): El backend debe comprobar que el claim aud contenga el nombre (client_id) de la API. Si el token fue emitido para otra aplicación de la empresa, la API actual debe rechazarlo, evitando el uso lateral de credenciales.

Verificación de Expiración (Temporal validity): La API debe comparar el claim exp (tiempo de expiración) contra la hora actual del sistema en UTC. Si el tiempo actual es mayor que el exp, el token está vencido.

Validación Criptográfica de la Firma (Signature check): Constituye el núcleo de la seguridad. Se debe utilizar una biblioteca criptográfica estandarizada para tomar la llave pública (obtenida del JWKS usando el kid) y verificar que el hash del Header + Payload coincida con la Firma adjunta.

### Arquitectura de Caché de Llaves Públicas (Performance)

Un error arquitectónico común al implementar OIDC es realizar una petición HTTP al endpoint jwks_uri por cada token recibido. Esto introduce una latencia inaceptable, satura el servidor de identidad y crea un punto único de falla (si Keycloak se reinicia temporalmente, la API se cae porque no puede validar tokens).

La Estrategia Óptima: El servicio HTTP debe descargar el JWKS en el arranque (durante su propia rutina de readiness) y almacenar los objetos RSA en la memoria RAM (caché en memoria). Las bibliotecas OIDC empresariales gestionan esto automáticamente, incluyendo lógicas de fallback: si llega un token con un kid que no está en la memoria caché, la biblioteca asume que Keycloak rotó sus llaves de seguridad y realiza una única petición de fondo al jwks_uri para actualizar la caché.

### Implementación Práctica Backend: Mapeo de la Especificación al Código

No se recomienda bajo ninguna circunstancia escribir las rutinas de hashing RSA a mano. A continuación, se presentan arquitecturas de implementación para los lenguajes backend más robustos y comúnmente utilizados en entornos de ingeniería: Java y Python. Estas implementaciones aplican automáticamente todas las reglas de la Sección 3.1.3.7.

#### Arquitectura en Python

Para servicios construidos en Python (ej. FastAPI o Flask), el estándar de la industria es utilizar la biblioteca PyJWT en combinación con su módulo PyJWKClient, el cual maneja el descubrimiento y el caché de llaves.

import jwtfrom jwt import PyJWKClient# 1. Configuración del Endpoint de Llaves (JWKS)# PyJWKClient incluye caché en memoria por defectojwks_url = "http://keycloak:8080/realms/tarea-corta-realm/protocol/openid-connect/certs"jwks_client = PyJWKClient(jwks_url)def validar_token_oidc(token_entrante):    try:        # 2. Descubrimiento dinámico de la llave correcta (buscando el "kid")        signing_key = jwks_client.get_signing_key_from_jwt(token_entrante)        # 3. Validación estricta OIDC Core 1.0        payload_decodificado = jwt.decode(            token_entrante,            signing_key.key,            algorithms=["RS256"],            audience="api-backend", # Verifica el claim 'aud'            issuer="http://keycloak:8080/realms/tarea-corta-realm" # Verifica el claim 'iss'        )                # Si llega a este punto, la firma, expiración y emisor son válidos.        return payload_decodificado            except jwt.ExpiredSignatureError:        raise HTTPException(status_code=401, detail="El token ha expirado")    except jwt.InvalidIssuerError:        raise HTTPException(status_code=401, detail="Emisor (Issuer) no reconocido")    except jwt.InvalidSignatureError:        raise HTTPException(status_code=401, detail="Firma criptográfica inválida o adulterada")

#### Arquitectura en Java

En el ecosistema Java (aplicable a Spring Boot o frameworks puros), la combinación de las bibliotecas auth0/java-jwt y auth0/jwks-rsa provee una solución orientada a objetos (OOP) que abstrae la complejidad de la rotación de llaves, implementando patrones de diseño como el Proveedor y el Verificador.

import com.auth0.jwk.*;import com.auth0.jwt.JWT;import com.auth0.jwt.algorithms.Algorithm;import com.auth0.jwt.interfaces.DecodedJWT;import com.auth0.jwt.interfaces.JWTVerifier;import java.net.URL;import java.security.interfaces.RSAPublicKey;public class OIDCValidator {    private JwkProvider provider;    private JWTVerifier verifier;    public OIDCValidator() throws Exception {        // 1. Configuración del Proveedor JWKS con caché interno        URL jwksUrl = new URL("http://keycloak:8080/realms/tarea-corta-realm/protocol/openid-connect/certs");        this.provider = new JwkProviderBuilder(jwksUrl).build();    }    public DecodedJWT validar(String tokenEntrante) throws Exception {        // 2. Extraer el Key ID (kid) sin validar la firma aún        DecodedJWT jwtNoValidado = JWT.decode(tokenEntrante);        Jwk jwk = provider.get(jwtNoValidado.getKeyId());                // 3. Reconstruir la llave pública RSA        Algorithm algoritmoRsa = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);                // 4. Construir el motor de verificación aplicando las reglas OIDC        if (this.verifier == null) {            this.verifier = JWT.require(algoritmoRsa)                .withIssuer("http://keycloak:8080/realms/tarea-corta-realm")                .withAudience("api-backend")                .build();        }                // 5. Ejecutar validación (Firma + Expiración + Emisor)        // Lanza excepción si el token es inválido, adulterado o expirado        return verifier.verify(tokenEntrante);     }}

### Orquestación y Resolución de Redes en Docker

Una de las fallas de validación OIDC más complejas de diagnosticar ocurre en arquitecturas contenerizadas por problemas de resolución DNS.

El Conflicto: Cuando un script de pruebas (o una herramienta externa) solicita un token a Keycloak desde la máquina anfitriona, puede usar la URL http://localhost:8080. Keycloak tomará esa URL de la petición y la grabará dentro del token en el campo iss (Issuer). Sin embargo, cuando el servicio backend (corriendo dentro de la red interna de Docker) intente descargar las llaves públicas o verificar el emisor, usará la resolución interna de Compose, esperando que el emisor sea http://keycloak:8080.

La Solución Arquitectónica: El algoritmo de validación fallará lanzando una excepción de "Issuer Mismatch" (Localhost vs Keycloak). Para resolverlo, se debe configurar una variable de entorno en Keycloak (generalmente KC_HOSTNAME_URL o forzando la URL del frontend en la consola administrativa) para garantizar que, sin importar desde dónde se origine la petición de inicio de sesión, el claim iss inyectado en el JWT sea estrictamente el nombre del servicio interno de red configurado en el archivo docker-compose.yml.

### Autorización de Rutas HTTP: 401 vs 403

La correcta implementación de OIDC Core 1.0 facilita un mapeo directo y estandarizado de los errores de validación a los códigos de respuesta del protocolo HTTP, tal como lo demandan las rúbricas de evaluación de diseño de APIs.

| Escenario de Evaluación OIDC | Código HTTP Resultante | Acción en el Backend |
| --- | --- | --- |
| Token no enviado (cabecera Authorization ausente) | 401 Unauthorized | Bloquear la solicitud antes de procesar el cuerpo (body) de la petición. |
| El Token está expirado (exp < tiempo actual) | 401 Unauthorized | La biblioteca lanza Excepción. El backend captura y devuelve el error sin procesar la lógica de negocio. |
| Firma Criptográfica Inválida (adulteración detectada) | 401 Unauthorized | La validación matemática contra el JWKS falla. Posible intento de ataque. |
| Token Válido, pero carece del rol necesario en el Payload | 403 Forbidden | La validación de firma y expiración fue exitosa, pero la lógica de la ruta (RBAC) detecta que el usuario no tiene permisos suficientes. |


## Tema 6. Kubernetes y Kind

### ¿Qué es kind y por qué se utiliza?

kind es una herramienta oficial del proyecto Kubernetes (desarrollada por SIG Testing) diseñada para ejecutar clústeres locales utilizando contenedores de Docker como si fueran los "nodos" físicos o virtuales de un clúster real.

Ligero y Rápido: A diferencia de Minikube o Docker Desktop Kubernetes, que a menudo requieren máquinas virtuales pesadas, kind arranca el panel de control (control plane) y los nodos de trabajo (worker nodes) dentro de contenedores de Docker estándar.

Propósito en el Proyecto: Permite simular el entorno de producción al que se desplegaría el servicio HTTP y la base de datos PostgreSQL, sin incurrir en costos de nube. Proporciona el entorno donde se aplicarán los manifiestos de Deployment, Service y PersistentVolumeClaim exigidos por la rúbrica.

### Ciclo de Vida del Clúster mediante CLI

La CLI de kind es minimalista. Para la documentación que debe incluirse en el README.md del proyecto, es necesario dominar los comandos de creación y destrucción.

#### Creación del Clúster

Para levantar el entorno base, se utiliza el siguiente comando. Se recomienda asignarle un nombre específico para evitar colisiones con otros proyectos.

kind create cluster --name tc1-cluster

Al ejecutar este comando, kind realiza lo siguiente: 1. Descarga la imagen del nodo de Kubernetes (que contiene kubeadm, kubelet y un entorno de ejecución de contenedores interno como containerd). 2. Levanta un contenedor de Docker que actuará como el clúster. 3. Modifica automáticamente el archivo ~/.kube/config de la máquina anfitriona para que la herramienta kubectl apunte por defecto a este nuevo clúster.

#### Verificación de Conexión

Para asegurar que el clúster está listo para recibir los manifiestos, se verifica el contexto de kubectl:

kubectl cluster-info --context kind-tc1-clusterkubectl get nodes

#### Destrucción del Clúster

Para limpiar el entorno de desarrollo (equivalente al docker compose down -v), se elimina el clúster completo:

kind delete cluster --name tc1-cluster

### Carga de Imágenes Locales (El Cuello de Botella Crítico)

Uno de los errores arquitectónicos más comunes al migrar de Docker Compose a Kubernetes ocurre en el manejo de imágenes construidas localmente. En el `docker-compose.yml`, la instrucción build: . permite que Compose construya la imagen a partir del Dockerfile y la instancie inmediatamente.

Kubernetes no construye imágenes. Un Deployment siempre intenta descargar la imagen (Pull) de un registro remoto (como Docker Hub o GitHub Container Registry). Como el servicio HTTP del proyecto se compila de forma local y no se subirá a un registro público, Kubernetes fallará con un error ErrImagePull o ImagePullBackOff.

La Solución de Kind: La documentación especifica el uso del comando load para inyectar una imagen local directamente en el caché de los nodos del clúster.

# 1. Construir la imagen del servicio localmente con Dockerdocker build -t mi-servicio-http:v1 .# 2. Cargar la imagen al clúster de Kindkind load docker-image mi-servicio-http:v1 --name tc1-cluster

En el manifiesto del Deployment, la propiedad imagePullPolicy debe configurarse como Never o IfNotPresent para forzar a Kubernetes a utilizar la imagen que Kind acaba de inyectar.

### Traducción de la Arquitectura: Compose a Kubernetes

La tarea exige establecer la correspondencia entre los conceptos de Compose y sus equivalentes en Kubernetes. En el entorno local proporcionado por Kind, estos objetos se instancian aplicando manifiestos YAML.

| Concepto en Docker Compose | Objeto Equivalente en Kubernetes | Implementación en el Proyecto |
| --- | --- | --- |
| services: app | Deployment | Maneja el ciclo de vida de los Pods de la aplicación. Aquí se especifican la imagen (cargada con kind), los recursos y las pruebas de salud. |
| Puertos expuestos (ports: o redes internas) | Service (ClusterIP / NodePort) | Un Service tipo ClusterIP para PostgreSQL/Keycloak (solo accesibles internamente) y un NodePort o mapeo de puertos de kind para acceder a la API desde el host. |
| volumes: db-data | PersistentVolumeClaim (PVC) | Solicitud de almacenamiento. En Kind, el aprovisionador de almacenamiento por defecto enlazará este PVC al disco del contenedor de Docker subyacente. |
| healthcheck: /health y depends_on | LivenessProbe y ReadinessProbe | Requisito explícito de la tarea. La ruta /health se mapea al livenessProbe, y /ready al readinessProbe dentro de la especificación del contenedor en el Deployment. |
| environment: (Variables de entorno) | ConfigMap y Secret | Las URIs y configuraciones van en un ConfigMap. Las credenciales de DB y contraseñas de Keycloak van en un Secret (codificadas en Base64). |

### Integración con Kustomize (Base y Overlays)

El módulo para grupos de tres personas prohíbe aplicar manifiestos estáticos individuales. Se debe emplear Kustomize, que viene integrado nativamente en el comando kubectl. Kind actúa como el entorno de alojamiento, y Kustomize como el motor de renderizado de la configuración.

#### Estructura de Directorios

Se debe crear una jerarquía para cumplir con el requisito sin duplicar manifiestos:

kubernetes/├── base/│   ├── kustomization.yaml│   ├── deployment-app.yaml│   ├── deployment-postgres.yaml│   ├── service-app.yaml│   ├── service-postgres.yaml│   ├── pvc-postgres.yaml│   └── config.yaml (ConfigMap y Secret base)└── overlays/    └── dev/        ├── kustomization.yaml        └── patch-replicas.yaml

#### Aplicación en el Clúster de Kind

En el archivo kustomization.yaml de la carpeta overlays/dev/, se referencia la base y se aplican las modificaciones obligatorias de la rúbrica (por ejemplo, escalar el Deployment a 2 réplicas).

# overlays/dev/kustomization.yamlresources:  - ../../basepatches:  - path: patch-replicas.yaml

Una vez que el clúster de kind está operando y la imagen de Docker está cargada, el comando final documentado en el README para desplegar el sistema entero será:

kubectl apply -k ./kubernetes/overlays/dev

### Resumen de Flujo para el README (El "Single Command")

Dado que la tarea exige reproducibilidad extrema, el equipo puede documentar un script o serie de comandos lineales en el README.md para que el evaluador despliegue el módulo de Kubernetes sin fallos:

kind create cluster --name tc1-cluster (Inicia el clúster local).

docker build -t app-servicio:local . (Construye la imagen del servicio HTTP).

kind load docker-image app-servicio:local --name tc1-cluster (Inyecta la imagen al nodo virtual).

kubectl apply -k ./kubernetes/overlays/dev (Orquesta los manifiestos con Kustomize aplicando las variaciones requeridas).

kubectl get pods -w (Monitorea hasta que los Probes de liveness y readiness reporten el sistema saludable).


### Cargas de Trabajo Declarativas: El Controlador `Deployment`

En Kubernetes, un Pod es la unidad de computación desplegable más pequeña que se puede crear y gestionar. Sin embargo, los Pods son entidades efímeras; si un nodo falla, o si un proceso interno colapsa y excede los límites de reinicio, el Pod muere y no resucita por sí solo. Para sistemas de producción (y para cumplir con los requerimientos de resiliencia de la tarea), nunca se deben desplegar Pods desnudos. Aquí es donde interviene el controlador Deployment.

#### Concepto y Bucle de Control

Un Deployment proporciona actualizaciones declarativas para Pods y ReplicaSets. El usuario describe un estado deseado en un manifiesto YAML (por ejemplo: "Deseo tener exactamente 2 réplicas de mi servicio HTTP ejecutando la imagen v1"). El Deployment Controller, un componente del panel de control de Kubernetes, monitorea continuamente el estado actual del clúster y lo cambia hacia el estado deseado a un ritmo controlado.

| Mecanismo Interno | Descripción Técnica |
| --- | --- |
| ReplicaSet Subyacente | El Deployment no gestiona los Pods directamente. Crea un objeto ReplicaSet que se encarga de asegurar que el número exacto de Pods esté corriendo. Al actualizar una imagen, el Deployment crea un nuevo ReplicaSet y transfiere los Pods gradualmente. |
| Estrategia RollingUpdate | Por defecto, Kubernetes actualiza los Deployments sin tiempo de inactividad (zero-downtime). Levanta nuevos Pods antes de destruir los viejos, esperando a que los Readiness Probes de los nuevos confirmen que están listos para recibir tráfico. |
| Rollback (Reversión) | Si el nuevo código introducido en la APIHTTP falla (ej. CrashLoopBackOff), el administrador puede ejecutar un comando para regresar inmediatamente a la revisión anterior almacenada en el historial del Deployment. |

#### Anatomía de un Manifiesto de Deployment

Para el proyecto, se requerirán tres Deployments (Servicio HTTP, PostgreSQL y Keycloak). La estructura YAML exige comprender la relación entre labels y selectors:

apiVersion: apps/v1kind: Deploymentmetadata:  name: api-backend-deployment  labels:    app: api-backendspec:  replicas: 1  selector:    matchLabels:      app: api-backend # 1. Vínculo crítico: El ReplicaSet buscará Pods con esta etiqueta  template: # 2. Plantilla del Pod: A partir de aquí es idéntico a crear un Pod individual    metadata:      labels:        app: api-backend # 3. Esta etiqueta DEBE coincidir con el selector de arriba    spec:      containers:      - name: http-service        image: api-backend:v1        imagePullPolicy: IfNotPresent # Vital para entornos locales como 'kind'        ports:        - containerPort: 8080        env:        - name: DB_HOST          value: "postgres-service" # Se referenciará mediante DNS interno

#### Probes: Liveness y Readiness (La solución al "depends_on")

En Docker Compose, se utiliza depends_on: condition: service_healthy para garantizar el orden de arranque. Kubernetes no tiene un equivalente directo a depends_on. Su filosofía es que los sistemas distribuidos deben ser resilientes a fallos y arranques asíncronos. La solución arquitectónica se basa en sondas (Probes):

Liveness Probe (Prueba de Vida): Sustituye al /health. Le indica al kubelet si el contenedor está bloqueado (deadlock). Si esta sonda falla, Kubernetes reinicia el contenedor de manera implacable.

Readiness Probe (Prueba de Disponibilidad): Sustituye al /ready. Le indica a Kubernetes si el contenedor está listo para recibir tráfico de red. Esta es la clave de la tarea: Si la base de datos PostgreSQL no ha arrancado, el /ready de la API HTTP fallará. Al fallar, Kubernetes no reinicia la API, simplemente la oculta del enrutador (Service) para que no reciba peticiones externas, manteniéndola en espera hasta que la base de datos despierte y la sonda retorne 200 OK.

# Dentro de la especificación del contenedor en el Deployment        livenessProbe:          httpGet:            path: /health            port: 8080          initialDelaySeconds: 5          periodSeconds: 10        readinessProbe:          httpGet:            path: /ready            port: 8080          initialDelaySeconds: 5          periodSeconds: 5

### Redes y Descubrimiento: El Objeto `Service`

Los Pods en Kubernetes nacen y mueren continuamente. Cada vez que un Pod se inicia, se le asigna una nueva dirección IP dinámica. Si el frontend (o Keycloak) intenta conectarse a la API HTTP usando su dirección IP, la comunicación se romperá en el próximo reinicio.

Un Service es una abstracción lógica que define un conjunto de Pods y una política para acceder a ellos. El Service provee una dirección IP estática y un nombre DNS persistente que nunca cambia durante el ciclo de vida del Service, actuando como un balanceador de carga interno.

#### El Vínculo: Labels y Selectors

El Service no sabe qué es un "Deployment". Su única forma de encontrar los Pods a los que debe dirigir el tráfico es mediante selectores de etiquetas. El selector del Service debe coincidir exactamente con el template.metadata.labels del Deployment. A través del componente kube-proxy y el objeto interno EndpointSlice, el Service mantiene una lista actualizada en tiempo real de las IPs de los Pods saludables.

#### Tipos de Services

La documentación establece diferentes formas de exponer un servicio según la topología de la red. Esto es crucial para cumplir con la rúbrica, la cual requiere acceso interno (entre contenedores) y acceso externo (desde la PC anfitriona).

| Tipo de Service | Comportamiento | Uso Recomendado en el Proyecto |
| --- | --- | --- |
| ClusterIP (Por defecto) | Expone el servicio en una IP interna del clúster. Hace que el servicio solo sea accesible desde dentro de Kubernetes. | Ideal para la base de datos PostgreSQL. No hay ninguna justificación de seguridad para exponer la base de datos a internet o al host de forma directa. |
| NodePort | Expone el servicio en la IP de cada Nodo en un puerto estático (por defecto entre 30000-32767). Rutea automáticamente hacia el ClusterIP subyacente. | Útil para el Servicio HTTP y Keycloak, permitiendo consumirlos desde postman/curl en el entorno local (a través del puerto expuesto del contenedor de kind). |
| LoadBalancer | Expone el servicio externamente usando el balanceador de carga del proveedor de nube (AWS, GCP, Azure). | No aplicable. En un entorno local con kind, este tipo de servicio quedará eternamente en estado Pending a menos que se instale un componente como MetalLB. |

#### Resolución DNS Interna (CoreDNS)

En Docker Compose, el nombre del servicio en el archivo YAML se convierte en su nombre de red (ej. http://postgres:5432). En Kubernetes, el componente CoreDNS asigna automáticamente registros A/AAAA a cada Service creado.

La estructura de la URL sigue un estándar riguroso: <nombre-del-servicio>.<espacio-de-nombres>.svc.cluster.local. Si los recursos se despliegan en el espacio de nombres por defecto, la API HTTP podrá alcanzar a la base de datos simplemente llamando al nombre del Service, replicando el comportamiento de Compose.

apiVersion: v1kind: Servicemetadata:  name: postgres-service  # <- ESTE SERÁ EL NOMBRE DE RED PARA CONECTARSEspec:  type: ClusterIP  selector:    app: postgres-db      # Debe coincidir con el label del Deployment de Postgres  ports:    - protocol: TCP      port: 5432          # Puerto que expone el Service dentro del clúster      targetPort: 5432    # Puerto en el que el Pod de Postgres está escuchando

### Correspondencia Directa: Docker Compose vs Kubernetes

Para culminar el módulo de la Tarea Corta 1, es vital comprender que un solo bloque de servicio en docker-compose.yml generalmente se descompone en dos o tres manifiestos independientes en Kubernetes para separar la computación, la red y la persistencia.

| Línea en Docker Compose | Traducción al Manifiesto de Kubernetes |
| --- | --- |
| image: postgres:15 | Se declara en Deployment -> spec.template.spec.containers.image. |
| ports: - "8080:8080" | Se requiere un manifiesto Service separado. El targetPort será 8080. Si se necesita exponer a la PC, se usa type: NodePort o se aplica kubectl port-forward. |
| environment: - DB_USER=admin | Se declara en el Deployment -> spec.template.spec.containers.env. Para buenas prácticas, el valor no se quema en el código, sino que se inyecta con valueFrom.secretKeyRef o configMapKeyRef. |
| volumes: - db_data:/var/lib/... | El Deployment debe incluir un volumeMounts en el contenedor, el cual referencia a un volumes del Pod, que a su vez se enlaza a un manifiesto externo PersistentVolumeClaim (PVC). |
| healthcheck: test: ["CMD", "curl"...] | Se configura en el Deployment como livenessProbe.exec.command o preferiblemente livenessProbe.httpGet delegando la red a kubelet. |


### El Problema del Estado Efímero en Entornos Nativos de la Nube

Por diseño, los contenedores (y los Pods de Kubernetes que los encapsulan) son inmutables y efímeros. Cualquier archivo escrito en el sistema de archivos local de un Pod (por ejemplo, en las rutas de almacenamiento de datos de PostgreSQL) se escribe en una capa de lectura/escritura volátil. Si el Pod colapsa, es reprogramado en otro nodo, o el Deployment se actualiza, el contenedor se destruye junto con todo su sistema de archivos.

Para el núcleo de la Tarea Corta 1, la rúbrica exige una Persistencia verificable: "Los datos sobreviven a down y up de forma verificable". En Docker Compose esto se resolvía mapeando un volume nombrado al host. En Kubernetes, la abstracción es mucho más robusta y desacoplada para permitir que el clúster opere independientemente del hardware subyacente.

### Arquitectura de Almacenamiento: Separación de Responsabilidades

Kubernetes aborda el almacenamiento separando completamente el suministro (quién y cómo provee el disco) del consumo (quién lo usa y cuánto espacio necesita). Esto se modela a través de tres recursos API fundamentales:

| Recurso API | Descripción Técnica | Responsabilidad |
| --- | --- | --- |
| PersistentVolume (PV) | Un fragmento de almacenamiento real en el clúster que ha sido aprovisionado por un administrador o dinámicamente mediante una StorageClass. Es un recurso del clúster físico o en la nube (disco duro, EBS en AWS, NFS, etc.). | Infraestructura (Suministro). En kind, esto se crea automáticamente por detrás. |
| PersistentVolumeClaim (PVC) | Es una petición o "reclamo" de almacenamiento por parte de un usuario o aplicación. Especifica tamaño, modos de acceso y clase de almacenamiento, pero no se preocupa por dónde está el disco físico. | Desarrollador (Consumo). Este es el manifiesto que el grupo debe escribir para el despliegue de la tarea. |
| StorageClass (SC) | Define el "tipo" de almacenamiento (SSD, HDD rápido, replicado) y contiene el provisioner encargado de crear los PV de forma automática cuando aparece un PVC. | Aprovisionamiento Dinámico. El clúster kind ya trae una StorageClass llamada standard por defecto. |

### Aprovisionamiento Dinámico y el Ciclo de Vida del Volumen

Para evitar que los equipos de infraestructura tengan que crear discos físicos a mano (Aprovisionamiento Estático), los entornos modernos (incluyendo kind) utilizan Aprovisionamiento Dinámico. El ciclo vital exacto que ocurrirá en el proyecto es el siguiente:

Declaración: El equipo aplica un manifiesto YAML de tipo PersistentVolumeClaim pidiendo 1 Gigabyte de espacio.

Creación (Provisioning): La StorageClass de kind intercepta la solicitud, va al sistema de archivos del contenedor de Docker (el nodo virtual) y reserva una carpeta real asignándole la cuota de 1GB. Inmediatamente crea un objeto PersistentVolume en la API de Kubernetes para representar este espacio.

Enlace (Binding): El Control Plane de Kubernetes encuentra que el nuevo PV coincide con los requerimientos del PVC y los enlaza de forma exclusiva (relación 1 a 1). El PVC pasa de estado Pending a Bound.

Consumo (Using): El Pod de PostgreSQL se programa en el nodo, monta el volumen en el directorio de su base de datos y comienza a escribir los datos de los usuarios y reservas.

#### Reclaim Policies

¿Qué sucede con los datos si un desarrollador elimina el manifiesto PVC (kubectl delete pvc postgres-pvc)? Esto depende de la Reclaim Policy del volumen físico subyacente.

Retain: El PV pasa a estado Released, pero los datos se conservan. Requiere limpieza manual.

Delete (Por defecto en aprovisionamiento dinámico): Si se elimina el PVC, el volumen físico se borra de forma destructiva e irrecuperable. Advertencia para la tarea: Si se aplican cambios destructivos en el manifiesto PVC, se perderán las tablas y datos del PostgreSQL de prueba.

### Access Modes

Al solicitar almacenamiento, el PVC debe especificar cómo los Pods interactuarán con el disco. No todos los discos físicos soportan todos los modos. La documentación define tres modos principales:

| Modo de Acceso | Acrónimo | Caso de Uso en Sistemas Distribuidos |
| --- | --- | --- |
| ReadWriteOnce | RWO | El volumen puede ser montado como lectura/escritura por un único Nodo a la vez. Este es el modo estricto y obligatorio para motores de bases de datos relacionales (como PostgreSQL o MySQL), ya que garantizan la consistencia de los bloqueos a nivel de archivo (file locks) para prevenir corrupción transaccional. |
| ReadOnlyMany | ROX | El volumen se monta como solo lectura por múltiples Nodos simultáneamente. Ideal para servir recursos estáticos (HTML/CSS, configuraciones compartidas). |
| ReadWriteMany | RWX | El volumen se monta como lectura/escritura por múltiples Nodos. Requiere sistemas de archivos de red especializados (NFS, CephFS). Nunca debe usarse para un PostgreSQL tradicional. |

### Correspondencia Arquitectónica: Compose a Kubernetes

Para demostrar la asimilación del conocimiento del módulo, el grupo debe mapear el concepto de volumes del docker-compose.yml hacia los manifiestos YAML puros de la nube.

El requerimiento en Docker Compose:

services:  postgres-db:    image: postgres:15    volumes:      - postgres_data:/var/lib/postgresql/data # <-- Montaje de volumen nombradovolumes:  postgres_data: # <-- Declaración del volumen global

En Kubernetes, esta simple abstracción de 4 líneas se separa en dos recursos arquitectónicos independientes, aislando la solicitud de hardware de la plantilla de computación.

### Implementación Práctica: PostgreSQL en la Tarea Corta

Para el proyecto, se deberán versionar dos archivos (o dos documentos separados por ---) en la carpeta base/ de Kustomize para levantar la base de datos de forma persistente.

#### Manifiesto 1: La Reclamación (PersistentVolumeClaim)

apiVersion: v1kind: PersistentVolumeClaimmetadata:  name: postgres-pvc  labels:    app: postgres-dbspec:  accessModes:    - ReadWriteOnce    # Crítico para PostgreSQL  resources:    requests:      storage: 1Gi     # Solicitud de 1 Gigabyte de espacio  # Al no especificar 'storageClassName', Kubernetes usará el default del clúster ('standard' en kind)

#### Manifiesto 2: El Consumo (Deployment)

El Pod de la base de datos necesita "montar" el volumen lógico (PVC) en la ruta del sistema de archivos físico interno donde PostgreSQL almacena sus tablas y esquemas binarios (PGDATA).

apiVersion: apps/v1kind: Deploymentmetadata:  name: postgres-deploymentspec:  replicas: 1  selector:    matchLabels:      app: postgres-db  template:    metadata:      labels:        app: postgres-db    spec:      containers:      - name: postgres        image: postgres:15        env:          # Las credenciales deben venir de un Secret en K8s, pero se muestran directo por brevedad          - name: POSTGRES_USER            value: "admin"          - name: POSTGRES_PASSWORD            value: "admin123"          - name: POSTGRES_DB            value: "tarea_corta"        ports:        - containerPort: 5432                # 2. El contenedor monta el volumen interno definido abajo en la ruta oficial de Postgres        volumeMounts:        - name: storage-vol          mountPath: /var/lib/postgresql/data      # 1. Definición del volumen a nivel de Pod, mapeando al PVC creado anteriormente      volumes:      - name: storage-vol        persistentVolumeClaim:          claimName: postgres-pvc

### Comportamiento Crítico en Clústeres Locales (`kind`)

La evaluación de la Tarea Corta verificará que los datos persistan a un reinicio. Es imperativo entender la frontera técnica de esta comprobación.

Sobrevivir a la muerte del Pod (Éxito): Si se ejecuta kubectl delete pod -l app=postgres-db, el Deployment Controller levantará un nuevo Pod inmediatamente. El nuevo Pod volverá a enlazar el PVC, montará los archivos en /var/lib/postgresql/data y los registros previos seguirán intactos, demostrando el éxito del almacenamiento persistente disociado.

Destrucción del Clúster (Pérdida Esperada): El comando kind delete cluster destruye el contenedor anfitrión que simula los nodos. Dado que el aprovisionador standard de kind utiliza local-path (el disco interno del contenedor de Docker de kind), destruir el clúster conlleva la destrucción física de los PersistentVolumes. Esto es esperado y no constituye un fallo en la implementación de los PVC, ya que replica el concepto de destruir una instancia física completa en la nube (ej. destruir toda la región de AWS).

### Troubleshooting (Resolución de Conflictos de Volumen)

Si durante el despliegue la base de datos se atasca en estado "Pending" o "CrashLoopBackOff", el equipo debe revisar los siguientes indicadores:

| Síntoma en Consola (kubectl get pods) | Causa Raíz Arquitectónica | Comando de Diagnóstico |
| --- | --- | --- |
| Pod en estado Pending | El Pod no puede programarse en el nodo porque el PVC asociado nunca se vinculó (Binding) a un volumen físico, posiblemente por falta de espacio o un error tipográfico en claimName. | kubectl describe pvc postgres-pvc |
| CrashLoopBackOff | El volumen se montó correctamente, pero los permisos del sistema de archivos no permiten que el usuario interno de PostgreSQL escriba en la ruta, generando un FATAL: data directory is not writable. | kubectl logs <nombre-del-pod-postgres> |


### Configuración de Kubernetes relacionados con APIs

Kubernetes provee 2 kinds principales que podemos usar para guardar la configuración, configMap y Secret


#### ConfigMaps

Este es un objeto de la API usado para guardar datos no confidenciales en pares de llaves. Los Pods pueden consumir ConfigMaps como variables de entorno, argumentos de línea de comandos o archivos de configuración en un volumen


Te permite desacoplar configuraciones específicas del entorno desde tus imágenes del contenedor, para que las aplicaciones puedan ser más fáciles de portar


#### Secrets

Un Secret es un objeto que contiene una cantidad de información confidencial, como contraseñas


Muy parecidos a los ConfigMaps, pero para secretos xd


### Configuración vía contenedores sidecar o init

Esto resulta útil si ya dispone de algún medio, ajeno a Kubernetes, para almacenar configuraciones, claves de seguridad u otra información que sus contenedores deban utilizar, pero que no convenga incluir en las imágenes de los contenedores.


#### Sidecar

Un contenedor auxiliar de configuración de tipo sidecar se ejecuta en el mismo Pod que el contenedor de la aplicación; por lo tanto, cada Pod cuenta con su propio sidecar. Un sidecar de configuración típico obtiene los datos de configuración a través de la red del Pod y, a continuación, los escribe en un volumen montado en ambos contenedores.


Existen muchas variantes de este patrón básico, pero todas comparten el principio de utilizar un contenedor auxiliar que escribe la configuración para que el contenedor de la aplicación la consuma.

#### Init

Los Pods pueden incluir contenedores de inicialización que se ejecutan antes de la aplicación principal. A diferencia de los sidecar, los contenedores de inicialización finalizan su ejecución antes de que arranquen los contenedores principales (de aplicación) del Pod; de este modo, la configuración se establece una sola vez.


Existen dos opciones principales para realizar la configuración mediante contenedores de inicialización:

#### Configuración a través del sistema de archivos

Con esta opción, el contenedor de inicialización obtiene la configuración y la escribe en uno o varios archivos, generalmente en un volumen local del Pod.

#### Configuración mediante variables de entorno

Este método utiliza un volumen local, pero dicho volumen es montado únicamente por el contenedor de inicialización


### Liveness Probe

De acuerdo con la documentación oficial, muchas aplicaciones que se ejecutan durante largos periodos de tiempo eventualmente transicionan a estados rotos (como un interbloqueo o "deadlock"), de los cuales no pueden recuperarse a menos que se reinicien. Kubernetes proporciona los liveness probes para detectar y remediar estas situaciones.

Definición con petición HTTP (httpGet): Para realizar la prueba, el kubelet envía una petición HTTP GET al servidor que se ejecuta dentro del contenedor y escucha en un puerto específico.

Criterios de Éxito: Si el manejador de la ruta retorna un código de estado mayor o igual a 200 y menor que 400, el kubelet considera que el contenedor está vivo y saludable.

Criterios de Fallo: Si se retorna un código de error (como un 500 o 503) o si no se puede establecer la conexión, se considera un fallo. Tras superar el límite de fallos permitidos, el kubelet mata el contenedor y lo reinicia.

Aplicación en la Tarea: Este mecanismo modela perfectamente el endpoint de comprobación de vida (/health), el cual debe responder 200 sin tocar la base de datos para indicar que el proceso está en funcionamiento y evitar reinicios innecesarios.

### 2. Readiness Probe

La configuración para un HTTP readiness probe es idéntica en estructura a la del liveness probe. Sin embargo, su comportamiento y propósito cambian radicalmente. Los readiness probes se utilizan para evitar que el tráfico llegue a un contenedor que aún no está preparado para procesarlo.

Propósito Principal: Si la prueba de disponibilidad falla, el kubelet no reinicia el contenedor; simplemente establece la condición de Ready del Pod en falso, sacándolo del enrutamiento de tráfico de los Services temporalmente.

Uso Conjunto: Liveness y Readiness probes se pueden usar en paralelo. Utilizar ambos garantiza que el tráfico no llegue a un contenedor que no está listo, y a la vez asegura que los contenedores atascados se reinicien.

Aplicación en la Tarea: Se corresponde exactamente con el endpoint /ready, el cual debe verificar la conexión con PostgreSQL. Si la base de datos no está disponible, el endpoint devuelve 503, causando que la prueba falle. Gracias a esto, se cumple el requerimiento de no dar por lista la aplicación antes de que su dependencia de arranque esté operativa.

### Parámetros de Control (Probe Fields)

Kubernetes permite controlar con precisión el comportamiento de estas comprobaciones a través de la asignación de campos numéricos:

| Campo | Descripción y Valores de Configuración |
| --- | --- |
| initialDelaySeconds | Cantidad de segundos a esperar desde que el contenedor inicia hasta que se ejecutan los primeros probes. Valor por defecto: 0. Mínimo: 0. |
| periodSeconds | Frecuencia con la que se ejecuta la prueba. Valor por defecto: 10 segundos. Mínimo: 1. |
| timeoutSeconds | Número de segundos después de los cuales el probe se considera caducado (timeout). Valor por defecto: 1 segundo. Mínimo: 1. |
| successThreshold | Mínimo de éxitos consecutivos para que la prueba se considere exitosa tras un fallo. Debe ser obligatoriamente 1 para Liveness. Mínimo: 1. |
| failureThreshold | Si el probe falla este número de veces consecutivas, se declara el estado de fallo (reinicia si es Liveness, o quita la etiqueta Ready si es Readiness). Valor por defecto: 3. Mínimo: 1. |


### Estructura del Nodo httpGet

El nodo httpGet permite las siguientes especificaciones principales al declarar un probe:

path: La ruta de acceso del servidor HTTP que procesará la solicitud.

port: Nombre o número de puerto en el que escucha el contenedor (rango válido de 1 a 65535).

host: Nombre del host al que conectarse, por defecto apunta a la IP del Pod.

scheme: Esquema a utilizar para la conexión (HTTP o HTTPS). Por defecto es HTTP.

httpHeaders: Lista que permite inyectar encabezados personalizados (Headers) a la petición en caso de ser necesario.

### Aplicación Práctica: YAML para el Deployment

Aplicando esta investigación al manifiesto de Deployment de la aplicación en el clúster local, la configuración recomendada quedaría estructurada de la siguiente forma:

# Dentro de la especificación del container en el Deployment:livenessProbe:  httpGet:    path: /health    port: 8080 # Ajustar al puerto del servicio  initialDelaySeconds: 5  periodSeconds: 10  failureThreshold: 3readinessProbe:  httpGet:    path: /ready    port: 8080 # Ajustar al puerto del servicio  initialDelaySeconds: 10 # Tiempo mayor para asegurar que BD conecte  periodSeconds: 10  failureThreshold: 3

Con esta configuración, el sistema cumple a cabalidad con la correspondencia de rutas y las comprobaciones ordenadas que validarán las herramientas en Kubernetes.


## Tema 7. Kustomize (Base y Overlays)


### Composición de Manifiestos sin Plantillas

A diferencia de herramientas como Helm, que dependen de lenguajes de plantillas, Kustomize opera bajo un enfoque completamente declarativo y nativo. Su filosofía se basa en dejar intactos los archivos YAML originales (la "base") y aplicar capas de personalización sobre ellos.

YAML Puro: Utiliza exclusivamente especificaciones estándar de Kubernetes. No requiere aprender una sintaxis de plantillas compleja.

Nativo en kubectl: Kustomize está integrado en Kubernetes desde la versión 1.14. Se invoca directamente utilizando comandos nativos como kubectl apply -k.

Reusabilidad: Permite utilizar la misma configuración para múltiples entornos (desarrollo, pruebas, producción) inyectando únicamente las diferencias, lo que garantiza una separación clara de responsabilidades (separation of concerns).

### El archivo kustomization.yaml

El archivo kustomization.yaml actúa como el punto de entrada y el núcleo operativo de Kustomize. Define qué recursos originales deben incluirse en el ensamblaje final y qué transformaciones o parches deben aplicarse sobre ellos.

resources: Lista de archivos YAML locales (o repositorios externos) que componen la arquitectura base.

bases: Apunta a otros directorios que contienen su propio archivo kustomization.

patches (o patchesStrategicMerge): Referencias a archivos que contienen modificaciones específicas (como cambiar réplicas o inyectar variables de entorno) sobre los recursos declarados.

### Arquitectura Base y Overlays

Para cumplir con los requerimientos de modularidad y despliegue local (como en kind), Kustomize utiliza un sistema de jerarquía de directorios que divide la configuración en "Base" y "Overlays".

| Capa de Configuración | Rol y Contenido Principal |
| --- | --- |
| Carpeta base/ | Contiene los manifiestos inmutables y comunes a todos los despliegues (Deployment, Service, PVC). Incluye un kustomization.yaml que unifica estos recursos puros sin valores de entorno específicos. |
| Carpeta overlays/ | Subdirectorios para cada variante (ej. dev, prod, local-kind). Cada overlay tiene su propio kustomization.yaml que referencia a la capa base y aplica modificaciones puntuales, evitando la duplicidad de archivos YAML. |


### Aplicación Práctica: Resolución para el Módulo de Kubernetes

En la Tarea Corta 1, se exige explícitamente no duplicar manifiestos y aplicar un cambio real mediante un overlay (por ejemplo, el número de réplicas o el tag de la imagen). A continuación, se presenta la estructura ideal validada por Kustomize para este escenario:

# 1. Estructura de directorios recomendadak8s/├── base/│   ├── deployment.yaml      # Manifiesto original de la aplicación│   ├── postgresql.yaml      # Manifiesto de PostgreSQL│   ├── service.yaml         # Services (Aplicación y BD)│   └── kustomization.yaml   # Declara 'resources: [deployment.yaml, ...]'└── overlays/    └── local/               # Overlay para el clúster local        ├── kustomization.yaml         └── patch-replicas.yaml # Contiene el cambio específico

El archivo kustomization.yaml dentro de overlays/local/ logrará el requisito integrando los recursos base y aplicando los parches:

apiVersion: kustomize.config.k8s.io/v1beta1kind: Kustomizationresources:  - ../../base# Sobrescribir directamente el tag de la imagen usando transformers integradosimages:  - name: servicio-http    newTag: v1.0.0-local# Aplicar parche para aumentar réplicas o ajustar configuraciónpatches:  - path: patch-replicas.yaml

De esta forma, al documentar el despliegue, basta con indicar el comando kubectl apply -k k8s/overlays/local para levantar la infraestructura completa en kind con las modificaciones reales, conservando el puntaje completo en el criterio de no duplicidad de manifiestos.


### Conceptos Fundamentales: Gestión Declarativa

De acuerdo con la documentación de Kubernetes, Kustomize permite a los usuarios gestionar múltiples configuraciones de aplicaciones de forma declarativa. En lugar de utilizar motores de plantillas (templating) que alteran la pureza de los archivos YAML mediante variables inyectadas (como ocurre en Helm), Kustomize adopta un paradigma de "parches" (patching) y "fusión" (merging). Esto significa que los manifiestos base siempre mantienen su validez estructural como recursos puros de Kubernetes.

La principal ventaja de este enfoque es la separación de preocupaciones (Separation of Concerns). Los desarrolladores definen una única "fuente de verdad" (la Base) para la arquitectura de la aplicación, y luego definen variaciones específicas del entorno (los Overlays) que aplican mutaciones controladas sobre esa base. Esto resulta vital para proyectos donde se despliega la misma aplicación en un entorno de desarrollo, pruebas (o un clúster local como kind) y producción.

### Estructura de Directorios: La Base y los Overlays

Kustomize se basa en el sistema de archivos para inferir la relación entre los manifiestos. Un proyecto de Kustomize bien estructurado se divide físicamente en dos áreas principales. Esta topología garantiza que el criterio de "no duplicidad de código" se cumpla a cabalidad.

| Componente Arquitectónico | Definición y Propósito en el Despliegue |
| --- | --- |
| Base (Carpeta base/) | Un directorio que contiene un archivo kustomization.yaml y un conjunto de recursos de Kubernetes estándar (Deployment, Service, PVC, etc.). La base no tiene conocimiento de los entornos que la consumen. Debe ser agnóstica; es decir, no debe contener variables de entorno específicas de producción ni configuraciones de réplicas masivas. Representa la topología mínima viable de la aplicación. |
| Overlay (Carpeta overlays/) | Un directorio que también contiene su propio kustomization.yaml. Su propósito exclusivo es referenciar a una Base y declarar sobreescrituras (overrides) o parches (patches). Cada overlay representa un entorno de despliegue único (ej. overlays/local/ para la tarea). Modifica el estado final sin tocar los archivos de la Base. |


### Composición de la Carpeta base/

Para construir la base solicitada en la Tarea Corta 1, se deben agrupar los manifiestos que modelan el estado funcional del servicio HTTP y la base de datos PostgreSQL. El archivo kustomization.yaml en la carpeta base actúa como un índice (manifest registry) que simplemente carga los recursos estáticos.

#### Ejemplo Práctico: El Manifiesto Base

Supongamos que tenemos los siguientes archivos en la carpeta base/:

deployment-app.yaml: Define el Pod del servicio HTTP.

service-app.yaml: Expone el servicio HTTP.

statefulset-db.yaml: Define PostgreSQL.

service-db.yaml: Expone la base de datos a la aplicación.

El archivo base/kustomization.yaml se vería de la siguiente manera:

# base/kustomization.yamlapiVersion: kustomize.config.k8s.io/v1beta1kind: Kustomizationresources:  - deployment-app.yaml  - service-app.yaml  - statefulset-db.yaml  - service-db.yaml# Se pueden definir etiquetas comunes que se inyectarán a todos los recursos:commonLabels:  app.kubernetes.io/part-of: tarea-corta-1

Observe que la Base no define cuántas réplicas se ejecutarán en producción ni inyecta contraseñas. Solo define la topología inmutable de la aplicación.

### Composición de Overlays: Personalización del Despliegue

El módulo de orquestación exige que los grupos apliquen "algo real" usando Kustomize (modificar réplicas, tag de imagen, o variables) en un clúster local kind. Aquí es donde entra en juego la carpeta overlays/local-kind/.

Dentro de este overlay, el kustomization.yaml importa la base y utiliza las capacidades nativas de Kustomize para modificar el manifiesto al vuelo durante el proceso de aplicación.

#### Modificación de Réplicas

Una de las tareas más comunes es escalar horizontalmente la aplicación dependiendo del entorno. Kustomize incluye un directiva nativa llamada replicas que simplifica esto sin necesidad de escribir un parche complejo en YAML.

# overlays/local-kind/kustomization.yamlapiVersion: kustomize.config.k8s.io/v1beta1kind: Kustomizationresources:  - ../../base# Sobrescribir el número de réplicas del deployment de la aplicaciónreplicas:  - name: servicio-http-deployment # Debe coincidir con el metadata.name del deployment    count: 3

#### Modificación de Variables de Entorno (ConfigMap Generators)

Para manejar las configuraciones externalizadas (como credenciales y configuraciones de la base de datos PostgreSQL), Kustomize ofrece la directiva configMapGenerator y secretGenerator. Esta es la forma recomendada en la documentación para gestionar las variables desde los overlays en lugar de hardcodearlas en la base.

# overlays/local-kind/kustomization.yamlapiVersion: kustomize.config.k8s.io/v1beta1kind: Kustomizationresources:  - ../../baseconfigMapGenerator:  - name: app-config    literals:      - DB_HOST=postgres-service      - DB_NAME=tareacorta1dbsecretGenerator:  - name: app-secrets    literals:      - DB_PASSWORD=secreto_seguro_local # Solo para entorno local

#### Modificación del Tag de la Imagen

En un flujo de desarrollo continuo, los tags de las imágenes de Docker cambian frecuentemente. Kustomize permite actualizar el nombre de la imagen o su etiqueta (tag) dinámicamente mediante el campo images. Esto resulta sumamente útil para la tarea, ya que permite apuntar a una imagen construida localmente para el clúster de kind.

# overlays/local-kind/kustomization.yamlapiVersion: kustomize.config.k8s.io/v1beta1kind: Kustomizationresources:  - ../../baseimages:  - name: my-registry/servicio-http # El nombre original usado en la base    newName: localhost:5000/servicio-http # Nuevo repositorio si aplica    newTag: v1.0.0-kind-local # Nueva etiqueta para la evaluación

### Strategic Merge Patches (Parches Estratégicos)

Si las directivas nativas (como replicas o images) no son suficientes, la documentación de Kubernetes expone el uso de Strategic Merge Patches. Estos parches permiten alterar cualquier nodo específico de un manifiesto de la base. Se define un archivo YAML parcial en el overlay, y Kustomize lo "fusiona" con el original basándose en el nombre y tipo del recurso.

Paso 1: Crear el archivo de parche en el overlay (ej. patch-resources.yaml)

# overlays/local-kind/patch-resources.yamlapiVersion: apps/v1kind: Deploymentmetadata:  name: servicio-http-deploymentspec:  template:    spec:      containers:        - name: servicio-http          resources:            limits:              memory: "512Mi"              cpu: "500m"

Paso 2: Declarar el parche en el Kustomization del overlay

# overlays/local-kind/kustomization.yamlpatchesStrategicMerge:  - patch-resources.yaml

### Aplicación y Verificación en el Clúster

Una vez que la arquitectura jerárquica de base/ y overlays/local-kind/ está ensamblada, no es necesario instalar herramientas externas adicionales. Kubernetes incluye Kustomize en su CLI principal.

Verificación (Renderizado en seco): Antes de aplicar, se recomienda compilar los manifiestos para revisar el resultado final de la fusión. Se utiliza el comando:kubectl kustomize overlays/local-kind/Este comando imprimirá en la consola el YAML resultante con todas las réplicas, variables y etiquetas modificadas, permitiendo auditar la salida.

Despliegue directo al clúster: Para aplicar la infraestructura completa orquestada al clúster de kind (cumpliendo con la restricción de arrancar el sistema con facilidad), se ejecuta:kubectl apply -k overlays/local-kind/

# Frida 🐶— Repetición Espaciada Minimalista

Frida es un clon moderno, intuitivo y estéticamente agradable de Anki enfocado en la repetición espaciada. Está construido para uso personal y para compartir con amigos, con un diseño basado en tonos lavanda relajantes, animaciones fluidas y una experiencia de usuario sin distracciones.

## 🚀 Tecnologías Utilizadas

- **Electron**: Para crear la aplicación de escritorio nativa.
- **React**: Biblioteca para construir la interfaz de usuario interactiva.
- **Vite**: Empaquetador ultra-rápido para el desarrollo y producción.
- **Tailwind CSS**: Estilizado moderno y flexible con una paleta lavanda personalizada.
- **Lucide React**: Biblioteca de iconos limpios y minimalistas.

---

## 📂 Estructura del Proyecto

El código está organizado de la siguiente manera:

```text
frida/
├── main/                   # Proceso principal de Electron
│   ├── main.js             # Ventana, persistencia JSON local e IPCs
│   └── preload.js          # Puente seguro entre Electron y React
├── src/                    # Proceso de renderizado (React)
│   ├── assets/             # Recursos estáticos (Logo, imágenes, etc.)
│   ├── components/         # Componentes visuales reutilizables
│   │   ├── DeckList.jsx    # Visualización de la cuadrícula de mazos
│   │   ├── Flashcard.jsx   # Tarjeta con animación 3D de volteo (Flip)
│   │   └── StudySession.jsx# Lógica de la sesión de estudio actual
│   ├── hooks/              # Hooks personalizados
│   │   └── useSpacedRepetition.js # Estado global, CRUD e IPCs
│   ├── screens/            # Pantallas completas
│   │   ├── HomeScreen.jsx  # Dashboard con estadísticas y creación de mazos
│   │   ├── CreateCardScreen.jsx # Creador de tarjetas con vista previa y borrado
│   │   └── StudyScreen.jsx # Contenedor enfocado de estudio
│   ├── utils/              # Funciones puras de lógica
│   │   └── sm2.js          # Implementación del algoritmo SM-2
│   ├── App.jsx             # Enrutador y coordinador principal
│   ├── index.css           # Estilos globales y utilidades 3D
│   └── main.jsx            # Punto de entrada de React
├── package.json            # Dependencias y scripts de ejecución
├── tailwind.config.js      # Configuración del tema de colores lavanda
├── postcss.config.js       # Configuración de PostCSS
└── vite.config.js          # Configuración de Vite para Electron (base: './')
```

---

## ⚙️ Algoritmo de Repetición Espaciada (SM-2 Simplificado)

Frida utiliza una versión optimizada del algoritmo **SuperMemo 2** adaptada a un flujo de 3 opciones:

1. **Difícil** (Atajo: `1`): El recuerdo falló o costó mucho. El contador de repeticiones consecutivas se reinicia a `0`, el intervalo vuelve a ser de `1` día, y el factor de facilidad (`easeFactor`) disminuye.
2. **Bien** (Atajo: `2`): Se recordó con normalidad. Se incrementa el contador de repeticiones y el intervalo se multiplica por el factor de facilidad actual. El factor de facilidad se mantiene estable.
3. **Fácil** (Atajo: `3`): Recuerdo instantáneo. Se incrementa el contador de repeticiones, el intervalo se escala con un factor de bonificación, y el factor de facilidad aumenta.

El factor de facilidad nunca desciende de `1.3` para evitar bloqueos de estudio perpetuos. Las fechas de revisión se truncan a las `00:00:00` locales para permitir repasar en cualquier momento del día calendario en el que vence la tarjeta.

---

## 🎮 Atajos de Teclado (Durante el Estudio)

- **Barra Espaciadora**: Voltear la tarjeta para mostrar/ocultar el reverso.
- **Tecla 1**: Calificar como **Difícil**.
- **Tecla 2**: Calificar como **Bien**.
- **Tecla 3**: Calificar como **Fácil**.

---

## 🛠️ Cómo Ejecutar el Proyecto

Sigue estos pasos en tu terminal para correr Frida localmente:

### 1. Instalar Dependencias
Instala los paquetes de Node.js necesarios:
```bash
npm install
```

### 2. Iniciar en Modo de Desarrollo
Ejecuta el servidor de desarrollo de Vite y lanza Electron en paralelo con:
```bash
npm run dev
```

### 3. Compilar el Frontend para Producción
Para compilar los recursos de producción listos para empaquetarse:
```bash
npm run build
```

---

## 💾 Persistencia de Datos
Los mazos y tarjetas se guardan automáticamente en tu carpeta local de datos de usuario de la aplicación en un archivo JSON llamado `frida-data.json`. Esto evita la necesidad de configurar bases de datos complejas al iniciar la aplicación.
* La ruta del archivo en Windows suele ser: `C:\Users\<Usuario>\AppData\Roaming\frida\frida-data.json`.

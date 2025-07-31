# PNG a WebP - Convertidor de Imágenes

Una herramienta web simple y moderna para convertir imágenes PNG a formato WebP con un solo clic.

## 🚀 Características

- **Conversión rápida**: Convierte PNG a WebP con calidad optimizada (80%)
- **Vista previa**: Muestra una thumbnail de la imagen PNG antes de convertir
- **Metadata completa**: Información detallada del archivo (nombre, peso, dimensiones)
- **Gestión de archivos**: Ocultar input cuando hay imagen seleccionada y botón para eliminar
- **Interfaz limpia**: Ocultar input de archivo después de la conversión para enfocar en el resultado
- **Comparación de tamaños**: Muestra la reducción de tamaño después de la conversión
- **Vista previa del resultado**: Muestra la imagen WebP convertida antes de descargar
- **Botones de acción duales**: Descarga y opción para convertir otra imagen
- **Interfaz moderna**: Diseño minimalista con modo oscuro por defecto
- **Procesamiento local**: Todo el procesamiento ocurre en el servidor, sin dependencias externas
- **Descarga directa**: Descarga automática del archivo convertido
- **Validación de archivos**: Solo acepta archivos PNG válidos
- **Responsive**: Funciona perfectamente en dispositivos móviles y desktop

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Procesamiento de imágenes**: Sharp
- **Gestión de paquetes**: pnpm

## 📦 Instalación

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd imgtowebp
```

2. Instala las dependencias:

```bash
pnpm install
```

3. Ejecuta el servidor de desarrollo:

```bash
pnpm dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 🎯 Uso

1. **Sube tu imagen PNG**: Haz clic en el botón de selección de archivo
2. **Selecciona un archivo PNG**: Solo se aceptan archivos PNG válidos
3. **Revisa la vista previa**: Se mostrará una thumbnail de tu imagen con información detallada
4. **Cambiar imagen**: Si quieres usar otra imagen, haz clic en el botón de eliminar (🗑️) y selecciona una nueva
5. **Convierte**: Haz clic en "Convertir a WebP"
6. **Revisa el resultado**: Ve la comparación de tamaños y la vista previa de la imagen WebP
7. **Descarga o convierte otra**: Descarga tu imagen WebP o convierte otra imagen

## 🔧 API

La aplicación incluye una API REST en `/api/convert`:

- **Método**: POST
- **Formato**: multipart/form-data
- **Campo**: `image` (archivo PNG)
- **Respuesta**: Archivo WebP con Content-Type: `image/webp`

### Ejemplo de uso de la API:

```bash
curl -X POST -F "image=@tu-imagen.png" http://localhost:3000/api/convert -o convertida.webp
```

## 📁 Estructura del Proyecto

```
imgtowebp/
├── app/
│   ├── api/
│   │   └── convert/
│   │       └── route.ts          # API para conversión
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página principal
├── public/                       # Archivos estáticos
├── package.json                  # Dependencias
└── README.md                     # Documentación
```

## 🎨 Características de Diseño

- **Modo oscuro por defecto**: Interfaz moderna y fácil para los ojos
- **Diseño centrado**: Layout centrado con máximo ancho de 576px
- **Espaciado generoso**: Paddings y márgenes amplios para mejor UX
- **Transiciones suaves**: Animaciones moderadas para una experiencia fluida
- **Responsive**: Adaptable a todos los tamaños de pantalla

## 📊 Información de Metadata

La aplicación muestra información detallada de cada imagen PNG:

- **Nombre del archivo**: Nombre completo del archivo seleccionado
- **Extensión**: Formato del archivo (PNG)
- **Peso**: Tamaño del archivo en KB o MB (en negrita)
- **Dimensiones**: Ancho y alto en píxeles
- **Tamaño**: Resolución completa en formato "ancho × alto" (en negrita)

La metadata se muestra a la derecha de la vista previa en dispositivos medianos y grandes, y debajo en dispositivos móviles.

## 🧹 Interfaz Limpia

La aplicación optimiza la experiencia visual ocultando elementos innecesarios:

- **Input condicional**: El campo de selección de archivo se oculta automáticamente después de la conversión
- **Enfoque en resultados**: Una vez convertida la imagen, la interfaz se centra en mostrar el resultado
- **Reducción de distracciones**: Elimina elementos que ya no son relevantes para el usuario
- **Flujo visual claro**: Guía la atención del usuario hacia las acciones disponibles (descargar o convertir otra)

## 🎯 Botones de Acción

Después de la conversión, la aplicación presenta dos opciones claras:

- **Descargar WebP**: Botón verde con icono de descarga para guardar la imagen convertida
- **Convertir otra imagen**: Botón azul con icono de "+" para reiniciar el flujo completo
- **Layout horizontal**: Ambos botones se muestran lado a lado con espaciado uniforme
- **Reinicio completo**: Al hacer clic en "Convertir otra imagen" se limpian todos los estados

## 📊 Comparación de Tamaños

Después de la conversión, la aplicación muestra una comparación visual prominente:

- **Tamaños grandes**: Los pesos se muestran en texto grande (text-3xl) para máxima visibilidad
- **Layout centrado**: Diseño centrado con espaciado generoso entre elementos
- **Etiquetas descriptivas**: "Archivo original" y "Archivo WebP" para claridad
- **Flecha de transición**: Icono de flecha más grande (w-8 h-8) para mostrar la conversión
- **Colores diferenciados**:
  - Archivo original: Gris (text-gray-700)
  - Archivo WebP: Verde (text-green-600) para destacar la optimización
- **Cálculo automático**: Se calcula automáticamente en KB o MB según corresponda

### 📈 Estadísticas de Reducción

Debajo de la comparación principal se muestran estadísticas detalladas:

- **Porcentaje de reducción**: Calculado automáticamente y mostrado en verde
  - **Formato inteligente**: Muestra al menos 1 dígito y hasta 2 decimales
  - **Ejemplos**: "80.0%" para valores ≥ 10, "5.25%" para valores < 10
- **Peso ahorrado**: Cantidad absoluta de espacio ahorrado (KB o MB)
- **Separador visual**: Línea divisoria que separa la comparación de las estadísticas
- **Texto más pequeño**: Estadísticas en `text-lg` para jerarquía visual
- **Etiquetas descriptivas**: "Reducción" y "Ahorrado" para claridad

## 📁 Gestión de Archivos

La aplicación incluye una gestión inteligente de archivos:

- **Input condicional**: El campo de selección de archivo se oculta automáticamente cuando hay una imagen seleccionada
- **Indicador visual**: Cuando hay un archivo seleccionado, se muestra un indicador con:
  - Icono de imagen
  - Nombre del archivo
  - Tipo de archivo (PNG)
- **Botón de eliminar**: Icono de papelera (🗑️) para eliminar la imagen actual
- **Reinicio completo**: Al eliminar, se limpian todos los estados (preview, metadata, resultado)
- **Nueva selección**: Después de eliminar, el input de archivo vuelve a aparecer
- **Botón condicional**: El botón "Convertir a WebP" solo aparece cuando hay un archivo seleccionado

## 🚀 Despliegue

La aplicación está lista para desplegar en Vercel, Netlify o cualquier plataforma que soporte Next.js:

```bash
pnpm build
pnpm start
```

## 📝 Licencia

MIT License - Libre para uso personal y comercial.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias y mejoras.

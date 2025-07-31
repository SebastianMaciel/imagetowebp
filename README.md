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

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Usage

1. **Upload your PNG image**: Click on the file selection button
2. **Select a PNG file**: Only valid PNG files are accepted
3. **Review the preview**: A thumbnail of your image will be shown with detailed information
4. **Change image**: If you want to use another image, click the delete button (🗑️) and select a new one
5. **Convert**: Click "Convert to WebP"
6. **Review the result**: See the size comparison and WebP image preview
7. **Download or convert another**: Download your WebP image or convert another image

## 🔧 API

The application includes a REST API at `/api/convert`:

- **Method**: POST
- **Format**: multipart/form-data
- **Field**: `image` (PNG file)
- **Response**: WebP file with Content-Type: `image/webp`

### API usage example:

```bash
curl -X POST -F "image=@your-image.png" http://localhost:3000/api/convert -o converted.webp
```

## 📁 Project Structure

```
imgtowebp/
├── app/
│   ├── api/
│   │   └── convert/
│   │       └── route.ts          # Conversion API
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Main layout
│   └── page.tsx                  # Main page
├── public/                       # Static files
├── package.json                  # Dependencies
└── README.md                     # Documentation
```

## 🎨 Design Features

- **Dark mode by default**: Modern interface that's easy on the eyes
- **Centered design**: Centered layout with maximum width of 576px
- **Generous spacing**: Wide paddings and margins for better UX
- **Smooth transitions**: Moderate animations for a fluid experience
- **Responsive**: Adaptable to all screen sizes

## 📊 Metadata Information

The application shows detailed information for each PNG image:

- **File name**: Full name of the selected file
- **Extension**: File format (PNG)
- **Weight**: File size in KB or MB (in bold)
- **Dimensions**: Width and height in pixels
- **Size**: Complete resolution in "width × height" format (in bold)

The metadata is shown to the right of the preview on medium and large devices, and below on mobile devices.

## 🧹 Clean Interface

The application optimizes the visual experience by hiding unnecessary elements:

- **Conditional input**: The file selection field is automatically hidden after conversion
- **Focus on results**: Once the image is converted, the interface focuses on showing the result
- **Reduced distractions**: Removes elements that are no longer relevant to the user
- **Clear visual flow**: Guides the user's attention to available actions (download or convert another)

## 🎯 Action Buttons

After conversion, the application presents two clear options:

- **Download WebP**: Green button with download icon to save the converted image
- **Convert another image**: Blue button with "+" icon to restart the complete flow
- **Horizontal layout**: Both buttons are shown side by side with uniform spacing
- **Complete reset**: Clicking "Convert another image" clears all states

## 📊 Size Comparison

After conversion, the application shows a prominent visual comparison:

- **Large sizes**: Weights are shown in large text (text-3xl) for maximum visibility
- **Centered layout**: Centered design with generous spacing between elements
- **Descriptive labels**: "Original file" and "WebP file" for clarity
- **Transition arrow**: Larger arrow icon (w-8 h-8) to show the conversion
- **Differentiated colors**:
  - Original file: Gray (text-gray-700)
  - WebP file: Green (text-green-600) to highlight optimization
- **Automatic calculation**: Automatically calculated in KB or MB as appropriate

### 📈 Reduction Statistics

Below the main comparison, detailed statistics are shown:

- **Reduction percentage**: Automatically calculated and shown in green
  - **Smart format**: Shows at least 1 digit and up to 2 decimals
  - **Examples**: "80.0%" for values ≥ 10, "5.25%" for values < 10
- **Weight saved**: Absolute amount of space saved (KB or MB)
- **Visual separator**: Dividing line that separates the comparison from the statistics
- **Smaller text**: Statistics in `text-lg` for visual hierarchy
- **Descriptive labels**: "Reduction" and "Saved" for clarity

## 📁 File Management

The application includes intelligent file management:

- **Conditional input**: The file selection field is automatically hidden when there's a selected image
- **Visual indicator**: When there's a selected file, an indicator is shown with:
  - Image icon
  - File name
  - File type (PNG)
- **Delete button**: Trash icon (🗑️) to remove the current image
- **Complete reset**: When deleting, all states are cleared (preview, metadata, result)
- **New selection**: After deleting, the file input appears again
- **Conditional button**: The "Convert to WebP" button only appears when there's a selected file

## 🚀 Deployment

The application is ready to deploy on Vercel, Netlify or any platform that supports Next.js:

```bash
pnpm build
pnpm start
```

## 📝 License

MIT License - Free for personal and commercial use.

## 🤝 Contributions

Contributions are welcome. Please open an issue or pull request for suggestions and improvements.

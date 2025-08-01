# Image to WebP - Smart Image Converter

A modern web tool to convert PNG, JPG, and JPEG images to WebP format with intelligent compression and batch processing.

## 🚀 Features

- **Multi-format support**: Converts PNG, JPG, and JPEG to WebP with optimized quality (80%)
- **Batch processing**: Upload and convert up to 10 images simultaneously
- **Smart compression**: Automatically compresses large images before upload to prevent server errors
- **Size estimation**: Shows estimated WebP size before conversion
- **Size comparison**: Displays size reduction percentage after conversion
- **Drag & drop**: Intuitive drag and drop interface for easy file upload
- **Bulk actions**: Convert all images at once or download all converted files
- **Real-time stats**: Live statistics showing total files, converted count, and pending items
- **Error handling**: Comprehensive error handling with user-friendly messages
- **Modern interface**: Beautiful dark theme with particle effects and smooth animations
- **Responsive design**: Works perfectly on mobile and desktop devices

## 🛠️ Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Image processing**: Sharp
- **Package management**: pnpm

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd imgtowebp
```

2. Install the dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Usage

1. **Upload images**: Drag and drop or click to select PNG, JPG, or JPEG files (up to 10 files, 20MB each)
2. **Review previews**: Thumbnails and metadata for each image are displayed
3. **Monitor progress**: Watch real-time analysis and size estimation
4. **Convert individually or in bulk**: Convert files one by one or use "Convert all" for batch processing
5. **Download results**: Download individual files or all converted WebP images at once
6. **Smart compression**: Large images are automatically compressed to prevent upload errors

### File Size Limits

- **Individual files**: Up to 20MB per image
- **Total upload**: Up to 100MB total
- **Batch processing**: Up to 10 images simultaneously
- **Auto-compression**: Images larger than 5MB are automatically compressed

## 🔧 API

The application includes a REST API at `/api/convert`:

- **Method**: POST
- **Format**: multipart/form-data
- **Field**: `image` (PNG, JPG, or JPEG file)
- **Response**: WebP file with Content-Type: `image/webp`
- **File size limit**: 20MB per request
- **Timeout**: 60 seconds

### API usage example:

```bash
curl -X POST -F "image=@your-image.png" http://localhost:3000/api/convert -o converted.webp
```

### Error Handling

The API provides specific error messages for different scenarios:

- **413**: File too large (exceeds 20MB limit)
- **400**: Invalid file format or file too small
- **500**: Server processing error

## 📁 Project Structure

```
imgtowebp/
├── app/
│   ├── api/
│   │   └── convert/
│   │       └── route.ts          # Conversion API
│   ├── components/
│   │   ├── CircularProgress.tsx  # Progress indicators
│   │   ├── EnhancedToast.tsx     # Toast notifications
│   │   ├── ParticleSystem.tsx    # Background effects
│   │   └── StatsCard.tsx         # Statistics cards
│   ├── hooks/
│   │   └── useMultipleFiles.ts   # File management hook
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

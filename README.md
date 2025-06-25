# limgx.com - Image Compression & Animation Creation Tool

[![Visit limgx.com](https://img.shields.io/badge/Live%20Demo-limgx.com-blue?style=for-the-badge)](https://limgx.com)

## ✨ Project Overview

**limgx.com** is an open-source, free, and privacy-friendly web tool that combines powerful image processing capabilities. It offers two main features: **image compression & format conversion** and **animated image creation** (GIF/WebP). All processing is performed locally in your browser without uploading to servers, ensuring complete privacy and security.

## 🚀 Key Features

### 📸 Image Compression & Format Conversion
- Support batch image upload via drag & drop or file selection
- Image format conversion: WebP, PNG, JPG, AVIF
- Customizable compression quality and resolution (width/height)
- Real-time compression progress and per-file processing status
- One-click download for all compressed images

### 🎬 Animated Image Creation
- Create animated GIF and WebP from multiple static images
- Smart file sorting by name and number sequences
- Adjustable frame rate (1-60 FPS) and quality settings
- Real-time preview with play/pause controls
- Support for batch processing multiple image sequences

### 🛡️ Privacy & Performance
- All processing happens locally in browser - images never uploaded to servers
- Modern, beautiful UI with dark mode support
- Performance optimized using ffmpeg.wasm for large batch processing
- Mobile-friendly responsive design

## 🖥️ Live Demo

👉 Try it now: [https://limgx.com](https://limgx.com)

## 📦 Tech Stack

- React 18 + TypeScript
- ffmpeg.wasm (client-side image/video processing)
- Tailwind CSS + Shadcn UI
- Next.js (App Router)
- Cloudflare Pages deployment

## 🛡️ Privacy & Security

- **Local Processing**: All image compression, format conversion, and animation creation happens locally in your browser. Image data is never uploaded or stored on servers.
- **Open Source Transparency**: Code is completely open source, welcome to review and contribute.
- **No Data Collection**: No tracking, no analytics, no collection of user data or images.

## 📷 How to Use

### Image Compression
1. Visit [limgx.com](https://limgx.com) and go to the compression tool
2. Drag & drop or select images you want to compress/convert
3. Choose output format and set compression parameters (optional)
4. Click "Compress" button and wait for processing to complete
5. Download your compressed images

### Animation Creation
1. Go to the animation creation tool
2. Upload multiple images in sequence (they will be automatically sorted)
3. Adjust frame rate and quality settings
4. Preview your animation with the play button
5. Click "Create Animation" to generate GIF or WebP
6. Download your animated image

## 🛠️ Local Development

```bash
git clone https://github.com/925558718/LocalImage.git
cd LocalImage
bun install
bun dev
```

### Git Hooks (Husky)

本项目使用 Husky 来管理 Git hooks，确保代码质量。安装依赖后 Husky 会自动设置：

```bash
bun install  # Husky 会自动在 postinstall 时设置
```

已配置的 hooks：

- **pre-commit**: 自动运行 Biome format 和 lint，保持代码格式一致
- **pre-push**: 运行 Biome lint 和 Next.js 构建检查，确保代码质量

如需跳过检查，可使用 `--no-verify` 参数：
```bash
git commit --no-verify -m "message"
git push --no-verify
```

查看配置的 hooks：
```bash
ls -la .husky/
```

## 🤝 Contributing

PRs, Issues, and suggestions are welcome!  
For any questions or ideas, please submit feedback via [GitHub Issues](https://github.com/925558718/LocalImage/issues).

## 📄 License

MIT License

---

> **limgx.com** — Professional image processing tools that work entirely in your browser!
# DarkReader: Advanced Document Viewer


![DarkReader Screenshot](/public/images/main.png)
![DarkReader Screenshot](/public/images/highlight.png)
![DarkReader Screenshot](/public/images/doc-gallery.png)

**DarkReader** is a sophisticated, presentation-oriented document reader designed for the modern web. Built with a sleek, dark, glassmorphic UI, it provides a feature-rich environment for viewing and interacting with various document formats. It leverages the power of the Gemini API for an intelligent voice assistant and is built as a fully offline-capable Progressive Web App (PWA).

## ✨ Features

### 📚 Broad File Support
- **PDF (.pdf):** High-fidelity rendering with a custom dark mode filter.
- **Word (.docx):** Renders document content as clean HTML.
- **PowerPoint (.pptx):** Experimental support for viewing presentation content.
- **Excel (.xlsx):** Displays sheets as individual HTML tables.
- **eBook (.epub):** Renders EPUB content for a comfortable reading experience.
- **Text (.txt):** Simple and clean text display.

### 🎨 Viewing & Presentation
- **Glassmorphic UI:** A modern, translucent interface that stays out of your way.
- **Dark & Light Modes:** Toggle between themes for optimal viewing comfort.
- **Presenter Spotlight:** Focus your audience's attention with a movable spotlight of adjustable size.
- **Laser Pointer:** A virtual laser pointer effect for presentations.
- **Highlighter Tool:**
  - Four vibrant, semi-transparent neon colors.
  - Four adjustable brush sizes.
  - Erase all highlights with a single click.
- **Zoom Controls:** Zoom in, out, and reset to view content at any scale.
- **Persistent State:** Your tools, theme, and last-opened file are remembered across sessions.

### 🤖 AI Voice Assistant (Powered by Gemini)
- **Voice-Activated Q&A:** Simply click the assistant button and ask questions about the currently open document.
- **Context-Aware:** The AI has the full text of your document as context to provide accurate answers.
- **Real-time Feedback:** The UI shows when the assistant is `listening`, `thinking`, or `speaking`.

### 🗄️ File Management & Offline First
- **Document Gallery:** View all your uploaded documents in a clean, responsive grid.
- **Drag & Drop Upload:** Easily add new files from the main screen or the gallery.
- **Persistent Storage:** All documents and their highlights are saved in your browser's IndexedDB, making them available offline.
- **PWA Ready:** Install DarkReader as a desktop or mobile app for a native-like experience.

### 🔊 Accessibility
- **Text-to-Speech (TTS):** Have the document content read aloud with simple play, pause, and stop controls.
- **Speech-to-Text (STT):** Uses the browser's SpeechRecognition API to capture your voice commands for the AI assistant.
- **Keyboard & ARIA Friendly:** Designed with accessibility in mind.

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS
- **AI:** Google Gemini API (`@google/genai`)
- **Document Parsing:**
  - `pdf.js` for PDFs
  - `mammoth.js` for DOCX/PPTX
  - `sheetjs` (xlsx) for XLSX
  - `epub.js` for EPUB
- **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`, etc.)
- **Offline Storage:** IndexedDB for documents and highlights, LocalStorage for user settings.
- **Web APIs:** SpeechSynthesis (TTS), SpeechRecognition (STT), Service Worker

## 🚀 Getting Started

### Prerequisites
- A modern web browser that supports the necessary Web APIs (Chrome is recommended).
- A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running the Application

This project is a client-side application and does not require a complex build process. You can run it using any simple local web server.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/darkreader.git
    cd darkreader
    ```

2.  **Set up your API Key:**
    The application is designed to be deployed in an environment where `process.env.API_KEY` is available. For local testing, you must manually edit the source code.

    **IMPORTANT:** This is for local development **only**. Do not commit your API key to version control.

    Open `App.tsx` and find this line:
    ```typescript
    const ai = useMemo(() => process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null, []);
    ```
    For local testing, you can temporarily replace it with:
    ```typescript
    const ai = useMemo(() => new GoogleGenAI({ apiKey: 'YOUR_GEMINI_API_KEY_HERE' }), []);
    ```
3.  **install& run**
    #open cmd in project dir install and run, you will get a localhost link
    npm install

    npm run dev

4.  **Serve the files:**
    If you have Python installed, you can use its built-in web server:
    ```bash
    # For Python 3
    python3 -m http.server

    # For Python 2
    python -m SimpleHTTPServer
    ```
    If you have `live-server` installed via npm (`npm i -g live-server`):
    ```bash
    live-server
    ```

4.  **Open the app:**
    Navigate to `http://localhost:8000` (or the port provided by your server) in your browser.

## 📁 Project Structure
```
/
├── components/         # React components (Toolbar, DocumentViewer, etc.)
├── hooks/              # Custom React hooks (useTextToSpeech, useFileHandler, etc.)
├── utils/              # Utility functions (IndexedDB handler)
├── App.tsx             # Main application component and logic
├── index.tsx           # Entry point, mounts React app
├── index.html          # Main HTML file, includes CDN scripts
├── sw.js               # Service Worker for PWA/offline functionality
├── types.ts            # TypeScript type definitions
├── constants.ts        # Shared constants (colors, sizes)
└── README.md           # This file
```

## 📄 License
This project is licensed under the MIT License.

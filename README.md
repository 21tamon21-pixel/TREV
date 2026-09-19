# Trev 67

**A local-first AI builder for websites, web apps, and browser games — powered by your own Groq API key.**

No sign-up. No billing. No subscriptions. Your projects stay on your machine.

---

## Features

- **AI-powered builder** — describe what you want in plain English and the AI writes the code
- **Live preview** — your project renders instantly in the browser
- **Voice input** — hold the mic button and speak your prompt
- **File & image attachments** — drag images, screenshots, or text files onto the chat to give the AI a reference
- **Clarification flow** — if your prompt needs more context, Trev 67 asks before building
- **Monaco code editor** — full syntax highlighting, multi-file tabs
- **Export as ZIP** — download any generated project with one click
- **Secret scanner** — warns you before exporting files that contain API keys
- **Collapsible chat sidebar** — maximize the preview when you need it
- **Viewport simulator** — preview in desktop, tablet, and mobile sizes

---

## Quick Start

### Requirements

- Node.js 18+
- pnpm (or npm/yarn)
- A free [Groq API key](https://console.groq.com)

### Install & run

```bash
git clone https://github.com/your-username/trev-67
cd trev-67
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173), click **Settings**, paste your Groq API key, and start building.

---

## Usage

1. **Home page** — type a prompt in the hero box ("Build me a zombie survival game") and press **Build**
2. **Workspace** — the AI generates files and renders a live preview on the right
3. **Iterate** — type follow-up messages in the chat sidebar ("Make the enemies faster")
4. **Attach references** — click the paperclip or drag an image/file onto the chat area
5. **Voice** — click the mic icon and describe the change out loud
6. **Export** — click **Export** in the toolbar to download a ZIP

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Editor | Monaco Editor |
| AI | Groq API (streaming) |
| Export | JSZip |
| Storage | localStorage |

---

## AI Models (Groq)

The default model is `llama-3.3-70b-versatile`. Other supported models:

- `llama3-70b-8192`
- `llama3-8b-8192`
- `mixtral-8x7b-32768`
- `gemma2-9b-it`

Switch models in **Settings** at any time.

---

## Project Structure

```
src/
├── App.tsx                      # Root component, routing, build flow
├── index.css                    # Tailwind + Google Fonts
├── types/index.ts               # TypeScript interfaces
├── lib/
│   ├── agent.ts                 # AI coding agent (prompt → files)
│   ├── attachments.ts           # File/image reading utilities
│   ├── export.ts                # ZIP export + secret scanner
│   ├── groq.ts                  # Groq API streaming client
│   ├── preview.ts               # Compile project files → iframe HTML
│   └── storage.ts               # localStorage CRUD
└── components/
    ├── ClarificationModal.tsx   # Ask for references before building
    ├── home/HomePage.tsx        # Dashboard + hero prompt
    ├── settings/SettingsModal.tsx
    └── workspace/
        ├── WorkspaceLayout.tsx  # 3-panel IDE layout
        ├── ChatPanel.tsx        # Streaming chat + voice + attachments
        ├── CodeEditor.tsx       # Monaco wrapper
        ├── FileTree.tsx         # Virtual file system tree
        └── PreviewPanel.tsx     # iframe preview + viewport controls
```

---

## Environment

Trev 67 is a **browser-only** application. Your Groq API key is stored in `localStorage` and never sent anywhere except directly to `api.groq.com`. No server component required.

---

## License

MIT

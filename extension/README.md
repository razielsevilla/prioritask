# 💿 PrioriTask Chrome Extension

This folder contains the Chrome Extension source code for **PrioriTask**, an intelligent assignment prioritiser designed for Manifest V3.

---

## 🚀 Current Status

All core development phases are fully complete:
- **Manifest V3 Runtime**: Fully configured and validated with permissions (`storage`, `alarms`, `notifications`, `contextMenus`, `scripting`).
- **Data Layer & CRUD**: Local task and settings storage backed by central repositories and Zod validations.
- **Smart Priority Engine**: Evaluates assignments dynamically using the **Smart Time Pressure** formula and **FSR Workload capacity** alerts.
- **AI Task Breakdown**: Integrates with Gemini AI (`gemini-2.5-flash`) to generate spaced-out subtasks.
- **Pinnacle LMS Sync**: Implements content script scraping to import student tasks from Pinnacle LMS.
- **Gamified UI & Dashboard**: Offers both a mini popup UI (with a Tamagotchi workload pet) and a full-screen Kanban dashboard.
- **Background Worker**: Manages MV3 alarms, scheduling checks, and native alerts/notifications.

---

## 🛠️ Tech Stack

- **Framework**: React 18, TypeScript, Vite
- **Extension Tooling**: `@crxjs/vite-plugin` (Manifest V3 support)
- **Validation**: Zod
- **AI Models**: Gemini API (`gemini-2.5-flash`)
- **Testing**: Vitest
- **Style**: Custom Retro/Y2K CSS styling

---

## 💻 Development Commands

From this directory, you can run the following scripts:

```bash
# Install NPM dependencies
npm install

# Start Vite build + hot-reloading (ideal for extension testing)
npm run dev

# Run ESLint check
npm run lint

# Run unit tests
npm run test -- --run

# Create a production build inside the /dist folder
npm run build
```

---

## 🔌 Load in Chrome (Developer Mode)

1. Run `npm run build` to package the extension.
2. In Google Chrome, go to `chrome://extensions/`.
3. Toggle the **Developer mode** switch in the top-right corner.
4. Click the **Load unpacked** button in the top-left.
5. Select the `dist/` directory generated inside this folder.
6. Open Pinnacle LMS (`https://pinnacle.pnc.edu.ph/`) to test the scraper integration!

---

## 📂 Key Entry Points

*   **Manifest Config**: [manifest.json](file:///c:/Users/Raziel/OneDrive/Documents/06_Projects/PrioriTask/extension/manifest.json)
*   **Popup UI**: [src/popup/Popup.tsx](file:///c:/Users/Raziel/OneDrive/Documents/06_Projects/PrioriTask/extension/src/popup/Popup.tsx) (Default action popup)
*   **Kanban Dashboard**: [src/dashboard/Dashboard.tsx](file:///c:/Users/Raziel/OneDrive/Documents/06_Projects/PrioriTask/extension/src/dashboard/Dashboard.tsx) (Full-screen board view)
*   **Background Worker**: [src/background/index.ts](file:///c:/Users/Raziel/OneDrive/Documents/06_Projects/PrioriTask/extension/src/background/index.ts) (Alarm notifications and scheduling)
*   **LMS Scraper**: [src/content/scraper.ts](file:///c:/Users/Raziel/OneDrive/Documents/06_Projects/PrioriTask/extension/src/content/scraper.ts) (Pinnacle LMS scraper script)
*   **Domain Formulas**: [src/utils/algorithms.ts](file:///c:/Users/Raziel/OneDrive/Documents/06_Projects/PrioriTask/extension/src/utils/algorithms.ts) & [src/utils/pipeline.ts](file:///c:/Users/Raziel/OneDrive/Documents/06_Projects/PrioriTask/extension/src/utils/pipeline.ts)

# Omnissa Horizon Designer

This is a React application built with Vite and Tailwind CSS.

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Configure Firebase (Optional for offline mode, required for saving):
    Create a `.env` file in the root directory with your Firebase configuration:
    ```env
    VITE_FIREBASE_CONFIG={"apiKey":"YOUR_API_KEY", ...}
    VITE_APP_ID=your-app-id
    ```
    Or simply update `src/App.jsx` with your config object directly.

## Running

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Features

-   Drag and drop architecture diagramming
-   Tailwind CSS styling with Dark Mode
-   PDF and JSON Export
-   Firebase integration for saving designs

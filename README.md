<<<<<<< Current (Your changes)
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
=======
# Omnissa Horizon Designer Pro

A professional architecture diagram tool for designing Omnissa Horizon, Workspace ONE UEM, VMware VCF, and related infrastructure deployments.

## Features

- **Drag & Drop Components** - Extensive library of pre-built stencils for:
  - Workspace ONE UEM (Console, Device Services, API Server, etc.)
  - Omnissa Horizon (Connection Servers, UAG, Horizon Agents, etc.)
  - Pools & Farms (Persistent/Non-Persistent Pools, RDSH Farms)
  - VCF & Aria Suite (SDDC Manager, Aria Operations, NSX components)
  - Virtualization (vCenter, ESXi, vSAN, NSX Manager)
  - Infrastructure (Active Directory, SQL, DNS, NTP, etc.)
  - Networking (Firewalls, Load Balancers, Switches, Routers)
  - Cloud Providers (Azure, AWS, Google Cloud)
  - Zones & Areas (LAN, DMZ, Cloud)
  - Endpoints (Users, Thin Clients, Laptops, Mobile)

- **Smart Connections** - Automatic port/protocol labeling for known component relationships
- **Pan & Zoom** - Navigate large diagrams with smooth pan/zoom controls
- **Multi-Select** - Select multiple nodes with Ctrl/Cmd+Click or drag selection box
- **Dark Mode** - Toggle between light and dark themes
- **Export Options**:
  - JSON export/import for design backup and sharing
  - PDF export with diagram and connection details table
- **Firebase Integration** - Optional cloud storage for designs (requires configuration)

## Quick Start

1. Open `index.html` in a modern web browser, or
2. Serve the files with any HTTP server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js (npx)
npx serve .

# Using PHP
php -S localhost:8080
```

3. Navigate to `http://localhost:8080`

## Usage

### Adding Components
- **Click** on a component in the left sidebar to add it to the canvas center
- **Drag & Drop** components from the sidebar to a specific location

### Creating Connections
1. Click the **Zap** (⚡) tool in the toolbar
2. Click and drag from one component to another
3. Release to create the connection

### Editing
- **Select** components or connections to view/edit properties in the right panel
- **Customize** colors, opacity, labels, and connection directions
- **Resize** zones/nodes using the corner handle when selected
- **Duplicate** with Ctrl/Cmd+D
- **Delete** with Delete/Backspace keys

### Navigation
- **Pan** using the Hand tool or scroll
- **Zoom** with Ctrl/Cmd+Scroll or the +/- buttons
- **Reset View** with the maximize button

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + D | Duplicate selection |
| Delete/Backspace | Delete selection |
| Ctrl/Cmd + Scroll | Zoom in/out |

## Browser Requirements

- Modern browser with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)

## Firebase Configuration (Optional)

To enable cloud storage, set the following global variables before the app loads:

```javascript
window.__firebase_config = JSON.stringify({
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
});
window.__app_id = "your-app-id";
```

## License

MIT License - Feel free to use and modify for your needs.
>>>>>>> Incoming (Background Agent changes)

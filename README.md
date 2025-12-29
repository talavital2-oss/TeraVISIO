# Omnissa Horizon Designer Pro

A professional architecture diagram tool for designing Omnissa Horizon, Workspace ONE UEM, VMware VCF, and related infrastructure deployments.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Deployment to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the Vite framework
6. Click "Deploy"

The `vercel.json` file is already configured to:
- Use `npm run build` as the build command
- Output to the `dist` directory
- Use Vite as the framework

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## ✨ Features

### Component Library
- **Workspace ONE UEM** - Console, Device Services, API Server, Database, Cloud Connector, UAG Tunnel/SEG, ENS, WS1 Access
- **Omnissa Horizon** - Connection Server, UAG Appliance, Horizon Agent, App Volumes, DEM, Cloud Connector
- **Pools & Farms** - Persistent/Non-Persistent Pools, RDSH Farms, Recording Server
- **VCF & Aria Suite** - SDDC Manager, Aria Operations/Automation/Logs/Lifecycle, NSX Edge/Tier-0/Tier-1
- **Virtualization** - vCenter, ESXi, vSAN, NSX Manager, Datastores, Resource Pools
- **Infrastructure** - Active Directory, SQL, DNS, NTP, Syslog, CA, KMS, File Shares
- **Networking** - Firewalls, Load Balancers, Switches, Routers, VPN
- **Cloud Providers** - Azure, AWS, Google Cloud
- **Zones & Areas** - LAN Zone, DMZ Zone, Cloud/Internet
- **Endpoints** - Users, Thin Clients, Laptops, Mobile Devices

### Editor Features
- **Drag & Drop** - Add components from the palette to the canvas
- **Smart Connections** - Automatic port/protocol labeling based on component types
- **Multi-select** - Ctrl/Cmd+click or drag selection box
- **Duplicate** - Ctrl/Cmd+D to duplicate selected items
- **Pan & Zoom** - Mouse wheel to zoom, drag with Pan tool
- **Dark Mode** - Toggle between light and dark themes
- **Multiple Backgrounds** - Dots, Grid, Pixels, or Clear

### Export Options
- **JSON** - Save and load designs as JSON files
- **PDF** - Export diagram with connection details table

### Data Storage
- Designs are saved to browser localStorage
- Import/Export JSON for sharing

## 🏗️ Project Structure

```
├── index.html              # Entry HTML
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── vercel.json             # Vercel deployment configuration
├── public/
│   └── favicon.svg         # App icon
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Main application component
    ├── index.css           # Global styles with Tailwind
    ├── constants.js        # Stencil categories and settings
    ├── utils.js            # Helper functions and exports
    └── components/
        ├── Icon.jsx            # Dynamic Lucide icon component
        ├── StencilPalette.jsx  # Component palette sidebar
        ├── DraggableWindow.jsx # Floating window component
        ├── TrafficLegend.jsx   # Network traffic legend
        └── ColorLegend.jsx     # Connection color legend
```

## 🛠️ Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icon library
- **jsPDF** - PDF generation
- **html2canvas** - Canvas capture for PDF

## 📝 License

MIT License

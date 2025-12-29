// --- CONSTANTS ---
export const NODE_WIDTH = 120;  
export const NODE_HEIGHT = 96;
export const GRID_SIZE = 24;

export const POPULAR_COLORS = [
    '#64748b', '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
    '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', 
    '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'
];

// --- STENCILS ---
export const STENCIL_CATEGORIES = [
    {
        id: 'ws1-uem', name: 'Workspace ONE UEM', items: [
            { type: 'uem-console', label: 'UEM Console', icon: 'LayoutDashboard', defaultColor: '#0ea5e9', color: 'text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-950' },
            { type: 'uem-ds', label: 'Device Services', icon: 'Smartphone', defaultColor: '#0284c7', color: 'text-sky-700 bg-sky-50 dark:text-sky-400 dark:bg-sky-950' },
            { type: 'uem-api', label: 'API Server', icon: 'Code', defaultColor: '#0369a1', color: 'text-sky-800 bg-sky-50 dark:text-sky-400 dark:bg-sky-950' },
            { type: 'uem-db', label: 'UEM Database', icon: 'Database', defaultColor: '#e11d48', color: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950' },
            { type: 'acc', label: 'Cloud Connector', icon: 'CloudCog', defaultColor: '#64748b', color: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800' },
            { type: 'uag-tunnel', label: 'UAG Tunnel', icon: 'Lock', defaultColor: '#059669', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950' },
            { type: 'uag-seg', label: 'UAG SEG', icon: 'Mail', defaultColor: '#059669', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950' },
            { type: 'uag-content', label: 'Content Gateway', icon: 'FileText', defaultColor: '#059669', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950' },
            { type: 'ens', label: 'ENS Service', icon: 'Bell', defaultColor: '#d97706', color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950' },
            { type: 'ws1-access', label: 'WS1 Access', icon: 'Fingerprint', defaultColor: '#4f46e5', color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950' },
        ]
    },
    {
        id: 'omnissa', name: 'Omnissa Horizon', items: [
            { type: 'connection-server', label: 'Connection Server', icon: 'Server', defaultColor: '#0d9488', color: 'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950' },
            { type: 'uag', label: 'UAG Appliance', icon: 'ShieldCheck', defaultColor: '#0f766e', color: 'text-teal-700 bg-teal-50 dark:text-teal-400 dark:bg-teal-950' },
            { type: 'horizon-agent', label: 'Horizon Agent', icon: 'Monitor', defaultColor: '#0891b2', color: 'text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-950' },
            { type: 'app-volumes', label: 'App Volumes', icon: 'Layers', defaultColor: '#9333ea', color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950' },
            { type: 'dem', label: 'DEM Console', icon: 'Settings', defaultColor: '#f97316', color: 'text-orange-500 bg-orange-50 dark:text-orange-400 dark:bg-orange-950' },
            { type: 'cloud-connector', label: 'Cloud Connector', icon: 'CloudCog', defaultColor: '#0284c7', color: 'text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-950' },
            { type: 'enrollment-server', label: 'Enrollment Srv', icon: 'FileBadge', defaultColor: '#0d9488', color: 'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950' },
        ]
    },
    {
        id: 'pools', name: 'Pools & Farms', items: [
            { type: 'pool-non-persistent', label: 'Non - Persistent Pool', icon: 'Copy', defaultColor: '#0891b2', color: 'text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-950' },
            { type: 'pool-persistent', label: 'Dedicated - Persistent Pool', icon: 'HardDrive', defaultColor: '#2563eb', color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950' },
            { type: 'rdsh-farm', label: 'RDSH Farm', icon: 'LayoutGrid', defaultColor: '#ea580c', color: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950' },
            { type: 'recording-server', label: 'Recording Server', icon: 'Video', defaultColor: '#9333ea', color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950' },
        ]
    },
    {
        id: 'vcf', name: 'VCF & Aria Suite', items: [
            { type: 'sddc-mgr', label: 'SDDC Manager', icon: 'ServerCog', defaultColor: '#0f766e', color: 'text-teal-700 bg-teal-50 dark:text-teal-400 dark:bg-teal-950' },
            { type: 'aria-ops', label: 'Aria Operations', icon: 'Activity', defaultColor: '#16a34a', color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950' },
            { type: 'aria-auto', label: 'Aria Automation', icon: 'Cpu', defaultColor: '#0284c7', color: 'text-sky-700 bg-sky-50 dark:text-sky-400 dark:bg-sky-950' },
            { type: 'aria-logs', label: 'Aria Logs', icon: 'FileText', defaultColor: '#ca8a04', color: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950' },
            { type: 'aria-lcm', label: 'Aria Lifecycle', icon: 'RefreshCw', defaultColor: '#475569', color: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800' },
            { type: 'nsx-edge', label: 'NSX Edge Node', icon: 'Router', defaultColor: '#16a34a', color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950' },
            { type: 'nsx-t0', label: 'NSX Tier-0 GW', icon: 'ArrowUpFromLine', defaultColor: '#15803d', color: 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950' },
            { type: 'nsx-t1', label: 'NSX Tier-1 GW', icon: 'ArrowDownToLine', defaultColor: '#22c55e', color: 'text-green-500 bg-green-50 dark:text-green-400 dark:bg-green-950' },
        ]
    },
    {
        id: 'virt', name: 'Virtualization', items: [
            { type: 'vcenter', label: 'vCenter Server', icon: 'Activity', defaultColor: '#15803d', color: 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950' },
            { type: 'esxi', label: 'ESXi Host', icon: 'Cpu', defaultColor: '#475569', color: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800' },
            { type: 'vsan', label: 'vSAN Cluster', icon: 'HardDrive', defaultColor: '#1d4ed8', color: 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950' },
            { type: 'nsx', label: 'NSX Manager', icon: 'Shield', defaultColor: '#16a34a', color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950' },
            { type: 'datastore', label: 'Datastore', icon: 'Database', defaultColor: '#475569', color: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800' },
            { type: 'resource-pool', label: 'Resource Pool', icon: 'PieChart', defaultColor: '#ca8a04', color: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950' },
        ]
    },
    {
        id: 'infra', name: 'Infrastructure', items: [
            { type: 'ad', label: 'Active Directory', icon: 'Users', defaultColor: '#1d4ed8', color: 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950' },
            { type: 'sql', label: 'SQL Database', icon: 'Database', defaultColor: '#dc2626', color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950' },
            { type: 'dns', label: 'DNS Server', icon: 'Globe', defaultColor: '#4f46e5', color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950' },
            { type: 'ntp', label: 'NTP Server', icon: 'Clock', defaultColor: '#4f46e5', color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950' },
            { type: 'syslog', label: 'Syslog Server', icon: 'FileText', defaultColor: '#4b5563', color: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800' },
            { type: 'ca', label: 'CA Authority', icon: 'Stamp', defaultColor: '#d97706', color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950' },
            { type: 'kms', label: 'KMS Server', icon: 'Key', defaultColor: '#d97706', color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950' },
            { type: 'fileshare', label: 'File Share', icon: 'FolderOpen', defaultColor: '#ca8a04', color: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950' },
        ]
    },
    {
        id: 'network', name: 'Networking', items: [
            { type: 'firewall', label: 'Firewall', icon: 'BrickWall', defaultColor: '#be123c', color: 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950' },
            { type: 'load-balancer', label: 'Load Balancer', icon: 'GitMerge', defaultColor: '#059669', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950' },
            { type: 'avi', label: 'AVI Load Balancer', icon: 'Activity', defaultColor: '#059669', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950' },
            { type: 'switch', label: 'Switch L2/L3', icon: 'Network', defaultColor: '#334155', color: 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800' },
            { type: 'router', label: 'Router', icon: 'Router', defaultColor: '#334155', color: 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800' },
            { type: 'vpn', label: 'VPN Gateway', icon: 'Lock', defaultColor: '#6d28d9', color: 'text-violet-700 bg-violet-50 dark:text-violet-400 dark:bg-violet-950' },
        ]
    },
    {
        id: 'cloud', name: 'Cloud Providers', items: [
            { type: 'azure', label: 'Azure Cloud', icon: 'Cloud', defaultColor: '#3b82f6', color: 'text-blue-500 bg-blue-50 dark:text-blue-400 dark:bg-blue-950' },
            { type: 'aws', label: 'AWS Cloud', icon: 'CloudSun', defaultColor: '#f97316', color: 'text-orange-500 bg-orange-50 dark:text-orange-400 dark:bg-orange-950' },
            { type: 'google', label: 'Google Cloud', icon: 'Cloud', defaultColor: '#22c55e', color: 'text-green-500 bg-green-50 dark:text-green-400 dark:bg-green-950' },
        ]
    },
    {
        id: 'zones', name: 'Zones & Areas', items: [
            { type: 'zone', label: 'LAN Zone', icon: 'BoxSelect', defaultColor: '#16a34a', color: 'bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800' },
            { type: 'zone', label: 'DMZ Zone', icon: 'BoxSelect', defaultColor: '#f97316', color: 'bg-orange-50/50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' },
            { type: 'zone', label: 'Cloud / Internet', icon: 'Cloud', defaultColor: '#2563eb', color: 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' },
        ]
    },
    {
        id: 'actors', name: 'Endpoints', items: [
            { type: 'user', label: 'User / Client', icon: 'User', defaultColor: '#475569', color: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800' },
            { type: 'thin-client', label: 'Thin Client', icon: 'MonitorSmartphone', defaultColor: '#475569', color: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800' },
            { type: 'laptop', label: 'Laptop', icon: 'Laptop', defaultColor: '#475569', color: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800' },
            { type: 'mobile', label: 'Mobile Device', icon: 'Smartphone', defaultColor: '#475569', color: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800' },
        ]
    }
];


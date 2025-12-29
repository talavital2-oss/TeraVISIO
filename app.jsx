const { useState, useEffect, useRef, useMemo, useCallback } = React;

// --- CONSTANTS ---
const NODE_WIDTH = 120;  
const NODE_HEIGHT = 96;
const GRID_SIZE = 24;

// --- HELPER: Hex to RGBA ---
const hexToRgba = (hex, alpha) => {
    if (!hex) return `rgba(100, 116, 139, ${alpha})`; 
    let c = hex.substring(1).split('');
    if(c.length== 3){
        c= [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c= '0x'+c.join('');
    return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
};

const POPULAR_COLORS = [
    '#64748b', '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
    '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', 
    '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'
];

// --- STENCILS ---
const STENCIL_CATEGORIES = [
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

// --- UTILS ---
const snapToGrid = (val) => Math.round(val / GRID_SIZE) * GRID_SIZE;
const getPortInfo = (s, t) => {
    const k = `${s}:${t}`;
    const INTERMEDIARY_TYPES = ['firewall', 'load-balancer', 'router', 'switch', 'vpn'];
    const isIntermediary = (type) => INTERMEDIARY_TYPES.includes(type);

    if (isIntermediary(s)) {
        if (t === 'uag') return 'HTTPS (443) / Blast (8443) / PCoIP (4172)'; 
        if (t === 'uag-tunnel') return 'TCP/UDP 8443 / TCP 443';
        if (t === 'uag-seg') return 'TCP 443 (ActiveSync)';
        if (t === 'connection-server') return 'HTTPS (443) / AJP13 (8009)'; 
        if (t === 'horizon-agent') return 'Blast (22443) / PCoIP (4172) / RDP (3389)';
    }
    if (isIntermediary(t)) {
        if (['user','mobile','laptop','thin-client'].includes(s)) return 'HTTPS (443) / Blast (8443) / PCoIP (4172)'; 
        if (s === 'uag') return 'HTTPS (443) / AJP13 (8009) / Blast (22443)'; 
        if (s === 'connection-server') return 'JMS (4001) / HTTPS (443)'; 
        if (s === 'acc') return 'TCP 443 (Outbound)';
    }

    const mapping = {
        'user:uag': 'TCP 443, UDP 443 / TCP/UDP 8443 / TCP/UDP 4172',
        'user:connection-server': 'TCP 443 / TCP 8443',
        'user:horizon-agent': 'TCP/UDP 22443 / TCP/UDP 4172 / TCP 3389 / TCP 32111',
        'uag:connection-server': 'TCP 443',
        'uag:horizon-agent': 'TCP/UDP 22443 / TCP/UDP 4172 / TCP 3389',
        'connection-server:horizon-agent': 'TCP 4001, 4002, 32111',
        'connection-server:ad': 'TCP/UDP 88, 389, 636, 135, 3268',
        'connection-server:vcenter': 'TCP 443',
        'connection-server:sql': 'TCP 1433',
        'connection-server:syslog': 'UDP 514',
        'mobile:uag-tunnel': 'TCP/UDP 8443, TCP 443',
        'mobile:uag-seg': 'TCP 443 (ActiveSync)',
        'uag-tunnel:uem-api': 'TCP 443',
        'uag-seg:uem-api': 'TCP 443',
        'acc:uem-console': 'TCP 443 (Outbound)',
        'acc:ad': 'TCP/UDP 389, 636',
        'uem-console:uem-db': 'TCP 1433',
        'uem-ds:uem-db': 'TCP 1433',
        'uem-console:uem-api': 'TCP 443',
        'uem-ds:uem-api': 'TCP 443',
        'ens:uem-api': 'TCP 443',
        'ens:uag-seg': 'TCP 443',
        'cloud-builder:esxi': 'ICMP (Ping) / TCP 22 (SSH) / TCP 443',
        'esxi:sddc-mgr': 'TCP/UDP 111, 2049, 32767 (NFS)',
        'sddc-mgr:vcenter': 'TCP 443, 22',
        'sddc-mgr:nsx': 'TCP 443, 22',
        'sddc-mgr:nsx-edge': 'TCP 443, 22',
        'sddc-mgr:aria-ops': 'TCP 443',
        'sddc-mgr:aria-auto': 'TCP 443',
        'sddc-mgr:ws1-access': 'TCP 22, 443',
        'sddc-mgr:aria-logs': 'TCP 22, 443',
        'nsx:vcenter': 'TCP 443, 9087 (vLCM)',
        'nsx:esxi': 'TCP 1234, 1235 (Clustering), 5671 (Messaging)',
        'nsx-edge:nsx': 'TCP 5671',
        'nsx:ad': 'TCP 389, 636',
        'nsx:syslog': 'TCP 514 / UDP 514',
        'vcenter:esxi': 'UDP 902 (Heartbeat) / TCP 443',
        'vcenter:ad': 'TCP 389, 636, 2020',
        'vsan:vsan': 'TCP 12321, 2233 (Inter-node)',
        'esxi:vsan': 'TCP 12321, 2233',
        'aria-ops:vcenter': 'TCP 443',
        'aria-auto:vcenter': 'TCP 443',
        'aria-logs:syslog': 'UDP 514 / TCP 1514 (SSL)',
        'esxi:aria-logs': 'UDP 514',
        'nsx:aria-logs': 'UDP 514',
        'aria-ops:aria-logs': 'TCP 443',
        'aria-auto:aria-lcm': 'TCP 443',
        'avi:esxi': 'TCP 443',
        'avi:vcenter': 'TCP 443',
        'avi:uag': 'TCP 443, 8443',
        'ntp:connection-server': 'UDP 123',
        'ntp:uag': 'UDP 123',
        'dns:connection-server': 'UDP 53',
        'dns:uag': 'UDP 53'
    };

    return mapping[k] || null;
};

const getVisualGeometry = (node) => {
     if (node.type === 'zone') {
         return { cx: node.x + node.w/2, cy: node.y + node.h/2, w: node.w, h: node.h };
     } else {
         const boxSize = Math.min(node.w, node.h) * 0.4;
         const cx = node.x + node.w/2;
         const cy = node.y + 12 + boxSize/2;
         return { cx, cy, w: boxSize, h: boxSize };
     }
};

const getAnchors = (geom) => ({
    top:    { x: geom.cx, y: geom.cy - geom.h/2 },
    bottom: { x: geom.cx, y: geom.cy + geom.h/2 },
    left:   { x: geom.cx - geom.w/2, y: geom.cy },
    right:  { x: geom.cx + geom.w/2, y: geom.cy }
});

const getPointOnNode = (node, side, ratio) => {
    const geom = getVisualGeometry(node);
    const w = geom.w;
    const h = geom.h;
    const r = ratio === undefined ? 0.5 : ratio;

    if (side === 'top') return { x: geom.cx - w/2 + w*r, y: geom.cy - h/2 };
    if (side === 'bottom') return { x: geom.cx - w/2 + w*r, y: geom.cy + h/2 };
    if (side === 'left') return { x: geom.cx - w/2, y: geom.cy - h/2 + h*r };
    if (side === 'right') return { x: geom.cx + w/2, y: geom.cy - h/2 + h*r };
    return { x: geom.cx, y: geom.cy };
};

const getBestConnection = (nA, nB, overrideSideA, overrideSideB) => {
    const gA = getVisualGeometry(nA);
    const gB = getVisualGeometry(nB);
    const aA = getAnchors(gA);
    const aB = getAnchors(gB);
    
    if (overrideSideA && overrideSideB) {
         return { start: aA[overrideSideA], end: aB[overrideSideB], sideA: overrideSideA, sideB: overrideSideB };
    }

    if (overrideSideA && !overrideSideB) {
        const start = aA[overrideSideA];
        let min = Infinity;
        let bestSideB = 'top';
        Object.entries(aB).forEach(([side, pos]) => {
            const d = Math.hypot(pos.x - start.x, pos.y - start.y);
            if (d < min) { min = d; bestSideB = side; }
        });
        return { start, end: aB[bestSideB], sideA: overrideSideA, sideB: bestSideB };
    }

    if (!overrideSideA && overrideSideB) {
        const end = aB[overrideSideB];
        let min = Infinity;
        let bestSideA = 'top';
        Object.entries(aA).forEach(([side, pos]) => {
            const d = Math.hypot(pos.x - end.x, pos.y - end.y);
            if (d < min) { min = d; bestSideA = side; }
        });
        return { start: aA[bestSideA], end, sideA: bestSideA, sideB: overrideSideB };
    }
    
    let min = Infinity, best = { start: aA.top, end: aB.top, sideA: 'top', sideB: 'top' };
    Object.entries(aA).forEach(([kA, pA]) => {
        Object.entries(aB).forEach(([kB, pB]) => {
            const d = Math.sqrt(Math.pow(pB.x-pA.x, 2) + Math.pow(pB.y-pA.y, 2));
            if (d < min) { min = d; best = { start: pA, end: pB, sideA: kA, sideB: kB }; }
        });
    });
    return best;
};

const getPath = (s, e, sA, sB) => {
    const mx = (s.x+e.x)/2, my = (s.y+e.y)/2;
    if (Math.abs(s.x - e.x) < 10) return `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
    if (Math.abs(s.y - e.y) < 10) return `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
    if ((sA === 'bottom' && sB === 'top') || (sA === 'top' && sB === 'bottom')) return `M ${s.x} ${s.y} L ${s.x} ${my} L ${e.x} ${my} L ${e.x} ${e.y}`;
    if ((sA === 'right' && sB === 'left') || (sA === 'left' && sB === 'right')) return `M ${s.x} ${s.y} L ${mx} ${s.y} L ${mx} ${e.y} L ${e.x} ${e.y}`;
    return `M ${s.x} ${s.y} L ${e.x} ${s.y} L ${e.x} ${e.y}`;
};

const getClosestSideAndRatio = (geom, x, y) => {
    const dTop = Math.abs(y - (geom.cy - geom.h/2));
    const dBottom = Math.abs(y - (geom.cy + geom.h/2));
    const dLeft = Math.abs(x - (geom.cx - geom.w/2));
    const dRight = Math.abs(x - (geom.cx + geom.w/2));
    
    const min = Math.min(dTop, dBottom, dLeft, dRight);
    let side, ratio;

    if (min === dTop) {
        side = 'top';
        const left = geom.cx - geom.w/2;
        ratio = Math.max(0, Math.min(1, (x - left) / geom.w));
    } else if (min === dBottom) {
        side = 'bottom';
        const left = geom.cx - geom.w/2;
        ratio = Math.max(0, Math.min(1, (x - left) / geom.w));
    } else if (min === dLeft) {
        side = 'left';
        const top = geom.cy - geom.h/2;
        ratio = Math.max(0, Math.min(1, (y - top) / geom.h));
    } else {
        side = 'right';
        const top = geom.cy - geom.h/2;
        ratio = Math.max(0, Math.min(1, (y - top) / geom.h));
    }
    return { side, ratio };
};

const Icon = ({ name, size = 20, color = "currentColor", className = "" }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (window.lucide && ref.current && window.lucide.icons[name]) {
            ref.current.innerHTML = '';
            const svg = window.lucide.createElement(window.lucide.icons[name]);
            svg.setAttribute('width', size); svg.setAttribute('height', size); svg.setAttribute('stroke', color);
            if (className) svg.setAttribute('class', className);
            ref.current.appendChild(svg);
        }
    }, [name, size, color, className]);
    return <span ref={ref} className="flex items-center justify-center shrink-0" style={{ width: size, height: size }} />;
};

// --- EXPORT FUNCTIONS ---
const exportToJson = (design) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(design));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", (design.title || "design") + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

const importFromJson = (e, onLoad) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
        const parsed = JSON.parse(e.target.result);
        onLoad(parsed);
    };
};

const exportToPdf = async (designTitle, nodes, edges, transform, colorLabels) => {
     const canvasEl = document.querySelector('.canvas-world');
     if(!canvasEl) return;
     
     let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
     if (nodes.length === 0) { alert("No nodes to export."); return; }
     
     nodes.forEach(n => {
         minX = Math.min(minX, n.x);
         minY = Math.min(minY, n.y);
         maxX = Math.max(maxX, n.x + n.w);
         maxY = Math.max(maxY, n.y + n.h);
     });
     
     const padding = 200; 
     minX -= padding; minY -= padding; maxX += padding; maxY += padding;
     const width = maxX - minX;
     const height = maxY - minY;

     const originalTransform = canvasEl.style.transform;
     const originalWidth = canvasEl.style.width;
     const originalHeight = canvasEl.style.height;
     
     canvasEl.style.width = `${width}px`;
     canvasEl.style.height = `${height}px`;
     canvasEl.style.transform = `translate(${-minX}px, ${-minY}px) scale(1)`;
     
     const uiElements = Array.from(document.querySelectorAll('.fixed, .absolute')).filter(el => {
         return !canvasEl.contains(el) && !el.classList.contains('canvas-world');
     });
     
     const originalStyles = uiElements.map(el => ({ el, display: el.style.display }));
     uiElements.forEach(el => el.style.display = 'none');

     try {
         const canvas = await window.html2canvas(canvasEl, { 
             scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true,
             x: 0, y: 0, width: width, height: height, windowWidth: width, windowHeight: height
         });
         
         canvasEl.style.width = originalWidth;
         canvasEl.style.height = originalHeight;
         canvasEl.style.transform = originalTransform;
         originalStyles.forEach(item => item.el.style.display = item.display);

         const imgData = canvas.toDataURL('image/png');
         
         const { jsPDF } = window.jspdf;
         const pdf = new jsPDF('l', 'mm', 'a4');
         const pdfW = pdf.internal.pageSize.getWidth();
         const pdfH = pdf.internal.pageSize.getHeight();
         
         pdf.setFontSize(16);
         pdf.text(designTitle || "Architecture Diagram", 14, 15);
         
         const legendHeight = 30;
         const maxImgH = pdfH - 25 - legendHeight;
         const maxImgW = pdfW - 20;
         
         const imgProps = pdf.getImageProperties(imgData);
         const aspect = imgProps.width / imgProps.height;
         
         let printW = maxImgW;
         let printH = maxImgW / aspect;
         
         if (printH > maxImgH) { printH = maxImgH; printW = maxImgH * aspect; }
         
         const printX = (pdfW - printW) / 2;
         pdf.addImage(imgData, 'PNG', printX, 20, printW, printH);
         
         if (Object.keys(colorLabels).length > 0) {
             let legY = pdfH - legendHeight + 5;
             let legX = 14;
             pdf.setFontSize(10);
             pdf.setTextColor(0,0,0);
             pdf.text("Connection Types:", legX, legY);
             legY += 5;
             pdf.setFontSize(9);
             
             Object.entries(colorLabels).forEach(([color, label]) => {
                 if (!label) return;
                 const textW = pdf.getTextWidth(label);
                 const itemW = 4 + 2 + textW + 8;
                 if (legX + itemW > pdfW - 14) { legX = 14; legY += 5; }
                 pdf.setFillColor(color);
                 pdf.rect(legX, legY - 3, 4, 4, 'F');
                 pdf.text(label, legX + 6, legY);
                 legX += itemW;
             });
         }

         pdf.addPage();
         pdf.setFontSize(16);
         pdf.text("Connection Details", 14, 15);
         
         const tableData = edges.map(e => {
             const s = nodes.find(n => n.id === e.source);
             const t = nodes.find(n => n.id === e.target);
             if(!s || !t) return null;
             const auto = getPortInfo(s.type, t.type);
             const label = e.customLabel || auto || "-";
             return [s.label, t.label, label];
         }).filter(Boolean);
         
         pdf.autoTable({
             head: [['Source', 'Destination', 'Ports / Protocol']],
             body: tableData,
             startY: 25,
             theme: 'striped',
             styles: { fontSize: 8, cellPadding: 2 },
             columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 40 }, 2: { cellWidth: 'auto' } }
         });
         
         pdf.save((designTitle || "design") + ".pdf");
     } catch (err) {
         console.error("PDF Generation failed", err);
         alert("Failed to generate PDF. Check console.");
         canvasEl.style.width = originalWidth;
         canvasEl.style.height = originalHeight;
         canvasEl.style.transform = originalTransform;
         originalStyles.forEach(item => item.el.style.display = item.display);
     }
};

// --- LEGEND COMPONENTS ---
const DraggableWindow = ({ title, icon, children, initialPos }) => {
    const [pos, setPos] = useState(initialPos || {x: 20, y: 20});
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({x: 0, y: 0});
    const [isOpen, setIsOpen] = useState(true);

    const handleDown = (e) => {
        e.stopPropagation();
        setIsDragging(true);
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setDragStart({ x: clientX - pos.x, y: clientY - pos.y });
    };

    useEffect(() => {
        const handleMove = (e) => {
            if (!isDragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            setPos({ x: clientX - dragStart.x, y: clientY - dragStart.y });
        };
        const handleUp = () => setIsDragging(false);
        
        if (isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', handleUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        }
    }, [isDragging, dragStart]);

    return (
        <div 
            className={`fixed bg-white dark:bg-slate-900 rounded-xl island-shadow border border-slate-100 dark:border-slate-800 flex flex-col z-30 transition-all duration-300 w-80`}
            style={{ left: pos.x, top: pos.y, maxHeight: isOpen ? '50vh' : '46px' }}
        >
            <div 
                className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center cursor-move select-none"
                onMouseDown={handleDown}
                onTouchStart={handleDown}
            >
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                    <Icon name={icon} size={14} /> {title}
                </span>
                <div 
                    className="cursor-pointer p-1"
                    onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                    onTouchEnd={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                >
                    <Icon name={isOpen ? "ChevronDown" : "ChevronUp"} size={14} className="text-slate-400" />
                </div>
            </div>
            <div className={`overflow-y-auto p-0 ${isOpen ? 'block' : 'hidden'}`}>
                {children}
            </div>
        </div>
    );
};

const TrafficLegend = ({ nodes, edges }) => {
    const legendItems = useMemo(() => {
        return edges.map(edge => {
            const s = nodes.find(n => n.id === edge.source);
            const t = nodes.find(n => n.id === edge.target);
            if (!s || !t) return null;
            const autoLabel = getPortInfo(s.type, t.type);
            const label = (edge.customLabel !== undefined && edge.customLabel !== '') ? edge.customLabel : autoLabel;
            if (!label) return null;
            let dir = "→";
            if (edge.markerStart === 'arrow' && edge.markerEnd === 'arrow') dir = "↔";
            else if (edge.markerStart === 'arrow') dir = "←";
            return { id: edge.id, s: s.label, t: t.label, dir, ports: label };
        }).filter(Boolean);
    }, [nodes, edges]);

    if (legendItems.length === 0) return null;

    return (
        <DraggableWindow title={`Network Traffic (${legendItems.length})`} icon="List" initialPos={{x: window.innerWidth - 350, y: window.innerHeight - 300}}>
             <table className="w-full text-[10px] text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 sticky top-0">
                    <tr><th className="p-2 font-medium w-1/3">Source / Dest</th><th className="p-2 font-medium">Ports & Protocol</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {legendItems.map((item, idx) => (
                        <tr key={`${item.id}-${idx}`} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 align-top">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-bold"><span className="truncate max-w-[90px]" title={item.s}>{item.s}</span></div>
                                    <div className="flex items-center gap-1 text-slate-400"><span>{item.dir}</span><span className="truncate max-w-[90px]" title={item.t}>{item.t}</span></div>
                                </div>
                            </td>
                            <td className="p-2 text-slate-500 dark:text-slate-400 font-mono text-[9px] align-top leading-relaxed">
                                {item.ports.split('/').map((p, i) => (<span key={i} className="block">{p.trim()}</span>))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </DraggableWindow>
    );
};

const ColorLegend = ({ edges, colorLabels, onUpdateLabel }) => {
    const usedColors = useMemo(() => {
        const colors = new Set(edges.map(e => e.color));
        return Array.from(colors);
    }, [edges]);

    if (usedColors.length === 0) return null;

    return (
        <DraggableWindow title="Connection Types" icon="Palette" initialPos={{x: window.innerWidth - 350, y: window.innerHeight - 500}}>
            <div className="p-2 space-y-2">
                {usedColors.map(color => (
                    <div key={color} className="flex items-center gap-2 group">
                        <div className="w-8 h-1 rounded-full shrink-0" style={{ backgroundColor: color }}></div>
                        <input 
                            type="text"
                            className="bg-transparent text-[10px] text-slate-600 dark:text-slate-300 w-full focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-800 rounded px-1"
                            placeholder="Description..."
                            value={colorLabels[color] || ''}
                            onChange={(e) => onUpdateLabel(color, e.target.value)}
                        />
                    </div>
                ))}
            </div>
        </DraggableWindow>
    );
};

// --- STENCIL ACCORDION ---
const StencilPalette = ({ addNode }) => {
    const [expanded, setExpanded] = useState([]);
    const toggle = (id) => setExpanded(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    
    return (
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
            {STENCIL_CATEGORIES.map(cat => (
                <div key={cat.id} className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                    <div 
                        className="p-2 bg-slate-50 dark:bg-slate-800/50 cursor-pointer flex justify-between items-center" 
                        onClick={() => toggle(cat.id)}
                    >
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{cat.name}</span>
                        <Icon name={expanded.includes(cat.id) ? "ChevronUp" : "ChevronDown"} size={14} className="text-slate-400" />
                    </div>
                    <div className={`grid grid-cols-2 gap-2 p-2 bg-white dark:bg-slate-900 transition-all ${expanded.includes(cat.id) ? 'block' : 'hidden'}`}>
                        {cat.items.map(item => (
                            <div 
                                key={item.label} 
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData('application/react-stencil', JSON.stringify(item))}
                                onClick={() => addNode(item)}
                                onTouchEnd={(e) => { e.preventDefault(); addNode(item); }} 
                                className="group flex flex-col items-center gap-1 p-2 rounded-lg border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-all text-center"
                            >
                                <div className={`p-1.5 rounded-md ${item.color.split(' ')[0] ? item.color.split(' ')[1] : 'bg-slate-100'} shadow-sm group-hover:scale-105 transition-transform`}><Icon name={item.icon} size={16} className={item.color.split(' ')[0]} /></div>
                                <span className="text-[9px] font-medium text-slate-600 dark:text-slate-300 leading-tight">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- MAIN APP ---
const App = () => {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('home'); 
    const [designs, setDesigns] = useState([]);
    const [currentDesignId, setCurrentDesignId] = useState(null);
    const [isDark, setIsDark] = useState(false);
    const [designTitle, setDesignTitle] = useState('Untitled Design');
    const [deletedDesignIds, setDeletedDesignIds] = useState([]); 

    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [colorLabels, setColorLabels] = useState({});

    const [bgPattern, setBgPattern] = useState('dots');
    const [selectedId, setSelectedId] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [toolMode, setToolMode] = useState('select');
    
    const [draggedNodeId, setDraggedNodeId] = useState(null);
    const [resizingNodeId, setResizingNodeId] = useState(null);
    const [connectingStartNode, setConnectingStartNode] = useState(null);
    
    const [draggingEdgeHandle, setDraggingEdgeHandle] = useState(null);
    const [draggingLabelId, setDraggingLabelId] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [hoveredNodeId, setHoveredNodeId] = useState(null);
    const [snapSide, setSnapSide] = useState(null);
    const [snapRatio, setSnapRatio] = useState(0.5);
    const [snapGeom, setSnapGeom] = useState(null);

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectionBox, setSelectionBox] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            try {
                if (!window.firebaseModules || typeof __firebase_config === 'undefined') return;
                const { initializeApp, getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, getFirestore } = window.firebaseModules;
                const app = initializeApp(JSON.parse(__firebase_config));
                const auth = getAuth(app);
                window.db = getFirestore(app);
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
                else await signInAnonymously(auth);
                onAuthStateChanged(auth, setUser);
            } catch (e) { console.error(e); }
        };
        init();
    }, []);

    useEffect(() => {
        if (!user || !window.db) return;
        const { collection, query, orderBy, onSnapshot } = window.firebaseModules;
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app';
        const q = query(collection(window.db, 'artifacts', appId, 'users', user.uid, 'designs'), orderBy('updatedAt', 'desc'));
        return onSnapshot(q, (snap) => setDesigns(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, [user]);

    useEffect(() => { document.documentElement.classList.toggle('dark', isDark); }, [isDark]);

    const screenToWorld = (sx, sy) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (sx - rect.left - transform.x) / transform.k,
            y: (sy - rect.top - transform.y) / transform.k
        };
    };
    
    const getClientPos = (e) => {
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX; clientY = e.changedTouches[0].clientY;
        } else {
            clientX = e.clientX; clientY = e.clientY;
        }
        return { x: clientX, y: clientY };
    };

    const createDesign = () => { 
        setNodes([]); setEdges([]); setColorLabels({}); 
        setBgPattern('dots'); setDesignTitle('Untitled Design'); setCurrentDesignId(null); setTransform({x:0, y:0, k:1}); setView('editor'); 
    };
    
    const openDesign = (d) => { 
        setNodes(d.nodes||[]); setEdges(d.edges||[]); setColorLabels(d.colorLabels || {});
        setBgPattern(d.background||'dots'); 
        setDesignTitle(d.title||'Untitled Design'); setCurrentDesignId(d.id); 
        setTransform(d.viewport || {x:0, y:0, k:1});
        setView('editor'); 
    };
    
    const handleJsonUpload = (e) => {
        importFromJson(e, (data) => {
            openDesign({ ...data, id: null }); 
        });
    };
    
    const saveDesign = async () => {
        if (!user || !window.db) { alert("Offline"); return; }
        const { collection, addDoc, updateDoc, doc, serverTimestamp } = window.firebaseModules;
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app';
        const data = { 
            title: designTitle, nodes, edges, colorLabels, background: bgPattern, 
            viewport: transform,
            updatedAt: serverTimestamp() 
        };
        try {
            if (currentDesignId) await updateDoc(doc(window.db, 'artifacts', appId, 'users', user.uid, 'designs', currentDesignId), data);
            else { const res = await addDoc(collection(window.db, 'artifacts', appId, 'users', user.uid, 'designs'), { ...data, createdAt: serverTimestamp() }); setCurrentDesignId(res.id); }
        } catch (e) { console.error("Save failed", e); alert("Save failed"); }
    };

    const deleteDesignSingle = async (e, id) => {
        e.preventDefault(); e.stopPropagation(); 
        if (!confirm("Delete this design?")) return;
        setDeletedDesignIds(prev => [...prev, id]);
        if (!user || !window.db) return;
        const { deleteDoc, doc } = window.firebaseModules;
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app';
        try { await deleteDoc(doc(window.db, 'artifacts', appId, 'users', user.uid, 'designs', id)); } 
        catch (err) { console.error("Delete failed", err); alert("Delete failed. Refreshing..."); setDeletedDesignIds(prev => prev.filter(did => did !== id)); }
    };

    const deleteCurrentDesign = async () => {
        if(!currentDesignId) return;
        if(!confirm("Delete this design and return home?")) return;
        if (!user || !window.db) return;
        const { deleteDoc, doc } = window.firebaseModules;
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app';
        try { await deleteDoc(doc(window.db, 'artifacts', appId, 'users', user.uid, 'designs', currentDesignId)); setView('home'); } catch(err) { console.error("Editor delete failed", err); }
    }

    const renameDesign = async (e, id, current) => {
        e.stopPropagation(); e.preventDefault();
        const newTitle = prompt("New Name:", current);
        if (!newTitle || newTitle === current) return;
        if (!user || !window.db) return;
        const { updateDoc, doc } = window.firebaseModules;
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app';
        try { await updateDoc(doc(window.db, 'artifacts', appId, 'users', user.uid, 'designs', id), { title: newTitle }); } catch (err) { console.error(err); }
    };

    const generateId = () => Math.random().toString(36).substr(2, 9);
    
    const addNodeToCenter = (item) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const isZone = item.type === 'zone';
        const nodeColor = item.defaultColor || '#64748b';
        const nodeOpacity = isZone ? 0.1 : 0.1;
        const w = isZone ? 300 : NODE_WIDTH;
        const h = isZone ? 200 : NODE_HEIGHT;
        
        const cx = rect.width / 2 + rect.left;
        const cy = rect.height / 2 + rect.top;
        const worldPos = screenToWorld(cx, cy);

        setNodes(p => [...p, { id: generateId(), ...item, x: snapToGrid(worldPos.x - w/2), y: snapToGrid(worldPos.y - h/2), w, h, customColor: nodeColor, opacity: nodeOpacity }]);
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/react-stencil');
        if (data) {
            const item = JSON.parse(data);
            const isZone = item.type === 'zone';
            const nodeColor = item.defaultColor || '#64748b';
            const nodeOpacity = isZone ? 0.1 : 0.1;
            const w = isZone ? 300 : NODE_WIDTH;
            const h = isZone ? 200 : NODE_HEIGHT;
            
            const worldPos = screenToWorld(e.clientX, e.clientY);
            
            setNodes(p => [...p, { id: generateId(), ...item, x: snapToGrid(worldPos.x - w/2), y: snapToGrid(worldPos.y - h/2), w, h, customColor: nodeColor, opacity: nodeOpacity }]);
        }
    };

    const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const zoomIntensity = 0.1;
            const direction = e.deltaY > 0 ? -1 : 1;
            const factor = 1 + (direction * zoomIntensity);
            const newK = Math.min(Math.max(0.1, transform.k * factor), 5);
            
            const rect = canvasRef.current.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
            
            const newX = offsetX - (offsetX - transform.x) * (newK / transform.k);
            const newY = offsetY - (offsetY - transform.y) * (newK / transform.k);

            setTransform({ x: newX, y: newY, k: newK });
        } else {
            setTransform(p => ({ ...p, x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    };
    
    const handleZoomBtn = (dir) => {
        const factor = dir === 'in' ? 1.2 : 0.8;
        const newK = Math.min(Math.max(0.1, transform.k * factor), 5);
        const rect = canvasRef.current.getBoundingClientRect();
        const offsetX = rect.width/2; 
        const offsetY = rect.height/2;
        const newX = offsetX - (offsetX - transform.x) * (newK / transform.k);
        const newY = offsetY - (offsetY - transform.y) * (newK / transform.k);
        setTransform({ x: newX, y: newY, k: newK });
    };
    
    const handleResetZoom = () => setTransform({ x: 0, y: 0, k: 1 });

    const duplicateSelection = useCallback(() => {
        if (!selectedId && selectedIds.length === 0) return;
        const idsToClone = selectedId ? [selectedId] : selectedIds;
        const newNodes = [];
        const idMap = {};

        idsToClone.forEach(oldId => {
            const original = nodes.find(n => n.id === oldId);
            if (original) {
                const newId = generateId();
                idMap[oldId] = newId;
                newNodes.push({ ...original, id: newId, x: original.x + 24, y: original.y + 24 });
            }
        });

        setNodes(prev => [...prev, ...newNodes]);
        setSelectedId(null);
        setSelectedType(null);
        setSelectedIds(newNodes.map(n => n.id));
    }, [selectedId, selectedIds, nodes]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                duplicateSelection();
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                handleDelete();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [duplicateSelection]);

    const handleCanvasMouseDown = (e) => {
        const clientPos = getClientPos(e);
        
        if (e.button === 1 || toolMode === 'pan') {
            setIsPanning(true);
            setPanStart({ x: clientPos.x - transform.x, y: clientPos.y - transform.y });
            return;
        }
        
        if (toolMode === 'select' && e.target === canvasRef.current) {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                setSelectedId(null);
                setSelectedType(null);
                setSelectedIds([]);
            }
            
            const worldPos = screenToWorld(clientPos.x, clientPos.y);
            setSelectionBox({ 
                startX: worldPos.x, startY: worldPos.y, 
                currX: worldPos.x, currY: worldPos.y 
            });
        }
    };

    const handleCanvasMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const { x: clientX, y: clientY } = getClientPos(e);
        
        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;

        if (isPanning) {
            setTransform(p => ({ ...p, x: clientX - panStart.x, y: clientY - panStart.y }));
            return;
        }
        
        const worldPos = {
            x: (offsetX - transform.x) / transform.k,
            y: (offsetY - transform.y) / transform.k
        };
        
        if (selectionBox) {
            setSelectionBox(prev => ({ ...prev, currX: worldPos.x, currY: worldPos.y }));
            return;
        }

        const dx = (offsetX - mousePos.x) / transform.k;
        const dy = (offsetY - mousePos.y) / transform.k;
        
        setMousePos({x: offsetX, y: offsetY}); 

        const top = [...nodes].reverse().find(n => 
            worldPos.x >= n.x && worldPos.x <= n.x + n.w && worldPos.y >= n.y && worldPos.y <= n.y + n.h
        );
        setHoveredNodeId(top ? top.id : null);
        
        const isConnecting = draggingEdgeHandle || connectingStartNode;
        
        if (isConnecting && top) {
            const geom = getVisualGeometry(top);
            const snapInfo = getClosestSideAndRatio(geom, worldPos.x, worldPos.y);
            setSnapSide(snapInfo.side);
            setSnapRatio(snapInfo.ratio);
            setSnapGeom(geom);
        } else {
            setSnapSide(null);
            setSnapRatio(0.5); 
            setSnapGeom(null);
        }

        if (draggedNodeId && toolMode === 'select') {
            const isMultiMove = selectedIds.includes(draggedNodeId);
            
            if (isMultiMove) {
                setNodes(prev => prev.map(n => {
                    if (selectedIds.includes(n.id)) {
                        return { ...n, x: n.x + dx, y: n.y + dy };
                    }
                    return n;
                }));
            } else {
                setNodes(p => p.map(n => n.id === draggedNodeId ? { ...n, x: snapToGrid(worldPos.x - n.w/2), y: snapToGrid(worldPos.y - n.h/2) } : n));
            }
        }
        
        if (resizingNodeId) {
            setNodes(p => p.map(n => {
                if (n.id === resizingNodeId) {
                    const minW = GRID_SIZE * 2; 
                    const minH = GRID_SIZE * 2; 
                    const newW = Math.max(minW, (worldPos.x - n.x));
                    const newH = Math.max(minH, (worldPos.y - n.y));
                    return { ...n, w: newW, h: newH }; 
                }
                return n;
            }));
        }

        if (draggingLabelId) {
            setEdges(p => p.map(edge => {
                if (edge.id === draggingLabelId) {
                    return {
                        ...edge,
                        labelOffsetX: (edge.labelOffsetX || 0) + dx,
                        labelOffsetY: (edge.labelOffsetY || 0) + dy
                    };
                }
                return edge;
            }));
        }
    };

    const handleCanvasUp = () => {
        setIsPanning(false);
        
        if (selectionBox) {
            const x1 = Math.min(selectionBox.startX, selectionBox.currX);
            const x2 = Math.max(selectionBox.startX, selectionBox.currX);
            const y1 = Math.min(selectionBox.startY, selectionBox.currY);
            const y2 = Math.max(selectionBox.startY, selectionBox.currY);
            
            const newlySelected = nodes.filter(n => 
                n.x + n.w > x1 && n.x < x2 && n.y + n.h > y1 && n.y < y2
            ).map(n => n.id);
            
            setSelectedIds(prev => [...new Set([...prev, ...newlySelected])]);
            if (newlySelected.length > 0) {
                setSelectedId(null);
                setSelectedType(null);
            }
            
            setSelectionBox(null);
        }

        if (draggedNodeId && selectedIds.includes(draggedNodeId)) {
             setNodes(prev => prev.map(n => {
                if (selectedIds.includes(n.id)) {
                    return { ...n, x: snapToGrid(n.x), y: snapToGrid(n.y) };
                }
                return n;
             }));
        }

        setDraggedNodeId(null); setResizingNodeId(null); setConnectingStartNode(null); setDraggingLabelId(null);
        
        if (connectingStartNode && hoveredNodeId && connectingStartNode !== hoveredNodeId) {
             const newEdge = { 
                 id: generateId(), 
                 source: connectingStartNode, 
                 target: hoveredNodeId, 
                 color: '#64748b', 
                 width: 2, 
                 markerEnd: 'arrow', 
                 markerStart: 'none',
                 targetSide: snapSide,
                 targetRatio: snapRatio
             };
             setEdges(p => [...p, newEdge]);
        }

        if (draggingEdgeHandle && hoveredNodeId) {
            setEdges(p => p.map(e => {
                if (e.id === draggingEdgeHandle.edgeId) {
                    const otherEndNode = draggingEdgeHandle.handleType === 'source' ? e.target : e.source;
                    if (hoveredNodeId !== otherEndNode) {
                        const newEdge = { ...e, [draggingEdgeHandle.handleType]: hoveredNodeId };
                        if (draggingEdgeHandle.handleType === 'source') {
                            newEdge.sourceSide = snapSide;
                            newEdge.sourceRatio = snapRatio;
                        } else {
                            newEdge.targetSide = snapSide;
                            newEdge.targetRatio = snapRatio;
                        }
                        return newEdge;
                    }
                }
                return e;
            }));
        }
        setDraggingEdgeHandle(null);
        setSnapSide(null);
    };

    const handleNodeStart = (e, id) => { 
        e.stopPropagation(); 
        
        if (toolMode === 'connect') {
            setConnectingStartNode(id);
            return;
        } 
        
        if (e.ctrlKey || e.metaKey || e.shiftKey) {
            if (selectedIds.includes(id)) {
                setSelectedIds(prev => prev.filter(i => i !== id));
            } else {
                setSelectedIds(prev => [...prev, id]);
            }
            setSelectedId(null);
            setDraggedNodeId(null);
            return;
        }
        
        if (selectedIds.includes(id)) {
            setDraggedNodeId(id);
        } else {
            setDraggedNodeId(id);
            setSelectedId(id);
            setSelectedType('node');
            setSelectedIds([]);
        }
    };
    
    const handleResizeStart = (e, id) => { 
        e.stopPropagation(); 
        setResizingNodeId(id); 
        setSelectedId(id); 
        setSelectedIds([]);
    };
    
    const handleLabelStart = (e, edgeId) => {
        e.stopPropagation();
        setDraggingLabelId(edgeId);
        setSelectedId(edgeId);
        setSelectedType('edge');
        setSelectedIds([]);
    };
    
    const handleNodeEnd = (e, id) => {};
    
    const updateNode = (k, v) => {
        if (selectedId) {
            setNodes(p => p.map(n => n.id === selectedId ? { ...n, [k]: v } : n));
        }
        if (selectedIds.length > 0 && (k === 'customColor' || k === 'opacity')) {
             setNodes(p => p.map(n => selectedIds.includes(n.id) ? { ...n, [k]: v } : n));
        }
    };
    
    const updateEdge = (k, v) => setEdges(p => p.map(e => e.id === selectedId ? { ...e, [k]: v } : e));
    
    const handleDelete = () => {
        if (selectedIds.length > 0) {
             setNodes(p => p.filter(n => !selectedIds.includes(n.id)));
             setEdges(p => p.filter(e => !selectedIds.includes(e.source) && !selectedIds.includes(e.target)));
             setSelectedIds([]);
        } else if(selectedId) {
             if(selectedType === 'node') { 
                 setNodes(p => p.filter(n => n.id !== selectedId)); 
                 setEdges(p => p.filter(e => e.source !== selectedId && e.target !== selectedId)); 
            } else {
                setEdges(p => p.filter(e => e.id !== selectedId));
            }
            setSelectedId(null);
        }
    };

    const transformStyle = {
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
        transformOrigin: '0 0',
        width: '100%',
        height: '100%'
    };
    
    const getBgSize = () => {
        if (bgPattern === 'pixels') return 12; 
        return 24; 
    };

    const bgSize = getBgSize() * transform.k;
    
    const bgStyle = {
        backgroundPosition: `${transform.x}px ${transform.y}px`,
        backgroundSize: `${bgSize}px ${bgSize}px`
    };
    
    const wrapText = (text, maxCharsPerLine = 30) => {
        if (!text) return [];
        const parts = text.split('/').map(s => s.trim());
        return parts;
    };

    const renderConnectors = () => (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 20 }}>
            <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-slate-500 dark:text-slate-400" /></marker>
                <marker id="circle" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><circle cx="5" cy="5" r="5" fill="currentColor" className="text-slate-500 dark:text-slate-400" /></marker>
            </defs>
            {edges.map(edge => {
                const s = nodes.find(n => n.id === edge.source);
                const t = nodes.find(n => n.id === edge.target);
                if (!s || !t) return null;

                const isMod = draggingEdgeHandle && draggingEdgeHandle.edgeId === edge.id;
                let sPt, tPt, sA, sB;
                
                if (isMod) {
                    const worldMouse = {
                        x: (mousePos.x - transform.x) / transform.k,
                        y: (mousePos.y - transform.y) / transform.k
                    };
                    
                    if (draggingEdgeHandle.handleType === 'source') { 
                        let geomT;
                        if (snapGeom && hoveredNodeId === t.id) geomT = snapGeom;
                        else geomT = getVisualGeometry(t);
                        if (snapSide) tPt = getPointOnNode(t, snapSide, snapRatio);
                        else tPt = {x: geomT.cx, y: geomT.cy};
                        sPt = worldMouse; 
                    } else { 
                        let geomS;
                        if (snapGeom && hoveredNodeId === s.id) geomS = snapGeom;
                        else geomS = getVisualGeometry(s);
                        if (snapSide) sPt = getPointOnNode(s, snapSide, snapRatio);
                        else sPt = {x: geomS.cx, y: geomS.cy};
                        tPt = worldMouse; 
                    }
                } else {
                    const c = getBestConnection(s, t, edge.sourceSide, edge.targetSide); 
                    const sRatio = edge.sourceRatio !== undefined ? edge.sourceRatio : 0.5;
                    const tRatio = edge.targetRatio !== undefined ? edge.targetRatio : 0.5;
                    sPt = getPointOnNode(s, c.sideA, sRatio);
                    tPt = getPointOnNode(t, c.sideB, tRatio);
                    sA = c.sideA; sB = c.sideB;
                }
                const isSel = selectedId === edge.id, color = isSel ? '#3b82f6' : (isDark ? (edge.color === '#64748b' ? '#94a3b8' : edge.color) : edge.color);
                const pathD = isMod ? `M ${sPt.x} ${sPt.y} L ${tPt.x} ${tPt.y}` : getPath(sPt, tPt, sA, sB);
                const label = edge.customLabel || getPortInfo(s.type, t.type) || "";
                
                let lx, ly;
                if(!isMod && (sA === 'left' || sA === 'right')) { lx = (sPt.x + tPt.x)/2; ly = sPt.y; } else { lx = (sPt.x + tPt.x)/2; ly = (sPt.y + tPt.y)/2; }
                
                if (edge.labelOffsetX) lx += edge.labelOffsetX;
                if (edge.labelOffsetY) ly += edge.labelOffsetY;

                const lines = wrapText(label);
                const lineHeight = 12; 
                const padding = 6;
                const maxChars = Math.max(...lines.map(l => l.length), 0);
                const txtW = maxChars * 5.5 + padding * 2; 
                const txtH = lines.length * lineHeight + padding;
                
                return (
                    <g key={edge.id} className="pointer-events-auto group" onClick={(e) => { e.stopPropagation(); setSelectedId(edge.id); setSelectedType('edge'); }}>
                        <path d={pathD} fill="none" stroke="transparent" strokeWidth={20} className="connector-hit" />
                        <path d={pathD} fill="none" stroke={color} strokeWidth={edge.width} strokeLinecap="round" strokeLinejoin="round" markerEnd={!isMod && edge.markerEnd === 'arrow' ? `url(#arrow)` : undefined} markerStart={!isMod && edge.markerStart === 'arrow' ? `url(#arrow)` : undefined} strokeDasharray={isMod ? "5,5" : ""} />
                        {isSel && !isMod && (
                            <>
                                <circle cx={sPt.x} cy={sPt.y} r={4} className="edge-handle" 
                                    onMouseDown={(e) => { e.stopPropagation(); setDraggingEdgeHandle({ edgeId: edge.id, handleType: 'source' }); }} 
                                    onTouchStart={(e) => { e.stopPropagation(); setDraggingEdgeHandle({ edgeId: edge.id, handleType: 'source' }); }} 
                                />
                                <circle cx={tPt.x} cy={tPt.y} r={4} className="edge-handle" 
                                    onMouseDown={(e) => { e.stopPropagation(); setDraggingEdgeHandle({ edgeId: edge.id, handleType: 'target' }); }} 
                                    onTouchStart={(e) => { e.stopPropagation(); setDraggingEdgeHandle({ edgeId: edge.id, handleType: 'target' }); }} 
                                />
                            </>
                        )}
                        {label && !isMod && (
                            <g transform={`translate(${lx}, ${ly})`} className="port-label-group" 
                               onMouseDown={(e) => handleLabelStart(e, edge.id)}
                               onTouchStart={(e) => handleLabelStart(e, edge.id)}
                            >
                                <rect 
                                    x={-(txtW/2)} 
                                    y={-(txtH/2)} 
                                    width={txtW} 
                                    height={txtH} 
                                    className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700 stroke-1 rx-1 drop-shadow-sm" 
                                />
                                <text 
                                    y={-(txtH/2) + padding + 3} 
                                    className="port-label fill-slate-600 dark:fill-slate-300"
                                    textAnchor="middle"
                                >
                                    {lines.map((line, i) => (
                                        <tspan x="0" dy={i === 0 ? 0 : lineHeight} key={i}>{line}</tspan>
                                    ))}
                                </text>
                            </g>
                        )}
                    </g>
                );
            })}
            {connectingStartNode && (() => { const s = nodes.find(n => n.id === connectingStartNode); if (!s) return null; const g = getVisualGeometry(s); const wm = { x: (mousePos.x - transform.x) / transform.k, y: (mousePos.y - transform.y) / transform.k }; return <path d={`M ${g.cx} ${g.cy} L ${wm.x} ${wm.y}`} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />; })()}
        </svg>
    );

    const visibleDesigns = designs.filter(d => !deletedDesignIds.includes(d.id));

    // Continue in next part...
    return view === 'home' ? renderHome() : renderEditor();
    
    function renderHome() {
        return (
            <div className="h-full w-full bg-slate-50 dark:bg-slate-950 flex flex-col overflow-y-auto transition-colors duration-300">
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-3"><div className="bg-blue-600 p-1.5 rounded-lg text-white"><Icon name="DraftingCompass" size={20} /></div><h1 className="font-bold text-xl tracking-tight dark:text-white hidden sm:block">Horizon<span className="font-normal text-slate-500">Designer</span></h1></div>
                    <div className="flex items-center gap-4">
                        <label className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer" title="Import JSON">
                            <Icon name="Upload" size={20} />
                            <input type="file" accept=".json" className="hidden" onChange={handleJsonUpload} ref={fileInputRef} />
                        </label>
                        <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"><Icon name={isDark ? "Sun" : "Moon"} size={20} /></button>
                    </div>
                </header>
                <div className="max-w-6xl mx-auto w-full p-4 sm:p-8">
                    <div className="flex justify-between items-center mb-8"><h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Recent Designs</h2><button onClick={createDesign} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"><Icon name="Plus" size={18} /> New</button></div>
                    {visibleDesigns.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"><div className="text-slate-300 dark:text-slate-600 mb-4 flex justify-center"><Icon name="FolderOpen" size={48} /></div><p className="text-slate-500 dark:text-slate-400">No designs found. Create one!</p></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {visibleDesigns.map(d => (
                                <div key={d.id} onClick={() => openDesign(d)} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all relative">
                                    <div className="h-32 bg-slate-50 dark:bg-slate-800 rounded-lg mb-4 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                        {deletedDesignIds.includes(d.id) && (
                                            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-50 rounded-xl"><span className="text-red-500 font-bold text-sm animate-pulse">Deleting...</span></div>
                                        )}
                                        <div className="flex gap-2 opacity-50 grayscale group-hover:grayscale-0 transition-all"><div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-md"></div><div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-md mt-4"></div><div className="w-1 bg-slate-300 h-8 mt-2"></div></div>
                                    </div>
                                    <h3 className="font-bold text-slate-700 dark:text-slate-200 truncate pr-16">{d.title || "Untitled Design"}</h3>
                                    <p className="text-xs text-slate-400 mt-1">Edited {d.updatedAt?.toDate().toLocaleDateString() || "Just now"}</p>
                                    <div className="absolute top-4 right-4 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <button onClick={(e) => renameDesign(e, d.id, d.title)} className="text-slate-400 hover:text-blue-500 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Rename"><Icon name="Pencil" size={16} /></button>
                                        <button onClick={(e) => deleteDesignSingle(e, d.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Delete"><Icon name="Trash2" size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    function renderEditor() {
        return (
            <div className={`flex h-full flex-col relative bg-slate-50 dark:bg-slate-950 transition-colors duration-300 touch-none`}>
                <div className="absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 w-[95%] sm:w-auto justify-center">
                    <div className="bg-white dark:bg-slate-900 rounded-xl island-shadow px-2 sm:px-3 py-2 flex items-center gap-2 sm:gap-4 border border-slate-100 dark:border-slate-800 overflow-x-auto max-w-full">
                        <button onClick={() => setView('home')} className="text-slate-400 hover:text-slate-700 dark:hover:text-white pr-2 border-r border-slate-100 dark:border-slate-800"><Icon name="Home" size={18} /></button>
                        <input type="text" value={designTitle} onChange={(e) => setDesignTitle(e.target.value)} className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-b border-blue-500 w-24 sm:w-40" placeholder="Untitled Design" />
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg shrink-0">
                            <button onClick={() => setToolMode('select')} className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${toolMode === 'select' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}><Icon name="MousePointer2" size={16} /></button>
                            <button onClick={() => setToolMode('pan')} className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${toolMode === 'pan' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}><Icon name="Hand" size={16} /></button>
                            <button onClick={() => setToolMode('connect')} className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${toolMode === 'connect' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}><Icon name="Zap" size={16} /></button>
                        </div>
                        <div className="hidden sm:flex items-center border-l border-slate-100 dark:border-slate-800 pl-4">
                            <select value={bgPattern} onChange={(e) => setBgPattern(e.target.value)} className="bg-transparent text-xs font-medium text-slate-500 dark:text-slate-400 outline-none cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
                                <option value="dots">Dots</option><option value="grid">Grid</option><option value="pixels">Pixels</option><option value="clear">Clear</option>
                            </select>
                        </div>
                        <button onClick={() => setIsDark(!isDark)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><Icon name={isDark ? "Sun" : "Moon"} size={18} /></button>
                        
                        <div className="flex items-center gap-1 border-l border-slate-100 dark:border-slate-800 pl-2 ml-2">
                            <button onClick={() => exportToJson({ title: designTitle, nodes, edges, colorLabels, background: bgPattern, viewport: transform })} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5" title="Export JSON"><Icon name="Download" size={18} /></button>
                            <button onClick={() => exportToPdf(designTitle, nodes, edges, transform, colorLabels)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5" title="Export PDF"><Icon name="FileText" size={18} /></button>
                            <button onClick={saveDesign} className="ml-1 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg transition-colors"><Icon name="Save" size={16} /></button>
                        </div>
                        
                        <button onClick={deleteCurrentDesign} className="text-slate-400 hover:text-red-500 ml-2" title="Delete Design"><Icon name="Trash2" size={18} /></button>
                    </div>
                </div>
                
                <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-lg island-shadow border border-slate-100 dark:border-slate-800 p-1 flex flex-col gap-1">
                        <button onClick={() => handleZoomBtn('in')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded"><Icon name="Plus" size={16} /></button>
                        <button onClick={() => handleZoomBtn('out')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded"><Icon name="Minus" size={16} /></button>
                        <button onClick={handleResetZoom} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded" title="Reset"><Icon name="Maximize" size={16} /></button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="absolute top-24 left-6 w-60 z-40 flex flex-col pointer-events-none hidden sm:flex">
                        <div className="bg-white dark:bg-slate-900 rounded-xl island-shadow border border-slate-100 dark:border-slate-800 flex flex-col h-[70vh] pointer-events-auto overflow-hidden">
                            <div className="p-2 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between">
                                <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Components (Tap to Add)</h3>
                            </div>
                            <StencilPalette addNode={addNodeToCenter} />
                        </div>
                    </div>
                    <main 
                        className={`flex-1 relative overflow-hidden bg-slate-50 dark:bg-slate-950 cursor-default bg-pattern-${bgPattern}`}
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                        onMouseMove={handleCanvasMove}
                        onMouseUp={handleCanvasUp}
                        onMouseDown={handleCanvasMouseDown}
                        onWheel={handleWheel}
                        onTouchMove={handleCanvasMove}
                        onTouchEnd={handleCanvasUp}
                        onTouchStart={handleCanvasMouseDown}
                        ref={canvasRef}
                        style={bgStyle}
                    >
                        <div style={transformStyle} className="canvas-world">
                            <TrafficLegend nodes={nodes} edges={edges} />
                            <ColorLegend edges={edges} colorLabels={colorLabels} onUpdateLabel={(c, val) => setColorLabels(prev => ({ ...prev, [c]: val }))} />
                            
                            {selectionBox && (
                                <div 
                                    className="selection-box"
                                    style={{
                                        left: Math.min(selectionBox.startX, selectionBox.currX),
                                        top: Math.min(selectionBox.startY, selectionBox.currY),
                                        width: Math.abs(selectionBox.currX - selectionBox.startX),
                                        height: Math.abs(selectionBox.currY - selectionBox.startY)
                                    }}
                                />
                            )}

                            {renderConnectors()}
                            {nodes.map(node => {
                                const isZone = node.type === 'zone';
                                const boxSize = Math.min(node.w, node.h) * 0.4;
                                const isSelected = selectedId === node.id || selectedIds.includes(node.id);
                                
                                return (
                                <div 
                                    key={node.id} 
                                    style={{ left: node.x, top: node.y, width: node.w, height: node.h, zIndex: isZone ? 1 : 10 }} 
                                    className={`absolute group select-none ${toolMode === 'connect' ? 'cursor-crosshair' : (isZone ? 'cursor-move' : 'cursor-grab active:cursor-grabbing node-container')}`} 
                                    onMouseDown={(e) => handleNodeStart(e, node.id)} 
                                    onMouseUp={(e) => handleNodeEnd(e, node.id)}
                                    onTouchStart={(e) => handleNodeStart(e, node.id)}
                                    onTouchEnd={(e) => handleNodeEnd(e, node.id)}
                                >
                                    {isZone ? (
                                        <div 
                                            className={`w-full h-full rounded-lg zone-container relative p-2 ${isSelected ? 'zone-selected' : ''}`}
                                            style={{ backgroundColor: hexToRgba(node.customColor || '#64748b', node.opacity || 0.1), borderColor: node.customColor || '#64748b' }}
                                        >
                                            <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-2" style={{ color: node.customColor || '#64748b' }}>
                                                <Icon name={node.icon} size={14} color={node.customColor} /> {node.label}
                                            </div>
                                            {hoveredNodeId === node.id && (draggingEdgeHandle || connectingStartNode) && snapSide && (
                                                <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
                                                    {snapSide === 'top' && <circle cx="50%" cy="0" r="4" className="snap-dot" />}
                                                    {snapSide === 'bottom' && <circle cx="50%" cy="100%" r="4" className="snap-dot" />}
                                                    {snapSide === 'left' && <circle cx="0" cy="50%" r="4" className="snap-dot" />}
                                                    {snapSide === 'right' && <circle cx="100%" cy="50%" r="4" className="snap-dot" />}
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div 
                                                    className="resize-handle" 
                                                    onMouseDown={(e) => handleResizeStart(e, node.id)}
                                                    onTouchStart={(e) => handleResizeStart(e, node.id)}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`h-full w-full flex flex-col items-center justify-start p-2 gap-2 ${isSelected ? 'node-selected' : ''}`}>
                                            <div className="icon-box rounded-lg flex items-center justify-center shrink-0 shadow-sm mt-1 transition-all" style={{ width: boxSize, height: boxSize, backgroundColor: hexToRgba(node.customColor || '#64748b', node.opacity || 0.1) }}>
                                                <Icon name={node.icon} size={boxSize * 0.6} color={node.customColor || '#64748b'} />
                                            </div>
                                            <div className="w-full text-center px-1"><div className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 leading-tight line-clamp-2">{node.label}</div></div>
                                            {isSelected && (
                                                <div 
                                                    className="resize-handle" 
                                                    onMouseDown={(e) => handleResizeStart(e, node.id)}
                                                    onTouchStart={(e) => handleResizeStart(e, node.id)}
                                                />
                                            )}
                                            
                                            {hoveredNodeId === node.id && (draggingEdgeHandle || connectingStartNode) && snapSide && (
                                                <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
                                                    {snapSide === 'top' && <svg className="absolute w-full h-full overflow-visible"><circle cx="50%" cy="0" r="4" className="snap-dot" /></svg>}
                                                    {snapSide === 'bottom' && <svg className="absolute w-full h-full overflow-visible"><circle cx="50%" cy="100%" r="4" className="snap-dot" /></svg>}
                                                    {snapSide === 'left' && <svg className="absolute w-full h-full overflow-visible"><circle cx="0" cy="50%" r="4" className="snap-dot" /></svg>}
                                                    {snapSide === 'right' && <svg className="absolute w-full h-full overflow-visible"><circle cx="100%" cy="50%" r="4" className="snap-dot" /></svg>}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    </main>
                    {selectedId && !selectedIds.length && (
                        <div className="absolute top-24 right-6 w-64 z-40 animate-[slideIn_0.2s_ease-out] hidden sm:block">
                            <div className="bg-white dark:bg-slate-900 rounded-xl island-shadow border border-slate-100 dark:border-slate-800 overflow-hidden">
                                <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{selectedType === 'node' ? 'Properties' : 'Connection'}</span>
                                    <button onClick={handleDelete} className="text-slate-400 hover:text-red-500"><Icon name="Trash" size={14} /></button>
                                </div>
                                <div className="p-4 space-y-4">
                                    {selectedType === 'node' && (
                                        <>
                                            <div><label className="block text-[10px] font-bold text-slate-400 mb-1">LABEL</label><input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400 text-slate-700 dark:text-slate-200" value={nodes.find(n => n.id === selectedId)?.label || ''} onChange={(e) => updateNode('label', e.target.value)} /></div>
                                            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                                                <label className="block text-[10px] font-bold text-slate-400 mb-2">STYLE</label>
                                                <div className="grid grid-cols-7 gap-2 mb-3">
                                                    {POPULAR_COLORS.map(c => (
                                                        <button key={c} className={`w-6 h-6 rounded-full border-2 transition-transform ${nodes.find(n => n.id === selectedId)?.customColor === c ? 'border-slate-600 scale-110' : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: c }} onClick={() => updateNode('customColor', c)} title={c} />
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden relative shadow-sm">
                                                        <input type="color" value={nodes.find(n => n.id === selectedId)?.customColor || '#64748b'} onChange={(e) => updateNode('customColor', e.target.value)} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0" />
                                                    </div>
                                                    <span className="text-xs text-slate-500 font-mono">{nodes.find(n => n.id === selectedId)?.customColor}</span>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Opacity</span><span>{Math.round((nodes.find(n => n.id === selectedId)?.opacity || 0.1) * 100)}%</span></div>
                                                    <input type="range" min="0" max="1" step="0.1" value={nodes.find(n => n.id === selectedId)?.opacity || 0.1} onChange={(e) => updateNode('opacity', parseFloat(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {selectedType === 'edge' && (() => {
                                        const edge = edges.find(e => e.id === selectedId);
                                        if(!edge) return null;
                                        const s = nodes.find(n => n.id === edge.source), t = nodes.find(n => n.id === edge.target);
                                        const auto = (s && t) ? getPortInfo(s.type, t.type) : '';
                                        return (
                                            <>
                                                <div><label className="block text-[10px] font-bold text-slate-400 mb-1">PORTS / LABEL</label><input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400 text-slate-700 dark:text-slate-200" placeholder={auto || "Custom Label"} value={edge.customLabel !== undefined ? edge.customLabel : ''} onChange={(e) => updateEdge('customLabel', e.target.value)} /></div>
                                                <div><label className="block text-[10px] font-bold text-slate-400 mb-2">DIRECTION</label><div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg"><button className={`flex-1 py-1 rounded text-xs font-medium transition-all ${edge.markerEnd === 'none' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => { updateEdge('markerStart', 'none'); updateEdge('markerEnd', 'none'); }}>None</button><button className={`flex-1 py-1 rounded text-xs font-medium transition-all ${edge.markerEnd === 'arrow' && edge.markerStart === 'none' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => { updateEdge('markerStart', 'none'); updateEdge('markerEnd', 'arrow'); }}>→</button><button className={`flex-1 py-1 rounded text-xs font-medium transition-all ${edge.markerStart === 'arrow' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => { updateEdge('markerStart', 'arrow'); updateEdge('markerEnd', 'arrow'); }}>↔</button></div></div>
                                                <div><label className="block text-[10px] font-bold text-slate-400 mb-2">COLOR</label><div className="flex flex-wrap gap-2">{['#64748b', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'].map(c => (<button key={c} className={`w-6 h-6 rounded-full border-2 transition-transform ${edge.color === c ? 'border-slate-400 scale-110' : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: c }} onClick={() => updateEdge('color', c)} />))}</div></div>
                                            </>
                                        )
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}
                    {selectedIds.length > 0 && (
                         <div className="absolute top-24 right-6 w-64 z-40 animate-[slideIn_0.2s_ease-out] hidden sm:block">
                            <div className="bg-white dark:bg-slate-900 rounded-xl island-shadow border border-slate-100 dark:border-slate-800 overflow-hidden">
                                <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{selectedIds.length} Items Selected</span>
                                    <button onClick={handleDelete} className="text-slate-400 hover:text-red-500"><Icon name="Trash" size={14} /></button>
                                </div>
                                <div className="p-4">
                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                                        <label className="block text-[10px] font-bold text-slate-400 mb-2">STYLE (ALL)</label>
                                        <div className="grid grid-cols-7 gap-2 mb-3">
                                            {POPULAR_COLORS.map(c => (
                                                <button key={c} className={`w-6 h-6 rounded-full border-2 transition-transform border-transparent hover:scale-110`} style={{ backgroundColor: c }} onClick={() => updateNode('customColor', c)} title={c} />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden relative shadow-sm">
                                                <input type="color" onChange={(e) => updateNode('customColor', e.target.value)} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0" />
                                            </div>
                                            <span className="text-xs text-slate-500 font-mono">Custom</span>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Opacity</span></div>
                                            <input type="range" min="0" max="1" step="0.1" onChange={(e) => updateNode('opacity', parseFloat(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                         </div>
                    )}
                    {selectedId && !selectedIds.length && (
                         <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-50 sm:hidden flex flex-col gap-4 rounded-t-xl island-shadow">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Properties</span>
                                <button onClick={handleDelete} className="text-red-500 p-2"><Icon name="Trash2" size={20} /></button>
                            </div>
                            {selectedType === 'node' && (
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-100 dark:bg-slate-800 p-2 rounded text-sm text-slate-800 dark:text-slate-200" 
                                    value={nodes.find(n => n.id === selectedId)?.label || ''} 
                                    onChange={(e) => updateNode('label', e.target.value)} 
                                />
                            )}
                         </div>
                    )}
                </div>
            </div>
        );
    }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);


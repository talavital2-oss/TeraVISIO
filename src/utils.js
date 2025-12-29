import { GRID_SIZE } from './constants';

// --- HELPER: Hex to RGBA ---
export const hexToRgba = (hex, alpha) => {
    if (!hex) return `rgba(100, 116, 139, ${alpha})`; 
    let c = hex.substring(1).split('');
    if(c.length== 3){
        c= [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c= '0x'+c.join('');
    return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
};

export const snapToGrid = (val) => Math.round(val / GRID_SIZE) * GRID_SIZE;

export const getPortInfo = (s, t) => {
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

export const getVisualGeometry = (node) => {
     if (node.type === 'zone') {
         return { cx: node.x + node.w/2, cy: node.y + node.h/2, w: node.w, h: node.h };
     } else {
         const boxSize = Math.min(node.w, node.h) * 0.4;
         const cx = node.x + node.w/2;
         const cy = node.y + 12 + boxSize/2;
         return { cx, cy, w: boxSize, h: boxSize };
     }
};

export const getAnchors = (geom) => ({
    top:    { x: geom.cx, y: geom.cy - geom.h/2 },
    bottom: { x: geom.cx, y: geom.cy + geom.h/2 },
    left:   { x: geom.cx - geom.w/2, y: geom.cy },
    right:  { x: geom.cx + geom.w/2, y: geom.cy }
});

export const getPointOnNode = (node, side, ratio) => {
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

export const getBestConnection = (nA, nB, overrideSideA, overrideSideB) => {
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

export const getPath = (s, e, sA, sB) => {
    const mx = (s.x+e.x)/2, my = (s.y+e.y)/2;
    if (Math.abs(s.x - e.x) < 10) return `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
    if (Math.abs(s.y - e.y) < 10) return `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
    if ((sA === 'bottom' && sB === 'top') || (sA === 'top' && sB === 'bottom')) return `M ${s.x} ${s.y} L ${s.x} ${my} L ${e.x} ${my} L ${e.x} ${e.y}`;
    if ((sA === 'right' && sB === 'left') || (sA === 'left' && sB === 'right')) return `M ${s.x} ${s.y} L ${mx} ${s.y} L ${mx} ${e.y} L ${e.x} ${e.y}`;
    return `M ${s.x} ${s.y} L ${e.x} ${s.y} L ${e.x} ${e.y}`;
};

export const getClosestSideAndRatio = (geom, x, y) => {
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

export const generateId = () => Math.random().toString(36).substr(2, 9);

// --- EXPORT FUNCTIONS ---
export const exportToJson = (design) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(design));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", (design.title || "design") + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

export const importFromJson = (e, onLoad) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
        const parsed = JSON.parse(e.target.result);
        onLoad(parsed);
    };
};

export const exportToPdf = async (designTitle, nodes, edges, transform, colorLabels) => {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const html2canvas = (await import('html2canvas')).default;
    
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
        const canvas = await html2canvas(canvasEl, { 
            scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true,
            x: 0, y: 0, width: width, height: height, windowWidth: width, windowHeight: height
        });
         
        canvasEl.style.width = originalWidth;
        canvasEl.style.height = originalHeight;
        canvasEl.style.transform = originalTransform;
        originalStyles.forEach(item => item.el.style.display = item.display);

        const imgData = canvas.toDataURL('image/png');
         
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


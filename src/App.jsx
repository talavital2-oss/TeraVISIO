import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from './components/Icon';
import StencilPalette from './components/StencilPalette';
import TrafficLegend from './components/TrafficLegend';
import ColorLegend from './components/ColorLegend';
import { NODE_WIDTH, NODE_HEIGHT, GRID_SIZE, POPULAR_COLORS } from './constants';
import { 
    hexToRgba, snapToGrid, getPortInfo, getVisualGeometry, 
    getPointOnNode, getBestConnection, getPath, getClosestSideAndRatio,
    generateId, exportToJson, importFromJson, exportToPdf
} from './utils';

const App = () => {
    const [view, setView] = useState('home'); 
    const [designs, setDesigns] = useState([]);
    const [currentDesignId, setCurrentDesignId] = useState(null);
    const [isDark, setIsDark] = useState(false);
    const [designTitle, setDesignTitle] = useState('Untitled Design');

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

    const [selectionBox, setSelectionBox] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // Load saved designs from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('horizon-designs');
        if (saved) {
            try {
                setDesigns(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load designs', e);
            }
        }
    }, []);

    // Save designs to localStorage
    const saveDesignsToStorage = (updatedDesigns) => {
        localStorage.setItem('horizon-designs', JSON.stringify(updatedDesigns));
        setDesigns(updatedDesigns);
    };

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
    
    const saveDesign = () => {
        const data = { 
            title: designTitle, nodes, edges, colorLabels, background: bgPattern, 
            viewport: transform,
            updatedAt: new Date().toISOString()
        };
        
        if (currentDesignId) {
            const updated = designs.map(d => d.id === currentDesignId ? { ...d, ...data } : d);
            saveDesignsToStorage(updated);
        } else {
            const newId = generateId();
            const newDesign = { ...data, id: newId, createdAt: new Date().toISOString() };
            saveDesignsToStorage([newDesign, ...designs]);
            setCurrentDesignId(newId);
        }
    };

    const deleteDesignSingle = (e, id) => {
        e.preventDefault(); e.stopPropagation(); 
        if (!confirm("Delete this design?")) return;
        const updated = designs.filter(d => d.id !== id);
        saveDesignsToStorage(updated);
    };

    const deleteCurrentDesign = () => {
        if(!currentDesignId) return;
        if(!confirm("Delete this design and return home?")) return;
        const updated = designs.filter(d => d.id !== currentDesignId);
        saveDesignsToStorage(updated);
        setView('home');
    };

    const renameDesign = (e, id, current) => {
        e.stopPropagation(); e.preventDefault();
        const newTitle = prompt("New Name:", current);
        if (!newTitle || newTitle === current) return;
        const updated = designs.map(d => d.id === id ? { ...d, title: newTitle } : d);
        saveDesignsToStorage(updated);
    };
    
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

        idsToClone.forEach(oldId => {
            const original = nodes.find(n => n.id === oldId);
            if (original) {
                const newId = generateId();
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

        setDraggedNodeId(null); setResizingNodeId(null); setDraggingLabelId(null);
        
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
        setConnectingStartNode(null);

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
    
    const wrapText = (text) => {
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

    if (view === 'home') {
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
                    {designs.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"><div className="text-slate-300 dark:text-slate-600 mb-4 flex justify-center"><Icon name="FolderOpen" size={48} /></div><p className="text-slate-500 dark:text-slate-400">No designs found. Create one!</p></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {designs.map(d => (
                                <div key={d.id} onClick={() => openDesign(d)} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all relative">
                                    <div className="h-32 bg-slate-50 dark:bg-slate-800 rounded-lg mb-4 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                        <div className="flex gap-2 opacity-50 grayscale group-hover:grayscale-0 transition-all"><div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-md"></div><div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-md mt-4"></div><div className="w-1 bg-slate-300 h-8 mt-2"></div></div>
                                    </div>
                                    <h3 className="font-bold text-slate-700 dark:text-slate-200 truncate pr-16">{d.title || "Untitled Design"}</h3>
                                    <p className="text-xs text-slate-400 mt-1">Edited {d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : "Just now"}</p>
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
                                onTouchStart={(e) => handleNodeStart(e, node.id)}
                            >
                                {isZone ? (
                                    <div 
                                        className={`w-full h-full rounded-lg zone-container relative p-2 ${isSelected ? 'zone-selected' : ''}`}
                                        style={{ backgroundColor: hexToRgba(node.customColor || '#64748b', node.opacity || 0.1), borderColor: node.customColor || '#64748b' }}
                                    >
                                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-2" style={{ color: node.customColor || '#64748b' }}>
                                            <Icon name={node.icon} size={14} color={node.customColor} /> {node.label}
                                        </div>
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
            </div>
        </div>
    );
};

export default App;


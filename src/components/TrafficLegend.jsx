import { useMemo } from 'react';
import DraggableWindow from './DraggableWindow';
import { getPortInfo } from '../utils';

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
        <DraggableWindow title={`Network Traffic (${legendItems.length})`} icon="List" initialPos={{x: typeof window !== 'undefined' ? window.innerWidth - 350 : 100, y: typeof window !== 'undefined' ? window.innerHeight - 300 : 100}}>
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

export default TrafficLegend;


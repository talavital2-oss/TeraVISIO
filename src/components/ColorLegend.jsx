import { useMemo } from 'react';
import DraggableWindow from './DraggableWindow';

const ColorLegend = ({ edges, colorLabels, onUpdateLabel }) => {
    const usedColors = useMemo(() => {
        const colors = new Set(edges.map(e => e.color));
        return Array.from(colors);
    }, [edges]);

    if (usedColors.length === 0) return null;

    return (
        <DraggableWindow title="Connection Types" icon="Palette" initialPos={{x: typeof window !== 'undefined' ? window.innerWidth - 350 : 100, y: typeof window !== 'undefined' ? window.innerHeight - 500 : 100}}>
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

export default ColorLegend;


import { useState } from 'react';
import Icon from './Icon';
import { STENCIL_CATEGORIES } from '../constants';

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
                                <div className={`p-1.5 rounded-md ${item.color.split(' ')[0] ? item.color.split(' ')[1] : 'bg-slate-100'} shadow-sm group-hover:scale-105 transition-transform`}>
                                    <Icon name={item.icon} size={16} className={item.color.split(' ')[0]} />
                                </div>
                                <span className="text-[9px] font-medium text-slate-600 dark:text-slate-300 leading-tight">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StencilPalette;


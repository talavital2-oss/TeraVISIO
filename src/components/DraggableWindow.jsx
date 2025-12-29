import { useState, useEffect } from 'react';
import Icon from './Icon';

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

export default DraggableWindow;


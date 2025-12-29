import * as icons from 'lucide-react';

const Icon = ({ name, size = 20, color = "currentColor", className = "" }) => {
    const LucideIcon = icons[name];
    if (!LucideIcon) {
        return <span className="flex items-center justify-center shrink-0" style={{ width: size, height: size }} />;
    }
    return <LucideIcon size={size} color={color} className={className} />;
};

export default Icon;


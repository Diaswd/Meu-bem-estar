import React, { useState, ReactNode } from 'react';
import { ChevronRightIcon } from './icons/Icons';

interface AccordionProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-ui-card backdrop-blur-xl border border-ui-card-border rounded-3xl shadow-lg mb-6 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-4 flex justify-between items-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
                <h2 className="text-lg font-bold text-ui-text-primary">{title}</h2>
                <ChevronRightIcon
                    className={`w-6 h-6 text-brand-primary transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
                />
            </button>
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="p-4 border-t border-ui-card-border">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Accordion;
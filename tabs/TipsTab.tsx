import React, { useState, useMemo } from 'react';
import { mockHealthTips } from '../services/mockData';
import { HealthTip, HealthTipCategory } from '../types';
import Accordion from '../components/Accordion';

const TipCard: React.FC<{ tip: HealthTip, onToggleLike: (id: number) => void, onToggleSave: (id: number) => void }> = ({ tip, onToggleLike, onToggleSave }) => {
    return (
        <div className="bg-ui-card backdrop-blur-xl border border-ui-card-border p-4 rounded-3xl shadow-lg mb-4">
            <h3 className="text-lg font-bold mt-2 mb-2 text-ui-text-primary">{tip.title}</h3>
            <p className="text-sm text-ui-text-primary">{tip.content}</p>
            <div className="flex justify-end items-center space-x-4 mt-4 pt-2 border-t border-ui-card-border">
                <button onClick={() => onToggleLike(tip.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${tip.isLiked ? 'text-brand-accent' : 'text-ui-text-secondary'}`} fill={tip.isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                    </svg>
                </button>
                <button onClick={() => onToggleSave(tip.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${tip.isSaved ? 'text-brand-secondary' : 'text-ui-text-secondary'}`} fill={tip.isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const TipsTab: React.FC = () => {
    const [tips, setTips] = useState<HealthTip[]>(mockHealthTips);
    
    const handleToggleLike = (id: number) => {
        setTips(tips.map(t => t.id === id ? { ...t, isLiked: !t.isLiked } : t));
    };

    const handleToggleSave = (id: number) => {
        setTips(tips.map(t => t.id === id ? { ...t, isSaved: !t.isSaved } : t));
    };

    const groupedTips = useMemo(() => {
        return tips.reduce((acc, tip) => {
            const category = tip.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(tip);
            return acc;
        }, {} as Record<HealthTipCategory, HealthTip[]>);
    }, [tips]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-ui-text-primary mb-4">Saúde & Dicas</h1>
            <div>
                {/* FIX: Explicitly cast the result of Object.entries() to fix a type inference issue. */}
                {(Object.entries(groupedTips) as [string, HealthTip[]][]).map(([category, tipsInCategory]) => (
                    <Accordion key={category} title={category} defaultOpen={true}>
                        {tipsInCategory.map(tip => (
                             <TipCard 
                                key={tip.id} 
                                tip={tip} 
                                onToggleLike={handleToggleLike}
                                onToggleSave={handleToggleSave}
                            />
                        ))}
                    </Accordion>
                ))}
            </div>
        </div>
    );
};

export default TipsTab;
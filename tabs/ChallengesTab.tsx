import React, { useState } from 'react';
import { mockChallenges } from '../services/mockData';
import { Challenge } from '../types';
import { PlusIcon, CheckIcon } from '../components/icons/Icons';
import Accordion from '../components/Accordion';

const ChallengeCard: React.FC<{ challenge: Challenge; onProgress: (id: number) => void }> = ({ challenge, onProgress }) => {
    const progress = Math.min((challenge.currentValue / challenge.goalValue) * 100, 100);
    const isCompleted = progress >= 100;

    return (
        <div className={`bg-ui-card backdrop-blur-xl border border-ui-card-border p-4 rounded-3xl shadow-lg mb-4 ${isCompleted ? 'opacity-60' : ''}`}>
            <h3 className="text-lg font-bold text-ui-text-primary">{challenge.title}</h3>
            <p className="text-sm text-ui-text-secondary mb-3">{challenge.description}</p>
            <div className="flex items-center justify-between">
                <div>
                    <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                        <div className="bg-brand-secondary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs text-ui-text-secondary">{challenge.currentValue} / {challenge.goalValue} {challenge.unit}</p>
                </div>
                {!isCompleted && (
                    <button onClick={() => onProgress(challenge.id)} className="bg-brand-primary text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center">
                        <CheckIcon />
                    </button>
                )}
            </div>
             {isCompleted && <p className="text-sm font-bold text-brand-primary mt-2 text-right">🎉 Concluído!</p>}
        </div>
    );
};

const ChallengesTab: React.FC = () => {
    const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
    // In a real app, custom goals would be separate state
    
    const handleProgress = (id: number) => {
        setChallenges(challenges.map(c => 
            c.id === id ? { ...c, currentValue: Math.min(c.currentValue + 1, c.goalValue) } : c
        ));
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-ui-text-primary mb-4">Desafios & Metas</h1>
            <Accordion title="Seus Desafios Ativos" defaultOpen={true}>
                {challenges.map(challenge => (
                    <ChallengeCard 
                        key={challenge.id} 
                        challenge={challenge} 
                        onProgress={handleProgress}
                    />
                ))}
            </Accordion>
            {/* In a full implementation, this button would open a modal to create a custom goal */}
            <button className="fixed bottom-28 right-4 bg-brand-accent text-white w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center z-40 hover:scale-110 transition-transform">
                <PlusIcon />
            </button>
        </div>
    );
};

export default ChallengesTab;
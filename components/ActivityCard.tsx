import React from 'react';
import { WearableData } from '../types';
import { FootprintsIcon } from './icons/Icons';

const ProgressRing: React.FC<{ progress: number; size: number; strokeWidth: number }> = ({ progress, size, strokeWidth }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle
                className="text-slate-200 dark:text-gray-700"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
            />
            <circle
                className="text-brand-primary transition-all duration-500"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
                />
        </svg>
    );
};

const ActivityCard: React.FC<{ data: WearableData | null; isLoading: boolean }> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-ui-card backdrop-blur-xl border border-ui-card-border p-4 rounded-3xl shadow-lg animate-pulse">
                <div className="flex items-center mb-3">
                     <div className="bg-brand-secondary-light/80 p-3 rounded-full mr-4">
                       <div className="w-6 h-6 bg-slate-300 dark:bg-gray-600 rounded-full"></div>
                    </div>
                    <div>
                        <div className="h-5 bg-slate-300 dark:bg-gray-600 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-slate-300 dark:bg-gray-600 rounded w-48"></div>
                    </div>
                </div>
                 <div className="flex justify-around items-center h-24 my-4">
                    <div className="w-20 h-20 bg-slate-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="w-20 h-20 bg-slate-300 dark:bg-gray-600 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-ui-card-border pt-3 mt-2">
                    <div>
                        <div className="h-3 bg-slate-300 dark:bg-gray-600 rounded w-16 mx-auto mb-1"></div>
                        <div className="h-4 bg-slate-300 dark:bg-gray-600 rounded w-12 mx-auto"></div>
                    </div>
                     <div>
                        <div className="h-3 bg-slate-300 dark:bg-gray-600 rounded w-16 mx-auto mb-1"></div>
                        <div className="h-4 bg-slate-300 dark:bg-gray-600 rounded w-12 mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
         return null;
    }

    const stepsProgress = (data.steps / data.goalSteps) * 100;
    const caloriesProgress = (data.activeCalories / data.goalCalories) * 100;

    return (
        <div className="bg-ui-card backdrop-blur-xl border border-ui-card-border p-4 rounded-3xl shadow-lg">
            <div className="flex items-center mb-3">
                 <div className="bg-brand-secondary-light/80 text-brand-primary-dark p-3 rounded-2xl mr-4">
                    <FootprintsIcon />
                </div>
                <div>
                    <h3 className="font-bold text-ui-text-primary">Atividade do Dia</h3>
                    <p className="text-sm text-ui-text-secondary">Sincronizado do seu wearable</p>
                </div>
            </div>

            <div className="flex justify-around items-center my-4">
                {/* Steps Ring */}
                <div className="relative flex flex-col items-center">
                    <ProgressRing progress={stepsProgress} size={80} strokeWidth={8} />
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-ui-text-primary">{data.steps.toLocaleString('pt-BR')}</span>
                        <span className="text-xs text-ui-text-secondary">Passos</span>
                    </div>
                </div>
                 {/* Calories Ring */}
                <div className="relative flex flex-col items-center">
                    <ProgressRing progress={caloriesProgress} size={80} strokeWidth={8} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-ui-text-primary">{data.activeCalories}</span>
                        <span className="text-xs text-ui-text-secondary">Kcal</span>
                    </div>
                </div>
            </div>
            
             <div className="grid grid-cols-2 gap-2 text-center border-t border-ui-card-border pt-3 mt-2">
                <div>
                    <p className="text-xs text-ui-text-secondary">Distância</p>
                    <p className="font-bold text-ui-text-primary">{data.distance.toFixed(1)} km</p>
                </div>
                {data.heartRate && (
                     <div>
                        <p className="text-xs text-ui-text-secondary">FC Repouso</p>
                        <p className="font-bold text-ui-text-primary">{data.heartRate.resting} bpm</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default ActivityCard;
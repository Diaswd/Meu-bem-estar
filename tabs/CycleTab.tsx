import React, { useState, useMemo, useEffect } from 'react';
import { CycleData, CyclePhase } from '../types';
import { generateCycleTips, generateSymptomReport } from '../services/geminiService';
import Accordion from '../components/Accordion';
import { ChevronRightIcon, SparklesIcon, LoaderIcon } from '../components/icons/Icons';
import { useUser } from '../context/UserContext';
import MarkdownRenderer from '../components/MarkdownRenderer';

const symptomOptions = [
    "Cólica", "Inchaço", "Dor de cabeça", "Cansaço", 
    "Mudanças de humor", "Espinhas", "Baixa energia", "Aumento de apetite"
];

const CycleTab: React.FC = () => {
    const { user } = useUser();
    const [cycleData, setCycleData] = useState<CycleData>(() => {
        try {
            const storedData = localStorage.getItem('app-cycle-data');
            if (storedData) {
                return JSON.parse(storedData);
            }
        } catch (error) {
            console.error("Failed to parse cycle data from localStorage", error);
        }
        // Default to today if no data is stored
        return {
            lastPeriodDate: new Date().toISOString().split('T')[0],
            averageCycleLength: 28,
        };
    });

    const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'symptoms'>('calendar');
    const [tips, setTips] = useState<string>('');
    const [isLoadingTips, setIsLoadingTips] = useState<boolean>(false);
    const [displayDate, setDisplayDate] = useState(new Date());

    // State for Symptom Tracker
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [symptomReport, setSymptomReport] = useState<string>('');
    const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);


    // Persist data to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('app-cycle-data', JSON.stringify(cycleData));
        } catch (error) {
            console.error("Failed to save cycle data to localStorage", error);
        }
    }, [cycleData]);

    const {
        currentPhase,
        currentDay,
        periodDaysInMonth,
        follicularDaysInMonth,
        ovulationDaysInMonth,
        lutealDaysInMonth
    } = useMemo(() => {
        const result = {
            currentPhase: CyclePhase.Desconhecida,
            currentDay: 0,
            periodDaysInMonth: new Set<string>(),
            follicularDaysInMonth: new Set<string>(),
            ovulationDaysInMonth: new Set<string>(),
            lutealDaysInMonth: new Set<string>(),
        };

        if (!cycleData.lastPeriodDate) return result;

        const lastDate = new Date(cycleData.lastPeriodDate);
        const today = new Date();
        lastDate.setUTCHours(0, 0, 0, 0);
        today.setUTCHours(0, 0, 0, 0);

        const diffTime = today.getTime() - lastDate.getTime();
        result.currentDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Determine current phase for today
        if (result.currentDay <= 0) result.currentPhase = CyclePhase.Desconhecida;
        else if (result.currentDay <= 5) result.currentPhase = CyclePhase.Menstruacao;
        else if (result.currentDay <= 13) result.currentPhase = CyclePhase.Folicular;
        else if (result.currentDay <= 15) result.currentPhase = CyclePhase.Ovulatoria;
        else if (result.currentDay <= cycleData.averageCycleLength) result.currentPhase = CyclePhase.Lutea;
        else result.currentPhase = CyclePhase.Menstruacao;

        // --- Calendar Projection Calculation ---
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        let cycleStartDate = new Date(cycleData.lastPeriodDate);
        cycleStartDate.setUTCHours(0,0,0,0);
        
        // Find the most recent cycle start date before the beginning of the displayed month
        while (cycleStartDate > firstDayOfMonth) {
             cycleStartDate.setDate(cycleStartDate.getDate() - cycleData.averageCycleLength);
        }
        // Move forward if too far back
         while (cycleStartDate.getTime() < firstDayOfMonth.getTime() - (cycleData.averageCycleLength * 86400000) ) {
             cycleStartDate.setDate(cycleStartDate.getDate() + cycleData.averageCycleLength);
         }

        // Project cycles forward from that date until we pass the end of the displayed month
        while (cycleStartDate <= lastDayOfMonth) {
            for (let i = 0; i < cycleData.averageCycleLength; i++) {
                const dayOfCycle = i + 1;
                const projectedDay = new Date(cycleStartDate);
                projectedDay.setDate(cycleStartDate.getDate() + i);

                // Only add if the day is in the currently viewed month
                if (projectedDay.getFullYear() === year && projectedDay.getMonth() === month) {
                    const dateStr = projectedDay.toISOString().split('T')[0];
                    if (dayOfCycle <= 5) result.periodDaysInMonth.add(dateStr);
                    else if (dayOfCycle <= 13) result.follicularDaysInMonth.add(dateStr);
                    else if (dayOfCycle <= 15) result.ovulationDaysInMonth.add(dateStr);
                    else result.lutealDaysInMonth.add(dateStr);
                }
            }
            cycleStartDate.setDate(cycleStartDate.getDate() + cycleData.averageCycleLength);
        }
        
        return result;

    }, [cycleData, displayDate]);

    useEffect(() => {
        const fetchTips = async () => {
            if (!user) return;
            setIsLoadingTips(true);
            const generatedTips = await generateCycleTips(currentPhase, currentDay, user.name);
            setTips(generatedTips);
            setIsLoadingTips(false);
        };

        if (currentPhase !== CyclePhase.Desconhecida) {
            fetchTips();
        }
    }, [currentPhase, currentDay, user]);
    

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCycleData({ ...cycleData, lastPeriodDate: e.target.value });
    };

    const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCycleData({ ...cycleData, averageCycleLength: parseInt(e.target.value, 10) || 28 });
    };

     const handlePrevMonth = () => {
        setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1));
    };

    const handleSymptomToggle = (symptom: string) => {
        setSelectedSymptoms(prev => 
            prev.includes(symptom) 
                ? prev.filter(s => s !== symptom) 
                : [...prev, symptom]
        );
    };

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        setSymptomReport('');
        const report = await generateSymptomReport(currentPhase, currentDay, selectedSymptoms);
        setSymptomReport(report);
        setIsGeneratingReport(false);
    };

    const inputStyle = "w-full p-2.5 rounded-lg bg-ui-input-bg border border-ui-input-border text-ui-text-primary placeholder-ui-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary";

    const renderCalendar = () => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const firstDayOfWeek = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const today = new Date();
        today.setHours(0,0,0,0);
        const todayStr = today.toISOString().split('T')[0];
        
        const days = [];
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="p-1"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dateStr = date.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;

            const dayContainerClasses = "w-9 h-9 flex items-center justify-center relative";
            let dayTextClasses = "z-10 text-sm w-8 h-8 flex items-center justify-center rounded-full transition-colors";
            
            if (periodDaysInMonth.has(dateStr)) {
                dayTextClasses += ' period-day';
            } else if (ovulationDaysInMonth.has(dateStr)) {
                dayTextClasses += ' ovulation-day';
            } else if (follicularDaysInMonth.has(dateStr)) {
                 dayTextClasses += ' follicular-day';
            } else if (lutealDaysInMonth.has(dateStr)) {
                 dayTextClasses += ' luteal-day';
            }

            if (isToday) {
                 dayTextClasses += " ring-2 ring-brand-secondary";
            } else if(!periodDaysInMonth.has(dateStr)) {
                 dayTextClasses += " text-ui-text-primary";
            }


            days.push(
                <div key={i} className="py-1 flex justify-center items-center">
                    <div className={dayContainerClasses}>
                        <div className={dayTextClasses}>{i}</div>
                    </div>
                </div>
            );
        }

        const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

        return (
             <div className="bg-ui-card backdrop-blur-xl border border-ui-card-border p-4 rounded-3xl shadow-lg">
                <div className="relative flex justify-between items-center mb-4">
                     <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 z-10">
                        <ChevronRightIcon className="w-5 h-5 transform rotate-180" />
                     </button>
                     <h3 className="absolute w-full text-center font-bold text-lg text-ui-text-primary">
                        {displayDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                     </h3>
                     <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 z-10">
                        <ChevronRightIcon className="w-5 h-5" />
                     </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-ui-text-secondary">
                    {weekdays.map((day, i) => <div key={i} className="font-semibold">{day}</div>)}
                    {days}
                </div>
            </div>
        );
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-ui-text-primary mb-4">Ciclo Feminino</h1>
            
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button 
                    onClick={() => setActiveSubTab('calendar')}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeSubTab === 'calendar' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-ui-text-secondary'}`}
                >
                    Calendário & Dicas
                </button>
                <button 
                    onClick={() => setActiveSubTab('symptoms')}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeSubTab === 'symptoms' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-ui-text-secondary'}`}
                >
                    Como você se sente?
                </button>
            </div>

            {activeSubTab === 'calendar' && (
                <>
                    <Accordion title="Configurações">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-ui-text-secondary mb-1">Data do último ciclo:</label>
                            <input 
                                type="date" 
                                value={cycleData.lastPeriodDate || ''} 
                                onChange={handleDateChange} 
                                className={inputStyle}
                                style={{colorScheme: 'dark'}}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-ui-text-secondary mb-1">Duração média do ciclo (dias):</label>
                            <input 
                                type="number" 
                                value={cycleData.averageCycleLength} 
                                onChange={handleLengthChange} 
                                className={inputStyle}
                            />
                        </div>
                    </Accordion>
                    
                    <Accordion title="Calendário do Ciclo" defaultOpen={true}>
                        {renderCalendar()}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs text-ui-text-secondary">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full inline-block period-day"></span>Menstruação</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full inline-block follicular-day"></span>Folicular</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full inline-block ovulation-day"></span>Ovulação</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full inline-block luteal-day"></span>Lútea</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full inline-block ring-2 ring-brand-secondary"></span>Hoje</div>
                        </div>
                    </Accordion>

                    <Accordion title="Dicas para sua Fase" defaultOpen={true}>
                        {isLoadingTips ? (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mt-3"></div>
                                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                            </div>
                        ) : (
                            <MarkdownRenderer content={tips} className="cycle-tips-content prose prose-sm prose-p:text-ui-text-primary prose-strong:text-brand-primary" />
                        )}
                    </Accordion>
                </>
            )}

            {activeSubTab === 'symptoms' && (
                <Accordion title={`Registro de ${new Date().toLocaleDateString('pt-BR')}`} defaultOpen={true}>
                    <p className="text-sm text-ui-text-secondary mb-4">Selecione um ou mais sintomas que você está sentindo hoje para receber um relatório personalizado.</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {symptomOptions.map(symptom => (
                            <button
                                key={symptom}
                                onClick={() => handleSymptomToggle(symptom)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-full border-2 transition-colors ${
                                    selectedSymptoms.includes(symptom)
                                    ? 'bg-brand-secondary text-white border-brand-primary-dark'
                                    : 'bg-ui-input-bg border-ui-input-border text-ui-text-primary'
                                }`}
                            >
                                {symptom}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleGenerateReport}
                        disabled={isGeneratingReport || selectedSymptoms.length === 0}
                        className="w-full bg-brand-primary-dark text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition flex items-center justify-center gap-2 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                    >
                        {isGeneratingReport ? <LoaderIcon className="w-5 h-5"/> : <SparklesIcon />}
                        {isGeneratingReport ? 'Analisando...' : 'Gerar Relatório com IA'}
                    </button>

                    {symptomReport && (
                         <div className="mt-4 pt-4 border-t border-ui-card-border">
                            <MarkdownRenderer content={symptomReport} className="cycle-tips-content prose prose-sm max-w-none prose-p:text-ui-text-primary prose-strong:text-brand-primary prose-li:text-ui-text-primary" />
                         </div>
                    )}
                </Accordion>
            )}
        </div>
    );
};

export default CycleTab;
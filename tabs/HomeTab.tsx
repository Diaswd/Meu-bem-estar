import React, { useState, useEffect } from 'react';
import { Tab, CycleData, CyclePhase, WearableData } from '../types';
import { mockHealthTips } from '../services/mockData';
import { LightbulbIcon, TrophyIcon, ChevronRightIcon, LogOutIcon, BotIcon, CogIcon, SunIcon, MoonIcon, ComputerDesktopIcon, UserIcon } from '../components/icons/Icons';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { generateCycleSummary } from '../services/geminiService';
import { getTodaysActivity } from '../services/wearableService';
import ChatModal from '../components/ChatModal';
import ActivityCard from '../components/ActivityCard';

interface HomeTabProps {
    setActiveTab: (tab: Tab) => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ setActiveTab }) => {
    const { user, logout } = useUser();
    const { theme, setTheme, colorTheme, setColorTheme } = useTheme();
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [cycleSummary, setCycleSummary] = useState('Carregando dicas do ciclo...');
    const [isLoadingCycleSummary, setIsLoadingCycleSummary] = useState(true);

    const [wearableData, setWearableData] = useState<WearableData | null>(null);
    const [isLoadingWearableData, setIsLoadingWearableData] = useState(true);

    const tipOfTheDay = mockHealthTips[0];

    useEffect(() => {
        // Fetch Wearable Data
        const fetchActivityData = async () => {
            try {
                const data = await getTodaysActivity();
                setWearableData(data);
            } catch (error) {
                console.error("Failed to fetch wearable data", error);
            } finally {
                setIsLoadingWearableData(false);
            }
        };
        fetchActivityData();

        // Fetch Cycle Summary if applicable
        if (user?.gender !== 'Feminino') return;
        
        const fetchCycleSummary = async () => {
            setIsLoadingCycleSummary(true);
            try {
                const storedData = localStorage.getItem('app-cycle-data');
                if (storedData) {
                    const cycleData: CycleData = JSON.parse(storedData);
                    if (cycleData.lastPeriodDate) {
                        const lastDate = new Date(cycleData.lastPeriodDate);
                        const today = new Date();
                        lastDate.setUTCHours(0, 0, 0, 0);
                        today.setUTCHours(0, 0, 0, 0);

                        const diffTime = today.getTime() - lastDate.getTime();
                        const currentDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        
                        let currentPhase: CyclePhase;
                        if (currentDay <= 0) currentPhase = CyclePhase.Desconhecida;
                        else if (currentDay <= 5) currentPhase = CyclePhase.Menstruacao;
                        else if (currentDay <= 13) currentPhase = CyclePhase.Folicular;
                        else if (currentDay <= 15) currentPhase = CyclePhase.Ovulatoria;
                        else if (currentDay <= cycleData.averageCycleLength) currentPhase = CyclePhase.Lutea;
                        else currentPhase = CyclePhase.Menstruacao; // Start of new cycle

                        if (currentPhase !== CyclePhase.Desconhecida) {
                            const summary = await generateCycleSummary(currentPhase, currentDay);
                            setCycleSummary(summary);
                        } else {
                             setCycleSummary("Atualize seu ciclo para dicas diárias.");
                        }
                    } else {
                        setCycleSummary("Atualize seu ciclo para dicas diárias.");
                    }
                } else {
                    setCycleSummary("Acesse a aba Ciclo para começar.");
                }
            } catch (error) {
                console.error("Error fetching cycle summary:", error);
                setCycleSummary("Dica do dia: Ouça seu corpo e cuide-se bem!");
            } finally {
                setIsLoadingCycleSummary(false);
            }
        };

        fetchCycleSummary();
    }, [user?.gender]);
    
    const colorThemeOptions = [
        { value: 'emerald' as const, label: 'Esmeralda', colorClass: 'bg-[#14B8A6]' },
        { value: 'lavender' as const, label: 'Lavanda', colorClass: 'bg-[#8B5CF6]' },
        { value: 'orange' as const, label: 'Laranja', colorClass: 'bg-[#F97316]' },
        { value: 'blue' as const, label: 'Azul', colorClass: 'bg-[#3B82F6]' },
        { value: 'pink' as const, label: 'Rosa', colorClass: 'bg-[#EC4899]' },
        { value: 'sky' as const, label: 'Céu', colorClass: 'bg-[#0EA5E9]' },
        { value: 'rose' as const, label: 'Rosé', colorClass: 'bg-[#F43F5E]' },
        { value: 'teal' as const, label: 'Turquesa', colorClass: 'bg-[#14B8A6]' },
        { value: 'indigo' as const, label: 'Índigo', colorClass: 'bg-[#6366F1]' },
        { value: 'lime' as const, label: 'Lima', colorClass: 'bg-[#84CC16]' },
    ];

    const isFemale = user?.gender === 'Feminino';

    const Card: React.FC<{
        icon: React.ReactNode;
        title: string;
        subtitle: string;
        onClick: () => void;
    }> = ({ icon, title, subtitle, onClick }) => (
        <button onClick={onClick} className="bg-ui-card backdrop-blur-xl border border-ui-card-border p-4 rounded-3xl shadow-lg flex items-center w-full text-left transition-transform hover:scale-[1.02]">
            <div className="bg-brand-secondary-light/80 text-brand-primary-dark p-3 rounded-2xl mr-4">
                {icon}
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-ui-text-primary">{title}</h3>
                <p className="text-sm text-ui-text-secondary">{subtitle}</p>
            </div>
            <ChevronRightIcon className="text-gray-400 dark:text-gray-600 w-6 h-6" />
        </button>
    );

    return (
        <div className="p-4">
            <header className="mb-8 flex justify-between items-center">
                 <div>
                    <h1 className="text-3xl font-bold text-ui-text-primary">{user?.name ? `Olá, ${user.name}!` : 'Olá!'}</h1>
                    <p className="text-ui-text-secondary">Sua jornada de bem-estar continua.</p>
                </div>
                <div className="relative">
                    <button onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)} className="p-3 rounded-full bg-ui-card border border-ui-card-border backdrop-blur-xl shadow-sm">
                       <UserIcon className="w-6 h-6 text-ui-text-secondary"/>
                    </button>
                    {isSettingsMenuOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-slate-100/70 dark:bg-gray-900/50 backdrop-blur-lg border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-lg p-2 z-20">
                             <>
                                <p className="px-2 py-1 text-xs font-semibold text-ui-text-secondary">Modo de Exibição</p>
                                <div className="grid grid-cols-3 gap-2 p-1">
                                    <button onClick={() => setTheme('light')} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${theme === 'light' ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                        <SunIcon className="w-5 h-5 mb-1"/>
                                        <span className="text-xs">Claro</span>
                                    </button>
                                    <button onClick={() => setTheme('dark')} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${theme === 'dark' ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                        <MoonIcon className="w-5 h-5 mb-1"/>
                                        <span className="text-xs">Escuro</span>
                                    </button>
                                     <button onClick={() => setTheme('system')} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${theme === 'system' ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                        <ComputerDesktopIcon className="w-5 h-5 mb-1"/>
                                        <span className="text-xs">Sistema</span>
                                    </button>
                                </div>
                                <div className="border-t border-slate-200/50 dark:border-white/10 my-2"></div>
                                <p className="px-2 py-1 text-xs font-semibold text-ui-text-secondary">Paleta de Cores</p>
                                <div className="grid grid-cols-2 gap-2 p-1">
                                    {colorThemeOptions.map(opt => (
                                        <button 
                                            key={opt.value} 
                                            onClick={() => { setColorTheme(opt.value); }}
                                            className={`w-full text-left p-2 rounded-xl transition-all ${colorTheme === opt.value ? 'ring-2 ring-brand-primary/80' : ''}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`w-5 h-5 rounded-full ${opt.colorClass}`}></span>
                                                <span className="text-sm text-ui-text-primary">{opt.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="border-t border-slate-200/50 dark:border-white/10 my-2"></div>
                             </>
                             <button onClick={logout} className="w-full text-left p-2 flex items-center gap-3 text-ui-text-secondary hover:text-brand-accent transition-colors rounded-xl hover:bg-black/5 dark:hover:bg-white/5">
                                <LogOutIcon className="w-5 h-5"/>
                                <span className="text-sm font-semibold">Sair</span>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {user?.gender === 'Feminino' && (
                <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-6 rounded-3xl text-white shadow-lg mb-8">
                    <h2 className="font-bold text-lg mb-1">Resumo do Ciclo</h2>
                    {isLoadingCycleSummary ? (
                         <p className="text-sm mb-4 h-5 bg-white/20 rounded animate-pulse w-3/4"></p>
                    ) : (
                         <p className="text-sm mb-4">{cycleSummary}</p>
                    )}
                    <button onClick={() => setActiveTab('cycle')} className="bg-white/30 text-white font-semibold py-2 px-4 rounded-full text-sm hover:bg-white/40 transition">
                        Ver mais dicas
                    </button>
                </div>
            )}
            
            <div className="mb-8">
                <ActivityCard data={wearableData} isLoading={isLoadingWearableData} />
            </div>

            <h2 className="text-xl font-bold text-ui-text-primary mb-4">Seu Foco do Dia</h2>

            <div className="space-y-4">
                 <Card 
                    icon={<BotIcon />}
                    title="Chat com IA"
                    subtitle="Tire suas dúvidas e receba dicas"
                    onClick={() => setIsChatOpen(true)}
                />
                 <Card 
                    icon={<TrophyIcon />}
                    title="Seus Desafios"
                    subtitle="Veja seu progresso e crie novas metas"
                    onClick={() => setActiveTab('challenges')}
                />
                <Card 
                    icon={<LightbulbIcon />}
                    title="Dica de Saúde"
                    subtitle={tipOfTheDay.title}
                    onClick={() => setActiveTab('tips')}
                />
            </div>

            {isChatOpen && <ChatModal onClose={() => setIsChatOpen(false)} />}
        </div>
    );
};

export default HomeTab;
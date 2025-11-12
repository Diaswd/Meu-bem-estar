import React, { useState, useEffect, useRef } from 'react';
import { Workout } from '../types';
import { PlayIcon, PauseIcon, StopIcon, XIcon, CogIcon, PencilIcon, SparklesIcon, LoaderIcon, ChevronRightIcon } from '../components/icons/Icons';
import CustomWorkoutModal from '../components/CustomWorkoutModal';
import { generateWorkoutImage, generateSimilarWorkoutSuggestions, generateMusclesWorked } from '../services/geminiService';
import MarkdownRenderer from '../components/MarkdownRenderer';

// --- MODAL COMPONENTS ---

const FullscreenImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center animate-fade-in" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white z-[110]">
            <XIcon className="w-8 h-8"/>
        </button>
        <img src={imageUrl} alt="Demonstração em tela cheia" className="max-w-[95%] max-h-[95%] object-contain" onClick={(e) => e.stopPropagation()}/>
    </div>
);

const VideoPlayerModal: React.FC<{ videoUrl: string; onClose: () => void }> = ({ videoUrl, onClose }) => (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center animate-fade-in" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white z-[110] bg-black/30 rounded-full p-1">
            <XIcon className="w-8 h-8"/>
        </button>
        <div className="w-full max-w-3xl aspect-video p-4" onClick={(e) => e.stopPropagation()}>
             <video src={videoUrl} controls autoPlay className="w-full h-full rounded-2xl bg-black" />
        </div>
    </div>
);

const TimerSettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    settings: { sets: number; workTime: number; restTime: number };
    onSettingsChange: (newSettings: { sets: number; workTime: number; restTime: number }) => void;
    onStart: () => void;
}> = ({ isOpen, onClose, settings, onSettingsChange, onStart }) => {
    if (!isOpen) return null;
    
    const inputClasses = "w-full p-2 bg-ui-input-bg border border-ui-input-border rounded-lg text-ui-text-primary placeholder-ui-text-secondary";

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-50/70 dark:bg-gray-900/50 backdrop-blur-lg border border-ui-card-border rounded-3xl shadow-lg w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-ui-text-primary mb-4">Personalizar Timer</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-ui-text-secondary mb-1">Séries</label>
                        <input type="number" value={settings.sets} onChange={e => onSettingsChange({...settings, sets: parseInt(e.target.value) || 1})} className={inputClasses}/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-ui-text-secondary mb-1">Tempo de Exercício (segundos)</label>
                        <input type="number" value={settings.workTime} onChange={e => onSettingsChange({...settings, workTime: parseInt(e.target.value) || 1})} className={inputClasses}/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-ui-text-secondary mb-1">Tempo de Descanso (segundos)</label>
                        <input type="number" value={settings.restTime} onChange={e => onSettingsChange({...settings, restTime: parseInt(e.target.value) || 0})} className={inputClasses}/>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="bg-slate-300 dark:bg-gray-600 text-slate-700 dark:text-gray-200 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                    <button onClick={onStart} className="bg-brand-primary-dark text-white font-bold py-2 px-4 rounded-lg">Iniciar</button>
                </div>
            </div>
        </div>
    );
};

// --- WORKOUT CARD & TIMER ---

const WorkoutCard: React.FC<{
    workout: Workout;
    onStart: (settings: { sets: number; workTime: number; restTime: number }) => void;
    onImageClick: (url: string) => void;
    onPlayVideo: (url: string) => void;
    onToggleComplete: () => void;
    onOpenSettings: () => void;
    onGenerateImage: () => void;
    onEdit: () => void;
    timerState: {
        isActive: boolean;
        isPaused: boolean;
        phase: 'work' | 'rest';
        currentSet: number;
        totalSets: number;
        currentTime: number;
    };
    onPauseResume: () => void;
    onStop: () => void;
    suggestions: Workout[] | undefined;
    isLoadingSuggestions: boolean;
    onFetchSuggestions: () => void;
}> = ({ workout, onStart, onImageClick, onPlayVideo, onToggleComplete, onOpenSettings, onGenerateImage, onEdit, timerState, onPauseResume, onStop, suggestions, isLoadingSuggestions, onFetchSuggestions }) => {
    
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [musclesWorked, setMusclesWorked] = useState<string[] | null>(null);
    const [isLoadingMuscles, setIsLoadingMuscles] = useState(false);

    const handleToggleDetails = async () => {
        const open = !isDetailsOpen;
        setIsDetailsOpen(open);

        if (open) {
            if (!suggestions) {
                onFetchSuggestions();
            }
            if (!musclesWorked && !isLoadingMuscles) {
                setIsLoadingMuscles(true);
                try {
                    const muscles = await generateMusclesWorked(workout);
                    setMusclesWorked(muscles);
                } catch (error) {
                    setMusclesWorked(["Erro ao carregar."]);
                } finally {
                    setIsLoadingMuscles(false);
                }
            }
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    const phaseText = timerState.phase === 'work' ? 'EXERCÍCIO' : 'DESCANSO';
    const phaseColor = timerState.phase === 'work' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500';

    const totalSeconds = workout.sets * (workout.workTime + workout.restTime);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const estimatedTime = `${minutes > 0 ? `${minutes} min ` : ''}${seconds > 0 ? `${seconds} seg` : ''}`.trim() || '0 seg';

    return (
        <div id={`workout-card-${workout.id}`} className="bg-ui-card backdrop-blur-xl border border-ui-card-border rounded-3xl shadow-lg mb-4 overflow-hidden p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="relative w-full aspect-video rounded-2xl mb-3 bg-black/20 group">
                {workout.isLoadingImage ? (
                    <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                        <span className="text-sm text-ui-text-secondary">Gerando imagem com IA...</span>
                    </div>
                ) : workout.imageUrl ? (
                    <img
                        src={workout.imageUrl}
                        alt={`Demonstração de ${workout.name}`}
                        className="w-full h-full object-cover rounded-2xl cursor-pointer transition-transform group-hover:scale-105"
                        onClick={() => onImageClick(workout.imageUrl!)}
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/ccc/FFFFFF?text=Imagem+Inv%C3%A1lida'; }}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <span className="text-sm text-center text-ui-text-secondary mb-3">Nenhuma imagem disponível</span>
                        <button 
                            onClick={onGenerateImage}
                            className="bg-brand-secondary text-white font-semibold py-1.5 px-4 rounded-full text-xs hover:bg-brand-primary-dark transition"
                        >
                            Gerar com IA
                        </button>
                    </div>
                )}

                {workout.videoUrl && !workout.isLoadingImage && workout.imageUrl && (
                    <button 
                        onClick={() => onPlayVideo(workout.videoUrl!)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        aria-label={`Play video for ${workout.name}`}
                    >
                        <div className="bg-white/80 rounded-full p-3 transform transition-transform group-hover:scale-110">
                            <PlayIcon className="w-8 h-8 text-brand-primary-dark ml-1"/>
                        </div>
                    </button>
                )}
            </div>

             <div className="flex justify-between items-start">
                <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-ui-text-primary">{workout.name}</h3>
                        {workout.isCustom && <span className="text-xs font-semibold bg-brand-secondary text-white px-2 py-0.5 rounded-full">Personalizado</span>}
                    </div>
                    <p className="text-sm text-ui-text-secondary">{workout.sets} séries de {workout.workTime}s com {workout.restTime}s de descanso</p>
                    <p className="text-xs text-ui-text-secondary mt-1">Equipamento: {workout.equipment.join(', ')}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {workout.isCustom && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="p-2 text-ui-text-secondary hover:text-brand-primary transition-colors"
                            aria-label="Editar treino"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
                        className={`w-6 h-6 rounded-full border-2 transition-colors flex-shrink-0 ${workout.completed ? 'bg-brand-secondary border-brand-primary-dark' : 'border-gray-400 dark:border-gray-600'}`}
                        aria-label="Marcar como concluído"
                    >
                        {workout.completed && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg>}
                    </button>
                </div>
            </div>
            
            <MarkdownRenderer content={workout.description} className="text-sm text-ui-text-primary mt-3 mb-3" />
            {workout.tips && <MarkdownRenderer content={workout.tips} className="text-xs text-violet-800 dark:text-violet-200 bg-violet-200/50 dark:bg-violet-500/20 p-2 rounded-lg my-2" />}


            {/* Details Section */}
            <div className="mt-2 border-t border-ui-card-border">
                <button onClick={handleToggleDetails} className="w-full flex justify-between items-center py-2 text-sm font-semibold text-brand-primary">
                    Detalhes e Sugestões
                    <ChevronRightIcon className={`w-5 h-5 transition-transform duration-300 ${isDetailsOpen ? 'rotate-90' : ''}`} />
                </button>
                {isDetailsOpen && (
                    <div className="pb-2 space-y-3">
                        {/* Estimated Time */}
                        <div>
                            <h4 className="text-xs font-bold text-ui-text-secondary uppercase">Tempo Estimado</h4>
                            <p className="text-sm text-ui-text-primary">{estimatedTime}</p>
                        </div>
                        {/* Muscles Worked */}
                        <div>
                            <h4 className="text-xs font-bold text-ui-text-secondary uppercase">Músculos Focados</h4>
                             {isLoadingMuscles ? (
                                <p className="text-sm text-ui-text-secondary animate-pulse">Analisando...</p>
                            ) : (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {musclesWorked?.map((muscle, index) => (
                                        <span key={index} className="text-xs bg-violet-200/50 dark:bg-violet-500/20 text-violet-800 dark:text-violet-200 px-2 py-1 rounded-full">{muscle}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Similar Workouts */}
                        <div>
                             <h4 className="text-xs font-bold text-ui-text-secondary uppercase">Sugestões Similares</h4>
                             {isLoadingSuggestions ? (
                                <div className="flex items-center p-2">
                                    <LoaderIcon className="w-4 h-4 text-brand-primary" />
                                    <span className="ml-2 text-ui-text-secondary text-sm">Buscando...</span>
                                </div>
                            ) : suggestions && suggestions.length > 0 ? (
                                <div className="space-y-2 mt-1">
                                    {suggestions.map(s => (
                                        <div key={s.id} className="bg-slate-200/50 dark:bg-black/20 p-2 rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-ui-text-primary text-sm">{s.name}</p>
                                                <p className="text-xs text-ui-text-secondary">Objetivo: {s.goal}</p>
                                            </div>
                                            <button onClick={() => {
                                                const element = document.getElementById(`workout-card-${s.id}`);
                                                if(element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }} className="text-brand-secondary text-xs font-semibold">Ver</button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                 <p className="text-sm text-center text-ui-text-secondary py-2">Nenhuma sugestão encontrada.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {timerState.isActive ? (
                <div className="mt-4 border-t border-ui-card-border pt-4 text-center">
                    <div className="flex justify-between items-center mb-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded-md ${phaseColor}`}>{phaseText}</span>
                        <span className="text-sm font-semibold text-ui-text-secondary">Série {timerState.currentSet}/{timerState.totalSets}</span>
                    </div>
                    <div className="text-5xl font-mono font-bold mb-4 text-brand-primary">
                        {formatTime(timerState.currentTime)}
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <button onClick={onPauseResume} className="bg-slate-300 dark:bg-gray-700 p-3 rounded-full hover:bg-opacity-80 transition text-ui-text-primary">
                            {timerState.isPaused ? <PlayIcon className="w-7 h-7"/> : <PauseIcon className="w-7 h-7"/>}
                        </button>
                        <button onClick={onStop} className="bg-brand-accent/80 p-3 rounded-full hover:bg-brand-accent transition text-white">
                            <StopIcon className="w-7 h-7"/>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 mt-4">
                    <button
                        onClick={() => onStart({ sets: workout.sets, workTime: workout.workTime, restTime: workout.restTime })}
                        className="flex-grow bg-brand-primary-dark text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition flex items-center justify-center gap-2">
                        <PlayIcon className="w-5 h-5"/>
                        Iniciar Treino
                    </button>
                    <button onClick={onOpenSettings} className="p-3 bg-slate-200 dark:bg-gray-700 rounded-xl text-ui-text-primary">
                       <CogIcon className="w-5 h-5"/>
                    </button>
                </div>
            )}
        </div>
    );
};

// --- MAIN TAB COMPONENT ---

const WorkoutsTab: React.FC = () => {
    const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
    const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);
    const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);

    // Timer State
    const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
    const [timerPhase, setTimerPhase] = useState<'work' | 'rest'>('work');
    const [currentSet, setCurrentSet] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [isTimerPaused, setIsTimerPaused] = useState(false);
    const [workoutSettings, setWorkoutSettings] = useState({ sets: 0, workTime: 0, restTime: 0 });
    // FIX: Initialize useRef with null to provide an initial value and fix the type error.
    const timerTick = useRef<(() => void) | null>(null);


    // Modal State
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isCustomWorkoutModalOpen, setIsCustomWorkoutModalOpen] = useState(false);
    const [workoutToCustomize, setWorkoutToCustomize] = useState<Workout | null>(null);
    const [workoutToEdit, setWorkoutToEdit] = useState<Workout | null>(null);

    // AI Suggestions State
    const [suggestions, setSuggestions] = useState<Record<number, Workout[]>>({});
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<Record<number, boolean>>({});
    
    // Load workouts from localStorage on initial mount
    useEffect(() => {
        try {
            const storedWorkouts = localStorage.getItem('app-workouts');
            if (storedWorkouts) {
                const parsedWorkouts: Workout[] = JSON.parse(storedWorkouts);
                // Sanitize data: reset any workouts that were stuck in a loading state
                const initialWorkouts = parsedWorkouts.map(w => 
                    w.isLoadingImage ? { ...w, isLoadingImage: false, imageUrl: '' } : w
                );
                 setAllWorkouts(initialWorkouts);
            }
        } catch (error) {
            console.error("Failed to load or parse workouts from localStorage", error);
        }
    }, []);

    // Persist workouts to localStorage whenever they change
    useEffect(() => {
        // Avoid saving the initial empty state before hydration from localStorage
        if (allWorkouts.length > 0) {
            try {
                localStorage.setItem('app-workouts', JSON.stringify(allWorkouts));
            } catch (error) {
                console.error("Failed to save workouts to localStorage", error);
            }
        }
    }, [allWorkouts]);


    const handleStopTimer = (completed: boolean = false) => {
        if (activeWorkout) {
            if (completed) {
                 setAllWorkouts(allWorkouts.map(w => w.id === activeWorkout.id ? { ...w, completed: true } : w));
            }
            setActiveWorkout(null);
        }
    };

    // This effect keeps the tick function up-to-date with the latest state.
    useEffect(() => {
        timerTick.current = () => {
            if (currentTime > 1) {
                setCurrentTime(currentTime - 1);
                return;
            }

            if (timerPhase === 'work') {
                if (currentSet < workoutSettings.sets) {
                    setTimerPhase('rest');
                    setCurrentTime(workoutSettings.restTime);
                } else {
                    handleStopTimer(true);
                }
            } else { // 'rest'
                setCurrentSet(currentSet + 1);
                setTimerPhase('work');
                setCurrentTime(workoutSettings.workTime);
            }
        };
    });

    // This effect manages the setInterval itself.
    useEffect(() => {
        if (isTimerPaused || !activeWorkout) {
            return;
        }
        const intervalId = window.setInterval(() => {
            if (timerTick.current) {
                timerTick.current();
            }
        }, 1000);
        return () => window.clearInterval(intervalId);
    }, [activeWorkout, isTimerPaused]);


    const handleToggleComplete = (id: number) => {
        setAllWorkouts(allWorkouts.map(w => w.id === id ? { ...w, completed: !w.completed } : w));
    };

    const handleStartWorkout = (workout: Workout, settings: { sets: number; workTime: number; restTime: number }) => {
        if (activeWorkout) return; 
        setWorkoutSettings(settings);
        setActiveWorkout(workout);
        setCurrentSet(1);
        setTimerPhase('work');
        setCurrentTime(settings.workTime);
        setIsTimerPaused(false);
        setIsSettingsModalOpen(false);
    };
    
    const handlePauseResumeTimer = () => setIsTimerPaused(prev => !prev);
    
    const handleAddCustomWorkout = async (newWorkoutData: Omit<Workout, 'id' | 'completed' | 'imageUrl'>, aspectRatio: '16:9') => {
        const tempId = Date.now();

        let newWorkout: Workout = {
            ...newWorkoutData,
            id: tempId,
            completed: false,
            isLoadingImage: true,
            imageUrl: '', 
        };

        setAllWorkouts(prev => [newWorkout, ...prev]);
        setIsCustomWorkoutModalOpen(false);

        const imageUrl = await generateWorkoutImage(newWorkoutData, aspectRatio);
        
        setAllWorkouts(prev => prev.map(w => 
            w.id === tempId 
                ? { ...w, imageUrl: imageUrl, isLoadingImage: false } 
                : w
        ));
    };

    const handleUpdateWorkout = (updatedWorkout: Workout) => {
        setAllWorkouts(prev => prev.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
        setIsCustomWorkoutModalOpen(false);
        setWorkoutToEdit(null);
    };

    const handleDeleteWorkout = (workoutId: number) => {
        setAllWorkouts(prev => prev.filter(w => w.id !== workoutId));
        setIsCustomWorkoutModalOpen(false);
        setWorkoutToEdit(null);
    };

    const handleOpenCreateModal = () => {
        setWorkoutToEdit(null);
        setIsCustomWorkoutModalOpen(true);
    };

    const handleOpenEditModal = (workout: Workout) => {
        setWorkoutToEdit(workout);
        setIsCustomWorkoutModalOpen(true);
    };

    const handleGenerateImageForWorkout = async (workoutId: number) => {
        setAllWorkouts(prev => prev.map(w => 
            w.id === workoutId ? { ...w, isLoadingImage: true } : w
        ));

        const workoutToUpdate = allWorkouts.find(w => w.id === workoutId);
        if (!workoutToUpdate) {
            console.error("Workout not found for image generation");
            setAllWorkouts(prev => prev.map(w => 
                w.id === workoutId ? { ...w, isLoadingImage: false } : w
            ));
            return;
        }

        try {
            const imageUrl = await generateWorkoutImage(workoutToUpdate, '16:9');
            setAllWorkouts(prev => prev.map(w => 
                w.id === workoutId 
                    ? { ...w, imageUrl: imageUrl, isLoadingImage: false } 
                    : w
            ));
        } catch (error) {
            console.error("Failed to generate image on-demand:", error);
            setAllWorkouts(prev => prev.map(w => 
                w.id === workoutId 
                    ? { ...w, isLoadingImage: false, imageUrl: 'https://placehold.co/600x400/F472B6/FFFFFF?text=Erro' } 
                    : w
            ));
        }
    };

    const handleOpenSettings = (workout: Workout) => {
        setWorkoutToCustomize(workout);
        setWorkoutSettings({ sets: workout.sets, workTime: workout.workTime, restTime: workout.restTime });
        setIsSettingsModalOpen(true);
    };

    const handleFetchSuggestions = async (workoutId: number) => {
        const currentWorkout = allWorkouts.find(w => w.id === workoutId);
        if (!currentWorkout) return;

        setIsLoadingSuggestions(prev => ({ ...prev, [workoutId]: true }));
        
        try {
            const otherWorkouts = allWorkouts.filter(w => w.id !== workoutId);
            const suggestedIds = await generateSimilarWorkoutSuggestions(currentWorkout, otherWorkouts);

            if (suggestedIds.length > 0) {
                const suggestedWorkouts = allWorkouts.filter(w => suggestedIds.includes(w.id));
                setSuggestions(prev => ({ ...prev, [workoutId]: suggestedWorkouts }));
            } else {
                setSuggestions(prev => ({ ...prev, [workoutId]: [] }));
            }
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
        } finally {
            setIsLoadingSuggestions(prev => ({ ...prev, [workoutId]: false }));
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-ui-text-primary mb-4">Meus Treinos</h1>

            {fullscreenImageUrl && <FullscreenImageModal imageUrl={fullscreenImageUrl} onClose={() => setFullscreenImageUrl(null)} />}
            {playingVideoUrl && <VideoPlayerModal videoUrl={playingVideoUrl} onClose={() => setPlayingVideoUrl(null)} />}
            
            <TimerSettingsModal 
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                settings={workoutSettings}
                onSettingsChange={setWorkoutSettings}
                onStart={() => {
                    if (workoutToCustomize) {
                        handleStartWorkout(workoutToCustomize, workoutSettings);
                    }
                }}
            />
            <CustomWorkoutModal 
                isOpen={isCustomWorkoutModalOpen}
                onClose={() => {
                    setIsCustomWorkoutModalOpen(false);
                    setWorkoutToEdit(null);
                }}
                onSave={handleAddCustomWorkout}
                onUpdate={handleUpdateWorkout}
                onDelete={handleDeleteWorkout}
                workoutToEdit={workoutToEdit}
            />

            <div className="mt-2">
                {allWorkouts.length > 0 ? (
                     allWorkouts.map((workout) => (
                        <WorkoutCard
                            key={workout.id}
                            workout={workout}
                            onToggleComplete={() => handleToggleComplete(workout.id)}
                            onImageClick={setFullscreenImageUrl}
                            onPlayVideo={setPlayingVideoUrl}
                            onOpenSettings={() => handleOpenSettings(workout)}
                            onStart={(settings) => handleStartWorkout(workout, settings)}
                            onGenerateImage={() => handleGenerateImageForWorkout(workout.id)}
                            onEdit={() => handleOpenEditModal(workout)}
                            timerState={{
                                isActive: activeWorkout?.id === workout.id,
                                isPaused: isTimerPaused,
                                phase: timerPhase,
                                currentSet: currentSet,
                                totalSets: workoutSettings.sets,
                                currentTime: activeWorkout?.id === workout.id ? currentTime : 0,
                            }}
                            onPauseResume={handlePauseResumeTimer}
                            onStop={() => handleStopTimer(false)}
                            suggestions={suggestions[workout.id]}
                            isLoadingSuggestions={isLoadingSuggestions[workout.id] || false}
                            onFetchSuggestions={() => handleFetchSuggestions(workout.id)}
                        />
                    ))
                ) : (
                    <div className="text-center text-ui-text-secondary mt-20 p-4 rounded-3xl bg-ui-card backdrop-blur-xl border border-ui-card-border shadow-lg">
                        <h3 className="font-semibold text-lg text-ui-text-primary mb-2">Sua tela de treinos está vazia!</h3>
                        <p className="text-sm">Clique no botão <span className="inline-block mx-1 font-bold text-brand-accent">+</span> para adicionar seu primeiro treino personalizado e começar sua jornada.</p>
                    </div>
                )}
            </div>
             <button
                onClick={handleOpenCreateModal}
                className="fixed bottom-28 right-4 bg-brand-accent text-white w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center z-40 hover:scale-110 transition-transform"
                aria-label="Adicionar Treino Personalizado"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>
        </div>
    );
};

export default WorkoutsTab;
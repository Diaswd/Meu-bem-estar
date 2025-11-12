import React, { useState, useEffect } from 'react';
import { SleepLog, WellnessPractice, Mood, MoodLog } from '../types';
import SleepChart from '../components/SleepChart';
import { mockWellnessPractices } from '../services/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../context/UserContext';
import Accordion from '../components/Accordion';
import { generateSpeech, decode, decodeAudioData } from '../services/geminiService';
import { SpeakerIcon, StopCircleIcon, LoaderIcon } from '../components/icons/Icons';


const moodOptions: { mood: Mood; emoji: string; color: string }[] = [
    { mood: Mood.Feliz, emoji: '😄', color: '#34D399' },
    { mood: Mood.Calmo, emoji: '😌', color: '#60A5FA' },
    { mood: Mood.Neutro, emoji: '😐', color: '#A78BFA' },
    { mood: Mood.Ansioso, emoji: '😟', color: '#FBBF24' },
    { mood: Mood.Triste, emoji: '😢', color: '#F87171' },
];

const WellnessTab: React.FC = () => {
    const { user } = useUser();
    const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(() => {
        try {
            const storedLogs = localStorage.getItem('app-sleep-logs');
            if (storedLogs) {
                return JSON.parse(storedLogs);
            }
        } catch (error) {
            console.error("Failed to parse sleep logs from localStorage", error);
        }
        return [
            { date: '2024-07-25', hoursSlept: 7.5, energyLevel: 4 },
            { date: '2024-07-26', hoursSlept: 6, energyLevel: 2 },
            { date: '2024-07-27', hoursSlept: 8, energyLevel: 5 },
            { date: '2024-07-28', hoursSlept: 7, energyLevel: 3 },
        ];
    });
    
    useEffect(() => {
        try {
            localStorage.setItem('app-sleep-logs', JSON.stringify(sleepLogs));
        } catch (error) {
            console.error("Failed to save sleep logs to localStorage", error);
        }
    }, [sleepLogs]);

    const [hoursSlept, setHoursSlept] = useState('');
    const [energyLevel, setEnergyLevel] = useState(3);

    const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [moodNote, setMoodNote] = useState('');

    const [audioState, setAudioState] = useState<{
        practiceId: number | null;
        isLoading: boolean;
        isPlaying: boolean;
        sourceNode: AudioBufferSourceNode | null;
    }>({ practiceId: null, isLoading: false, isPlaying: false, sourceNode: null });
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

    const handleAddSleepLog = () => {
        if (hoursSlept) {
            const newLog: SleepLog = {
                date: new Date().toISOString().split('T')[0],
                hoursSlept: parseFloat(hoursSlept),
                energyLevel,
            };
            const existingLogIndex = sleepLogs.findIndex(log => log.date === newLog.date);
            if(existingLogIndex > -1) {
                const updatedLogs = [...sleepLogs];
                updatedLogs[existingLogIndex] = newLog;
                setSleepLogs(updatedLogs);
            } else {
                setSleepLogs([...sleepLogs, newLog]);
            }
            setHoursSlept('');
            setEnergyLevel(3);
        }
    };

    const handleAddMoodLog = () => {
        if (selectedMood) {
            const newLog: MoodLog = {
                date: new Date().toISOString(),
                mood: selectedMood,
                note: moodNote,
            };
            setMoodLogs([...moodLogs, newLog]);
            setSelectedMood(null);
            setMoodNote('');
        }
    };

    const moodChartData = moodOptions.map(option => ({
        name: option.emoji,
        count: moodLogs.filter(log => log.mood === option.mood).length,
        fill: option.color
    }));

    // Initialize audio context on first interaction
    const initAudioContext = () => {
        if (!audioContext) {
            const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            setAudioContext(newAudioContext);
            return newAudioContext;
        }
        return audioContext;
    };

    const handlePlayPauseAudio = async (practice: WellnessPractice) => {
        const context = initAudioContext();
        if (!context) return;

        if (audioState.sourceNode && audioState.practiceId !== practice.id) {
            audioState.sourceNode.stop();
        }
        
        if (audioState.isPlaying && audioState.practiceId === practice.id) {
            audioState.sourceNode?.stop();
            setAudioState({ practiceId: null, isLoading: false, isPlaying: false, sourceNode: null });
            return;
        }

        setAudioState({ practiceId: practice.id, isLoading: true, isPlaying: false, sourceNode: null });

        try {
            const fullText = `${practice.title}. ${practice.description}`;
            const base64Audio = await generateSpeech(fullText);
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                context,
                24000,
                1
            );

            const source = context.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(context.destination);
            source.start();
            
            source.onended = () => {
                setAudioState(prevState => {
                    if (prevState.practiceId === practice.id) {
                       return { practiceId: null, isLoading: false, isPlaying: false, sourceNode: null };
                    }
                    return prevState;
                });
            };

            setAudioState({ practiceId: practice.id, isLoading: false, isPlaying: true, sourceNode: source });
        } catch (error) {
            console.error("Failed to play audio", error);
            setAudioState({ practiceId: null, isLoading: false, isPlaying: false, sourceNode: null });
            alert("Não foi possível reproduzir o áudio.");
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-ui-text-primary mb-4">Bem-Estar</h1>
            
            <Accordion title="Registro de Humor" defaultOpen={true}>
                 <h2 className="font-semibold text-md text-ui-text-primary mb-4">Como você está se sentindo agora?</h2>
                <div className="flex justify-around mb-4">
                    {moodOptions.map(({ mood, emoji }) => (
                        <button key={mood} onClick={() => setSelectedMood(mood)} className={`text-4xl p-2 rounded-full transition-transform ${selectedMood === mood ? 'bg-violet-500/30 scale-110' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                            {emoji}
                        </button>
                    ))}
                </div>
                <textarea
                    value={moodNote}
                    onChange={(e) => setMoodNote(e.target.value)}
                    placeholder="Adicione uma nota (opcional)..."
                    className="w-full p-2 bg-ui-input-bg border border-ui-input-border rounded-lg text-sm text-ui-text-primary placeholder-ui-text-secondary"
                    rows={2}
                />
                <button onClick={handleAddMoodLog} disabled={!selectedMood} className="w-full bg-brand-primary-dark text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition mt-3 disabled:bg-gray-400 dark:disabled:bg-gray-600">
                    Registrar Humor
                </button>
            </Accordion>
           

            {moodLogs.length > 0 && (
                <Accordion title="Seu Histórico de Humor">
                     <div className="w-full h-48 mt-4">
                        <ResponsiveContainer>
                            <BarChart data={moodChartData}>
                                <XAxis dataKey="name" tick={{fontSize: 20}}/>
                                <YAxis allowDecimals={false} tick={{fill: 'rgb(156 163 175)'}}/>
                                <Tooltip cursor={{fill: 'rgba(221, 214, 254, 0.3)'}} contentStyle={{backgroundColor: 'rgb(31 41 55)', border: '1px solid rgb(55 65 81)', borderRadius: '8px'}} />
                                <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Accordion>
            )}
            
            <Accordion title="Registro de Sono" defaultOpen={true}>
                {user?.sleepTime && (
                    <p className="text-sm text-violet-800 dark:text-violet-200 bg-violet-200/50 dark:bg-violet-500/20 p-3 rounded-2xl mb-4">
                        ✨ <strong>Dica:</strong> Seu horário de dormir é às {user.sleepTime}. Tente relaxar 30 minutos antes para uma noite de sono ainda melhor.
                    </p>
                )}
                <input type="number" value={hoursSlept} onChange={(e) => setHoursSlept(e.target.value)} className="w-full p-2 bg-ui-input-bg border border-ui-input-border rounded-lg mb-2 text-ui-text-primary" placeholder="Horas dormidas (ex: 7.5)" />
                <label className="block text-sm font-medium text-ui-text-secondary mb-1">Nível de energia ao acordar:</label>
                <div className="flex justify-between mb-4">
                    {[1, 2, 3, 4, 5].map(level => (
                        <button key={level} onClick={() => setEnergyLevel(level)} className={`w-10 h-10 rounded-full font-bold transition-colors ${energyLevel === level ? 'bg-brand-secondary text-white' : 'bg-ui-input-bg text-ui-text-primary'}`}>
                            {level}
                        </button>
                    ))}
                </div>
                <button onClick={handleAddSleepLog} className="w-full bg-brand-primary-dark text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition">
                    Registrar Sono
                </button>
                <SleepChart data={sleepLogs} />
            </Accordion>

             <Accordion title="Práticas de Bem-Estar">
                <div className="space-y-3">
                {mockWellnessPractices.map(p => (
                    <div key={p.id} className="bg-violet-200/50 dark:bg-violet-500/20 p-3 rounded-2xl flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-ui-text-primary">{p.title} ({p.recommendedTime} min)</h3>
                            <p className="text-sm text-ui-text-secondary">{p.description}</p>
                        </div>
                         <button 
                            onClick={() => handlePlayPauseAudio(p)} 
                            className="ml-4 p-2 rounded-full hover:bg-violet-300/50 dark:hover:bg-violet-500/50 transition-colors flex-shrink-0"
                            aria-label={`Ouvir ${p.title}`}
                        >
                            {audioState.practiceId === p.id && audioState.isLoading && <LoaderIcon className="w-6 h-6 text-brand-primary" />}
                            {audioState.practiceId === p.id && audioState.isPlaying && <StopCircleIcon className="w-6 h-6 text-brand-accent" />}
                            {(audioState.practiceId !== p.id || (!audioState.isLoading && !audioState.isPlaying)) && <SpeakerIcon className="w-6 h-6 text-brand-primary" />}
                        </button>
                    </div>
                ))}
                </div>
            </Accordion>
        </div>
    );
};

export default WellnessTab;
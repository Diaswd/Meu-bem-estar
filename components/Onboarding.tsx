import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { ActivityLevel, FitnessExperience, FitnessGoal, DietaryPreference, WellnessGoal, PreferredWorkoutTime } from '../types';

const Onboarding: React.FC = () => {
    const { updateUser } = useUser();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        age: '',
        weight: '',
        height: '',
        activityLevel: ActivityLevel.Sedentario,
        fitnessExperience: FitnessExperience.Iniciante,
        workoutLocation: 'Casa' as 'Casa' | 'Academia',
        fitnessGoal: FitnessGoal.BemEstarGeral,
        dietaryPreferences: [] as DietaryPreference[],
        foodPreferences: '',
        sleepTime: '22:00',
        wakeTime: '06:00',
        wellnessGoals: [] as WellnessGoal[],
        preferredWorkoutTime: PreferredWorkoutTime.Manha,
    });

    const totalSteps = 7;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleMultiSelectToggle = <T,>(field: keyof typeof formData, value: T) => {
        setFormData(prev => {
            const currentValues = (prev[field] as T[]) || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [field]: newValues };
        });
    }

    const handleNext = () => {
        setStep(prev => Math.min(prev + 1, totalSteps));
    };

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = () => {
        updateUser({
            ...formData,
            age: parseInt(formData.age),
            weight: parseFloat(formData.weight),
            height: parseInt(formData.height),
            onboardingComplete: true,
        });
    };
    
    const inputClasses = "w-full p-3 bg-ui-input-bg border border-ui-input-border rounded-lg text-ui-text-primary placeholder-ui-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary";
    const labelClasses = "block text-sm font-medium text-ui-text-secondary mb-2";
    const headingClasses = "text-xl font-bold mb-4 text-ui-text-primary text-center";
    const buttonClasses = "p-2 rounded-lg text-sm border-2 transition-colors";
    const selectedButtonClasses = "bg-brand-secondary border-brand-primary-dark text-white";
    const unselectedButtonClasses = "bg-ui-input-bg border-ui-input-border text-ui-text-primary";

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h2 className={headingClasses}>Sobre Você</h2>
                        <label className={labelClasses}>Idade</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} className={`${inputClasses} mb-4`} placeholder="Sua idade" required />
                        <label className={labelClasses}>Peso (kg)</label>
                        <input type="number" name="weight" value={formData.weight} onChange={handleChange} className={`${inputClasses} mb-4`} placeholder="Ex: 65.5" required />
                        <label className={labelClasses}>Altura (cm)</label>
                        <input type="number" name="height" value={formData.height} onChange={handleChange} className={inputClasses} placeholder="Ex: 170" required />
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h2 className={headingClasses}>Atividade & Experiência</h2>
                        <label className={labelClasses}>Seu nível de atividade diária (fora treinos)</label>
                        <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className={`${inputClasses} mb-4`}>
                            {Object.values(ActivityLevel).map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                         <label className={labelClasses}>Sua experiência com treinos</label>
                        <select name="fitnessExperience" value={formData.fitnessExperience} onChange={handleChange} className={inputClasses}>
                            {Object.values(FitnessExperience).map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </div>
                );
            case 3:
                 return (
                    <div>
                        <h2 className={headingClasses}>Sua Rotina de Treino</h2>
                         <label className={labelClasses}>Onde você prefere treinar?</label>
                        <select name="workoutLocation" value={formData.workoutLocation} onChange={handleChange} className={`${inputClasses} mb-4`}>
                            <option value="Casa">Em Casa</option>
                            <option value="Academia">Na Academia</option>
                        </select>
                        <label className={labelClasses}>Qual seu horário preferido para treinar?</label>
                        <select name="preferredWorkoutTime" value={formData.preferredWorkoutTime} onChange={handleChange} className={inputClasses}>
                            {Object.values(PreferredWorkoutTime).map(time => <option key={time} value={time}>{time}</option>)}
                        </select>
                    </div>
                );
            case 4:
                return (
                    <div>
                        <h2 className={headingClasses}>Seus Objetivos</h2>
                        <label className={labelClasses}>Qual seu principal objetivo de fitness?</label>
                        <select name="fitnessGoal" value={formData.fitnessGoal} onChange={handleChange} className={`${inputClasses} mb-4`}>
                             {Object.values(FitnessGoal).map(goal => <option key={goal} value={goal}>{goal}</option>)}
                        </select>
                    </div>
                );
            case 5:
                const wellnessOptions = Object.values(WellnessGoal);
                return (
                    <div>
                        <h2 className={headingClasses}>Foco em Bem-Estar</h2>
                        <label className={labelClasses}>Quais áreas de bem-estar você quer focar? (opcional)</label>
                        <div className="grid grid-cols-2 gap-2">
                            {wellnessOptions.map(goal => (
                                <button key={goal} type="button" onClick={() => handleMultiSelectToggle('wellnessGoals', goal)} className={`${buttonClasses} ${formData.wellnessGoals.includes(goal) ? selectedButtonClasses : unselectedButtonClasses}`}>
                                    {goal}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 6:
                const dietaryOptions: DietaryPreference[] = ['Vegetariano', 'Vegano', 'Sem Glúten', 'Sem Lactose'];
                return (
                    <div>
                        <h2 className={headingClasses}>Preferências Alimentares</h2>
                        <label className={labelClasses}>Você tem alguma restrição ou preferência? (opcional)</label>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {dietaryOptions.map(pref => (
                                <button key={pref} type="button" onClick={() => handleMultiSelectToggle('dietaryPreferences', pref)} className={`${buttonClasses} ${formData.dietaryPreferences.includes(pref) ? selectedButtonClasses : unselectedButtonClasses}`}>
                                    {pref}
                                </button>
                            ))}
                        </div>
                        <label className={labelClasses}>Algo que você ame ou odeie comer? (opcional)</label>
                        <textarea name="foodPreferences" value={formData.foodPreferences} onChange={handleChange} className={inputClasses} rows={2} placeholder="Ex: Amo abacate, não gosto de coentro."/>
                    </div>
                );
            case 7:
                 return (
                    <div>
                        <h2 className={headingClasses}>Seus Hábitos de Sono</h2>
                        <label className={labelClasses}>Que horas você costuma dormir?</label>
                        <input type="time" name="sleepTime" value={formData.sleepTime} onChange={handleChange} className={`${inputClasses} mb-4`} required style={{colorScheme: 'dark'}}/>
                        <label className={labelClasses}>Que horas você costuma acordar?</label>
                        <input type="time" name="wakeTime" value={formData.wakeTime} onChange={handleChange} className={inputClasses} required style={{colorScheme: 'dark'}}/>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-ui-card backdrop-blur-xl border border-ui-card-border p-8 rounded-3xl shadow-lg">
                <h1 className="text-2xl font-bold text-center text-brand-primary mb-2">Personalize sua Jornada</h1>
                <p className="text-center text-ui-text-secondary mb-6">Responda algumas perguntas para uma experiência única.</p>

                <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                    <div className="bg-brand-secondary h-2 rounded-full transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                </div>

                <div className="min-h-[320px]">
                    {renderStep()}
                </div>

                <div className="flex justify-between mt-6">
                    {step > 1 ? (
                        <button onClick={handleBack} className="bg-slate-300 dark:bg-gray-700 text-ui-text-primary font-bold py-3 px-6 rounded-lg">Voltar</button>
                    ) : <div/> }
                    {step < totalSteps ? (
                        <button onClick={handleNext} className="bg-brand-primary-dark text-white font-bold py-3 px-6 rounded-lg ml-auto">Próximo</button>
                    ) : (
                        <button onClick={handleSubmit} className="bg-brand-accent text-white font-bold py-3 px-6 rounded-lg ml-auto">Concluir</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
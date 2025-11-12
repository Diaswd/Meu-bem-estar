import React, { useState, useEffect } from 'react';
import { Workout, WorkoutDifficulty, WorkoutType } from '../types';
import { TrashIcon, SparklesIcon, LoaderIcon } from './icons/Icons';
import { useUser } from '../context/UserContext';
import { generateWorkoutDescription } from '../services/geminiService';
import { predefinedExercises } from '../services/mockData';

interface CustomWorkoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (workout: Omit<Workout, 'id' | 'completed' | 'imageUrl'>, aspectRatio: '16:9') => void;
    onUpdate: (workout: Workout) => void;
    onDelete: (workoutId: number) => void;
    workoutToEdit: Workout | null;
}

const CustomWorkoutModal: React.FC<CustomWorkoutModalProps> = ({ isOpen, onClose, onSave, onUpdate, onDelete, workoutToEdit }) => {
    const { user } = useUser();
    const isEditing = workoutToEdit !== null;

    const getInitialState = () => {
        if (isEditing && workoutToEdit) {
            return workoutToEdit;
        }

        const defaultType = Object.keys(predefinedExercises)[0] as WorkoutType;
        const goalsForDefaultType = Object.keys(predefinedExercises[defaultType] || {});
        const defaultGoal = goalsForDefaultType[0] || '';
        const exercisesForDefault = predefinedExercises[defaultType]?.[defaultGoal] || [];
        const defaultName = exercisesForDefault[0] || '';
        
        return {
            name: defaultName,
            goal: defaultGoal,
            location: 'Casa' as 'Casa' | 'Academia',
            equipment: ['Nenhum'],
            sets: 3,
            workTime: 45,
            restTime: 15,
            description: '',
            tips: '',
            difficulty: WorkoutDifficulty.Iniciante,
            targetGender: 'Ambos' as 'Masculino' | 'Feminino' | 'Ambos',
            type: defaultType,
            isCustom: true,
        };
    };

    const [formData, setFormData] = useState(getInitialState());
    const [equipmentInput, setEquipmentInput] = useState(isEditing ? workoutToEdit.equipment.join(', ') : '');
    const [isGenerating, setIsGenerating] = useState(false);

    // This effect handles the dynamic dropdowns.
     useEffect(() => {
        // When type changes, update the goal to the first available goal for that type.
        const availableGoals = Object.keys(predefinedExercises[formData.type] || {});
        if (!availableGoals.includes(formData.goal)) {
            const newGoal = availableGoals[0] || '';
            setFormData(prev => {
                // Now, find the first exercise for this new type/goal combination
                const availableExercises = predefinedExercises[prev.type]?.[newGoal] || [];
                const newName = availableExercises[0] || '';
                return { ...prev, goal: newGoal, name: newName };
            });
        }
        // When goal changes (or has just been updated), update the name to the first exercise.
        else {
            const availableExercises = predefinedExercises[formData.type]?.[formData.goal] || [];
             if (!isEditing && !availableExercises.includes(formData.name)) {
                 setFormData(prev => ({
                    ...prev,
                    name: availableExercises[0] || ''
                }));
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.type, formData.goal]);

    useEffect(() => {
        if (isOpen) {
            const state = getInitialState();
            setFormData(state);
            setEquipmentInput(isEditing && workoutToEdit ? workoutToEdit.equipment.join(', ') : '');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, workoutToEdit]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumberField = ['sets', 'workTime', 'restTime'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumberField ? parseInt(value) || 0 : value }));
    };

    const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEquipmentInput(e.target.value);
        const equipmentArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
        setFormData(prev => ({...prev, equipment: equipmentArray.length > 0 ? equipmentArray : ['Nenhum']}));
    };

    const handleGenerateDescription = async () => {
        if (!user) {
            alert("Usuário não encontrado. Não é possível gerar a descrição.");
            return;
        }
        if (!formData.name || !formData.goal) {
            alert("Por favor, preencha pelo menos o Nome e o Objetivo do treino antes de gerar a descrição.");
            return;
        }
        setIsGenerating(true);
        try {
            const result = await generateWorkoutDescription(user, formData);
            setFormData(prev => ({
                ...prev,
                description: result.description,
                tips: result.tips,
            }));
        } catch (error) {
            console.error(error);
            alert("Ocorreu um erro ao gerar a descrição. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = () => {
        // Simple validation
        if (!formData.name || !formData.description) {
            alert("Por favor, selecione um exercício e preencha a descrição do treino.");
            return;
        }

        if (isEditing) {
            onUpdate(formData as Workout);
        } else {
            onSave(formData, '16:9');
        }
    };

    const handleDelete = () => {
        if (isEditing && workoutToEdit && window.confirm(`Tem certeza que deseja excluir o treino "${workoutToEdit.name}"?`)) {
            onDelete(workoutToEdit.id);
        }
    };
    
    const inputClasses = "w-full p-2 bg-ui-input-bg border border-ui-input-border rounded-lg text-ui-text-primary placeholder-ui-text-secondary";
    const availableGoals = Object.keys(predefinedExercises[formData.type] || {});
    const availableExercises = predefinedExercises[formData.type]?.[formData.goal] || [];

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-50/70 dark:bg-gray-900/60 backdrop-blur-xl border border-ui-card-border rounded-3xl shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-ui-text-primary mb-4">{isEditing ? 'Editar Treino' : 'Criar Treino Personalizado'}</h2>
                
                {!isEditing && (
                    <div className="bg-slate-200/60 dark:bg-gray-700/60 text-ui-text-secondary p-3 rounded-2xl text-center text-sm mb-4 border border-dashed border-slate-300 dark:border-gray-600">
                        Uma imagem ilustrativa no formato widescreen (16:9) será gerada automaticamente pela IA.
                    </div>
                )}


                <div className="space-y-4">

                    {/* Type & Goal */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-ui-text-secondary mb-1">Tipo de Treino</label>
                            <select name="type" value={formData.type} onChange={handleChange} className={inputClasses}>
                                {Object.keys(predefinedExercises).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-ui-text-secondary mb-1">Objetivo</label>
                            <select name="goal" value={formData.goal} onChange={handleChange} className={inputClasses} disabled={availableGoals.length === 0}>
                                {availableGoals.map(goal => <option key={goal} value={goal}>{goal}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {/* Exercise Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-ui-text-secondary mb-1">Exercício</label>
                        <select name="name" value={formData.name} onChange={handleChange} className={inputClasses} disabled={availableExercises.length === 0}>
                             {availableExercises.length > 0 ? (
                                availableExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)
                            ) : (
                                <option>Nenhum exercício para esta seleção</option>
                            )}
                        </select>
                    </div>

                    {/* Location, Difficulty, Gender */}
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-ui-text-secondary mb-1">Local</label>
                            <select name="location" value={formData.location} onChange={handleChange} className={inputClasses}>
                                <option value="Casa">Casa</option>
                                <option value="Academia">Academia</option>
                            </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-ui-text-secondary mb-1">Dificuldade</label>
                            <select name="difficulty" value={formData.difficulty} onChange={handleChange} className={inputClasses}>
                                {Object.values(WorkoutDifficulty).map(level => <option key={level} value={level}>{level}</option>)}
                            </select>
                        </div>
                         <div className="col-span-2 md:col-span-1">
                           <label className="block text-sm font-medium text-ui-text-secondary mb-1">Gênero Alvo</label>
                            <select name="targetGender" value={formData.targetGender} onChange={handleChange} className={inputClasses}>
                                <option value="Ambos">Ambos</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Timer Settings */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-ui-text-secondary mb-1">Séries</label>
                            <input type="number" name="sets" value={formData.sets} onChange={handleChange} className={inputClasses}/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-ui-text-secondary mb-1">Exercício (s)</label>
                            <input type="number" name="workTime" value={formData.workTime} onChange={handleChange} className={inputClasses}/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-ui-text-secondary mb-1">Descanso (s)</label>
                            <input type="number" name="restTime" value={formData.restTime} onChange={handleChange} className={inputClasses}/>
                        </div>
                    </div>
                    
                    {/* Equipment */}
                     <div>
                        <label className="block text-sm font-medium text-ui-text-secondary mb-1">Equipamento (separado por vírgula)</label>
                        <input type="text" name="equipment" value={equipmentInput} onChange={handleEquipmentChange} className={inputClasses} placeholder="Ex: Halteres, Corda"/>
                    </div>

                     {/* Description & Tips */}
                    <div>
                        <label className="block text-sm font-medium text-ui-text-secondary mb-1">Descrição</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className={`${inputClasses} min-h-[80px]`} rows={3} placeholder="Descreva o exercício ou gere com IA abaixo."/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-ui-text-secondary mb-1">Dicas (opcional)</label>
                        <textarea name="tips" value={formData.tips} onChange={handleChange} className={`${inputClasses} min-h-[40px]`} rows={2} placeholder="Dicas para o exercício ou gere com IA abaixo."/>
                    </div>
                     <div>
                        <button
                            onClick={handleGenerateDescription}
                            disabled={isGenerating}
                            className="w-full mt-2 bg-brand-secondary text-white font-bold py-2.5 rounded-lg hover:bg-opacity-90 transition flex items-center justify-center gap-2 disabled:bg-violet-800"
                        >
                            {isGenerating ? <LoaderIcon className="w-5 h-5" /> : <SparklesIcon />}
                            {isGenerating ? 'Gerando...' : 'Gerar Descrição e Dicas com IA'}
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                     {isEditing ? (
                        <button onClick={handleDelete} className="flex items-center gap-2 text-red-500 hover:text-red-700 font-semibold py-2 px-4 rounded-lg transition-colors">
                            <TrashIcon className="w-5 h-5"/>
                            Excluir
                        </button>
                    ) : <div />}
                    <div className="flex gap-3">
                        <button onClick={onClose} className="bg-slate-300 dark:bg-gray-600 text-slate-700 dark:text-gray-200 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                        <button onClick={handleSubmit} className="bg-brand-primary-dark text-white font-bold py-2 px-4 rounded-lg">{isEditing ? 'Salvar Alterações' : 'Salvar Treino'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomWorkoutModal;
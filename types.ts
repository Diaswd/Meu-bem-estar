import { ReactNode } from 'react';

export type Tab = 'home' | 'workouts' | 'nutrition' | 'wellness' | 'cycle' | 'tips' | 'challenges';

export interface NavItem {
    id: Tab;
    label: string;
    icon: ReactNode;
}

export enum ActivityLevel {
    Sedentario = "Sedentário(a)",
    Leve = "Levemente Ativo(a)",
    Moderado = "Moderadamente Ativo(a)",
    Muito = "Muito Ativo(a)",
}

export enum FitnessExperience {
    Iniciante = "Nunca treinei ou treino esporadicamente",
    Intermediario = "Já treinei consistentemente por um tempo",
    Avancado = "Treino de forma consistente e avançada",
}

export enum FitnessGoal {
    PerderPeso = "Queimar Gordura & Cardio",
    GanharMassa = "Ganhar Massa Muscular",
    MelhorarResistencia = "Melhorar Resistência",
    AumentarFlexibilidade = "Flexibilidade & Mobilidade",
    BemEstarGeral = "Bem-Estar e Saúde Geral",
}

export type DietaryPreference = 'Vegetariano' | 'Vegano' | 'Sem Glúten' | 'Sem Lactose';

export enum WellnessGoal {
    ReduzirEstresse = "Reduzir Estresse",
    MelhorarFoco = "Melhorar o Foco",
    AumentarEnergia = "Aumentar a Energia",
    DormirMelhor = "Dormir Melhor",
}

export enum PreferredWorkoutTime {
    Manha = "Manhã (5:00 - 11:00)",
    Tarde = "Tarde (11:00 - 17:00)",
    Noite = "Noite (17:00 - 22:00)",
}


export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    gender: 'Masculino' | 'Feminino';
    onboardingComplete: boolean;
    age?: number;
    weight?: number; // in kg
    height?: number; // in cm
    activityLevel?: ActivityLevel;
    sleepTime?: string; // HH:MM
    wakeTime?: string; // HH:MM
    fitnessExperience?: FitnessExperience;
    fitnessGoal?: FitnessGoal;
    dietaryPreferences?: DietaryPreference[];
    foodPreferences?: string; // open text for likes/dislikes
    workoutLocation?: 'Casa' | 'Academia';
    wellnessGoals?: WellnessGoal[];
    preferredWorkoutTime?: PreferredWorkoutTime;
}

export enum WorkoutDifficulty {
    Iniciante = "Iniciante",
    Intermediario = "Intermediário",
    Avancado = "Avançado",
}

export enum WorkoutType {
    Cardio = "Cardio",
    Forca = "Força",
    Alongamento = "Alongamento",
    Funcional = "Funcional",
    Yoga = "Yoga",
    Hipertrofia = "Hipertrofia"
}

export interface Workout {
    id: number;
    name: string;
    goal: string;
    location: 'Casa' | 'Academia';
    equipment: string[];
    sets: number; // e.g., 3
    workTime: number; // in seconds, e.g., 45
    restTime: number; // in seconds, e.g., 15
    description: string;
    videoUrl?: string;
    tips?: string;
    completed: boolean;
    difficulty: WorkoutDifficulty;
    imageUrl?: string;
    targetGender: 'Masculino' | 'Feminino' | 'Ambos';
    type: WorkoutType;
    isCustom?: boolean;
    isLoadingImage?: boolean;
}

export enum RecipeCategory {
    CafeDaManha = "Café da Manhã",
    Almoco = "Almoço",
    Jantar = "Jantar",
    Lanche = "Lanche",
    PrePosTreino = "Pré/Pós-Treino"
}

export interface Recipe {
    id: number;
    name: string;
    category: RecipeCategory;
    ingredients: string[];
    instructions: string;
    calories: number;
    nutritionTips?: string;
    isFavorite: boolean;
}

export interface SleepLog {
    date: string; // YYYY-MM-DD
    hoursSlept: number;
    energyLevel: number; // 1 to 5
}

export enum Mood {
    Feliz = 'Feliz',
    Calmo = 'Calmo',
    Ansioso = 'Ansioso',
    Triste = 'Triste',
    Neutro = 'Neutro'
}

export interface MoodLog {
    date: string; // YYYY-MM-DD HH:mm:ss
    mood: Mood;
    note?: string;
}

export interface WellnessPractice {
    id: number;
    title: string;
    recommendedTime: number; // in minutes
    description: string;
    audioUrl?: string;
}

export enum CyclePhase {
    Menstruacao = "Menstruação",
    Folicular = "Folicular",
    Ovulatoria = "Ovulatória",
    Lutea = "Lútea",
    Desconhecida = "Desconhecida"
}

export interface CycleData {
    lastPeriodDate: string | null;
    averageCycleLength: number;
}

export enum HealthTipCategory {
    Fisica = "Física",
    Mental = "Mental",
    Emocional = "Emocional"
}

export interface HealthTip {
    id: number;
    title: string;
    category: HealthTipCategory;
    content: string;
    publishedDate: string;
    isLiked: boolean;
    isSaved: boolean;
}

export interface Challenge {
    id: number;
    title: string;
    description: string;
    type: 'predefined' | 'custom';
    goalValue: number;
    currentValue: number;
    unit: string;
}

export interface WearableData {
    steps: number;
    goalSteps: number;
    activeCalories: number;
    goalCalories: number;
    distance: number; // in km
    heartRate?: {
        current: number;
        resting: number;
    };
}
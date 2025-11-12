import { Recipe, RecipeCategory, WellnessPractice, HealthTip, HealthTipCategory, Challenge, WorkoutType } from '../types';

// Mantido para ser usado no modal de criação de treinos
export const workoutGoals: string[] = [
    'Pernas e Glúteos',
    'Peito e Tríceps',
    'Costas e Ombros',
    'Braços (Bíceps e Tríceps)',
    'Core / Abdômen',
    'Cardio / Resistência',
    'Alongamentos e Mobilidade',
    'Ombros',
];

export const predefinedExercises: Record<string, Record<string, string[]>> = {
    [WorkoutType.Funcional]: {
        'Pernas e Glúteos': ['Agachamento com peso corporal', 'Afundo', 'Elevação pélvica', 'Agachamento sumô', 'Stiff unilateral'],
        'Core / Abdômen': ['Prancha', 'Abdominal remador', 'Elevação de pernas', 'Prancha lateral', 'Toque no calcanhar'],
        'Cardio / Resistência': ['Polichinelo', 'Corrida estacionária', 'Burpee adaptado', 'Salto com corda imaginária'],
    },
    [WorkoutType.Forca]: {
        'Pernas e Glúteos': ['Agachamento com halteres', 'Levantamento terra com halteres', 'Afundo com halteres', 'Cadeira extensora', 'Mesa flexora'],
        'Peito e Tríceps': ['Supino reto com halteres', 'Flexão de braço', 'Mergulho no banco', 'Tríceps testa com halteres', 'Crucifixo'],
        'Costas e Ombros': ['Remada curvada com halteres', 'Desenvolvimento de ombros com halteres', 'Puxada alta (com elástico)', 'Elevação lateral com halteres'],
        'Braços (Bíceps e Tríceceps)': ['Rosca direta com halteres', 'Rosca martelo', 'Tríceps coice', 'Tríceps francês'],
        'Ombros': ['Desenvolvimento de ombros com halteres', 'Elevação lateral com halteres', 'Elevação frontal com halteres', 'Remada alta'],
    },
    [WorkoutType.Hipertrofia]: {
        'Pernas e Glúteos': ['Agachamento livre', 'Leg press', 'Stiff', 'Cadeira extensora (drop set)', 'Afundo búlgaro'],
        'Peito e Tríceps': ['Supino inclinado', 'Crucifixo com halteres', 'Flexão declinada', 'Tríceps na polia alta'],
        'Costas e Ombros': ['Barra fixa', 'Remada serrote', 'Puxada frontal', 'Desenvolvimento militar'],
        'Braços (Bíceps e Tríceps)': ['Rosca Scott', 'Rosca concentrada', 'Tríceps testa na polia', 'Paralelas'],
    },
    [WorkoutType.Cardio]: {
        'Cardio / Resistência': ['Corrida na esteira', 'Bicicleta ergométrica', 'Elíptico', 'Escada', 'Remo'],
    },
    [WorkoutType.Alongamento]: {
        'Alongamentos e Mobilidade': ['Alongamento de isquiotibiais', 'Alongamento de quadríceps', 'Postura do pombo (Yoga)', 'Rotação de tronco', 'Alongamento de ombros e peito'],
    },
    [WorkoutType.Yoga]: {
        'Alongamentos e Mobilidade': ['Saudação ao Sol', 'Postura do cachorro olhando para baixo', 'Postura do guerreiro II', 'Postura da árvore', 'Savasana'],
    }
};


export const mockRecipes: Recipe[] = [
    {
        id: 1,
        name: 'Smoothie Verde Detox',
        category: RecipeCategory.CafeDaManha,
        ingredients: ['1 xícara de espinafre', '1/2 banana congelada', '1/4 abacate', '1 colher de sopa de sementes de chia', '1 xícara de água de coco'],
        instructions: 'Bata todos os ingredientes no liquidificador até ficar homogêneo. Sirva imediatamente.',
        calories: 250,
        nutritionTips: 'Rico em fibras, vitaminas e gorduras saudáveis para começar o dia com energia.',
        isFavorite: false
    },
    {
        id: 2,
        name: 'Salada de Quinoa com Grão de Bico',
        category: RecipeCategory.Almoco,
        ingredients: ['1 xícara de quinoa cozida', '1 lata de grão de bico', '1 pepino picado', '1 tomate picado', 'Salsinha a gosto', 'Suco de 1 limão', '2 colheres de sopa de azeite'],
        instructions: 'Misture todos os ingredientes em uma tigela grande. Tempere com sal e pimenta a gosto.',
        calories: 400,
        nutritionTips: 'Uma refeição completa, rica em proteínas vegetais e carboidratos complexos.',
        isFavorite: true
    },
    {
        id: 3,
        name: 'Sopa de Lentilha Aconchegante',
        category: RecipeCategory.Jantar,
        ingredients: ['1 xícara de lentilha', '1 cenoura picada', '1 talo de aipo picado', '1/2 cebola picada', '4 xícaras de caldo de legumes', '1 colher de chá de cominho'],
        instructions: 'Refogue os vegetais, adicione a lentilha e o caldo. Cozinhe por 25-30 minutos.',
        calories: 300,
        isFavorite: false
    }
];


export const mockWellnessPractices: WellnessPractice[] = [
    {
        id: 1,
        title: 'Respiração 4-7-8 para Relaxar',
        recommendedTime: 5,
        description: 'Inspire pelo nariz por 4 segundos, segure a respiração por 7 segundos e expire pela boca por 8 segundos. Repita por alguns minutos para acalmar o sistema nervoso.',
        audioUrl: ''
    },
    {
        id: 2,
        title: 'Meditação Guiada para uma Noite de Sono Profundo',
        recommendedTime: 10,
        description: 'Deixe-se levar por uma meditação guiada para liberar as tensões do dia e preparar seu corpo e mente para um sono reparador.',
        audioUrl: ''
    },
    {
        id: 3,
        title: 'Alongamento Noturno Suave',
        recommendedTime: 7,
        description: 'Faça alongamentos leves para relaxar os músculos antes de dormir. Concentre-se no pescoço, ombros e pernas.',
    }
];

export const mockHealthTips: HealthTip[] = [
    {
        id: 1,
        title: 'Beba Água, Mesmo Sem Sede',
        category: HealthTipCategory.Fisica,
        content: 'Manter-se hidratada é crucial para a energia, pele e função cerebral. Tenha sempre uma garrafa de água por perto.',
        publishedDate: '2024-07-28',
        isLiked: false,
        isSaved: false
    },
    {
        id: 2,
        title: 'Pratique a Gratidão Diária',
        category: HealthTipCategory.Mental,
        content: 'Tire 5 minutos do seu dia para listar 3 coisas pelas quais você é grata. Isso pode mudar sua perspectiva e melhorar o humor.',
        publishedDate: '2024-07-27',
        isLiked: true,
        isSaved: true
    },
    {
        id: 3,
        title: 'Aprenda a Dizer Não',
        category: HealthTipCategory.Emocional,
        content: 'Proteger sua energia é uma forma de autocuidado. Dizer não a compromissos que te sobrecarregam é saudável e necessário.',
        publishedDate: '2024-07-26',
        isLiked: false,
        isSaved: false
    },
     {
        id: 4,
        title: 'Movimente-se a Cada Hora',
        category: HealthTipCategory.Fisica,
        content: 'Se você trabalha sentado, levante-se e caminhe por 2-3 minutos a cada hora para melhorar a circulação e reduzir a rigidez.',
        publishedDate: '2024-07-29',
        isLiked: false,
        isSaved: false
    },
    {
        id: 5,
        title: 'Respire Fundo Antes de Reagir',
        category: HealthTipCategory.Mental,
        content: 'Quando sentir raiva ou estresse, faça uma pausa e respire fundo três vezes. Isso cria um espaço para uma resposta mais calma e consciente.',
        publishedDate: '2024-07-30',
        isLiked: false,
        isSaved: false
    }
];

export const mockChallenges: Challenge[] = [
    {
        id: 1,
        title: 'Semana de Hidratação',
        description: 'Beba 8 copos de água todos os dias por 7 dias seguidos.',
        type: 'predefined',
        goalValue: 7,
        currentValue: 3,
        unit: 'dias'
    },
    {
        id: 2,
        title: '3 Treinos na Semana',
        description: 'Complete 3 treinos de qualquer tipo durante a semana.',
        type: 'predefined',
        goalValue: 3,
        currentValue: 1,
        unit: 'treinos'
    },
    {
        id: 3,
        title: '5 Noites de Sono Reparador',
        description: 'Durma pelo menos 7 horas por noite, 5 vezes nesta semana.',
        type: 'predefined',
        goalValue: 5,
        currentValue: 4,
        unit: 'noites'
    }
];
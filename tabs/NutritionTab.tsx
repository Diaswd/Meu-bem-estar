import React, { useState } from 'react';
import { mockRecipes } from '../services/mockData';
import { Recipe } from '../types';
import { useUser } from '../context/UserContext';
import { generatePersonalizedRecipe, generateShoppingList, generateRecipesFromIngredients } from '../services/geminiService';
import { SparklesIcon } from '../components/icons/Icons';
import Accordion from '../components/Accordion';
import MarkdownRenderer from '../components/MarkdownRenderer';

const RecipeCard: React.FC<{ recipe: Recipe, onToggleFavorite: (id: number) => void }> = ({ recipe, onToggleFavorite }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-ui-card backdrop-blur-xl border border-ui-card-border p-4 rounded-3xl shadow-lg mb-4">
            <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div>
                    <h3 className="text-lg font-bold text-ui-text-primary">{recipe.name}</h3>
                    <p className="text-sm text-ui-text-secondary">{recipe.category} - {recipe.calories} kcal</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(recipe.id); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={recipe.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" className={`w-6 h-6 ${recipe.isFavorite ? 'text-brand-accent' : 'text-gray-400 dark:text-gray-500'}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                    </svg>
                </button>
            </div>
            {isOpen && (
                <div className="mt-4 border-t border-ui-card-border pt-4">
                    <h4 className="font-semibold mb-2 text-ui-text-primary">Ingredientes:</h4>
                    <ul className="list-disc list-inside text-sm text-ui-text-primary space-y-1">
                        {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                    </ul>
                    <h4 className="font-semibold mt-4 mb-2 text-ui-text-primary">Modo de Preparo:</h4>
                    <p className="text-sm text-ui-text-primary">{recipe.instructions}</p>
                    {recipe.nutritionTips && <p className="text-xs text-violet-800 dark:text-violet-200 bg-violet-200/50 dark:bg-violet-500/20 p-2 rounded-lg mt-4">{recipe.nutritionTips}</p>}
                </div>
            )}
        </div>
    );
};

const NutritionTab: React.FC = () => {
    const { user } = useUser();
    const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
    const [searchTerm, setSearchTerm] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState<string>('');
    const [aiShoppingList, setAiShoppingList] = useState<string>('');
    const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [activeAiTab, setActiveAiTab] = useState<'recipe' | 'list'>('recipe');

    // New state for "Cook with what you have" feature
    const [userIngredients, setUserIngredients] = useState('');
    const [isLoadingFromIngredients, setIsLoadingFromIngredients] = useState(false);
    const [generationError, setGenerationError] = useState('');

    const handleToggleFavorite = (id: number) => {
        setRecipes(recipes.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
    };

    const handleGetAISuggestion = async () => {
        if (!user) return;
        setIsLoadingRecipe(true);
        setAiSuggestion('');
        const suggestion = await generatePersonalizedRecipe(user);
        setAiSuggestion(suggestion);
        setIsLoadingRecipe(false);
    }
    
    const handleGetAIShoppingList = async () => {
        if (!user) return;
        setIsLoadingList(true);
        setAiShoppingList('');
        const list = await generateShoppingList(user);
        setAiShoppingList(list);
        setIsLoadingList(false);
    }

    const handleGenerateFromIngredients = async () => {
        if (!userIngredients.trim()) {
            setGenerationError("Por favor, insira pelo menos um ingrediente.");
            return;
        }
        setIsLoadingFromIngredients(true);
        setGenerationError('');
        const generated = await generateRecipesFromIngredients(userIngredients);
        if (generated && generated.length > 0) {
            const newRecipes: Recipe[] = generated.map(r => ({
                ...r,
                id: Date.now() + Math.random(), // simple unique ID
                isFavorite: false,
            }));
            setRecipes(prev => [...newRecipes, ...prev]);
            setUserIngredients(''); // Clear input on success
        } else {
            setGenerationError("Não foi possível gerar receitas. Tente ingredientes diferentes ou novamente mais tarde.");
        }
        setIsLoadingFromIngredients(false);
    };

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const AiContent: React.FC<{content: string, isLoading: boolean}> = ({ content, isLoading }) => {
        if (isLoading) {
            return (
                <div className="mt-4 pt-4 space-y-2 animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mt-2"></div>
                </div>
            );
        }
        if (content) {
            return <MarkdownRenderer content={content} className="mt-4 pt-4 prose prose-sm max-w-none prose-p:text-ui-text-primary prose-strong:text-brand-primary prose-li:text-ui-text-primary" />;
        }
        return null;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-ui-text-primary mb-4">Alimentação</h1>
            
            <Accordion title="Sugestão com IA" defaultOpen={true}>
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    <button onClick={() => setActiveAiTab('recipe')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeAiTab === 'recipe' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-ui-text-secondary'}`}>Receita do Dia</button>
                    <button onClick={() => setActiveAiTab('list')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeAiTab === 'list' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-ui-text-secondary'}`}>Lista de Compras</button>
                </div>

                {activeAiTab === 'recipe' && (
                    <>
                        <p className="text-sm text-ui-text-secondary mb-4">Receba uma receita personalizada com base no seu perfil e objetivos.</p>
                        <button onClick={handleGetAISuggestion} disabled={isLoadingRecipe} className="w-full bg-brand-primary-dark text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition flex items-center justify-center gap-2 disabled:bg-gray-400 dark:disabled:bg-gray-600">
                            {isLoadingRecipe ? 'Gerando...' : 'Me dê uma ideia!'}
                            {!isLoadingRecipe && <SparklesIcon />}
                        </button>
                        <AiContent content={aiSuggestion} isLoading={isLoadingRecipe} />
                    </>
                )}
                {activeAiTab === 'list' && (
                    <>
                        <p className="text-sm text-ui-text-secondary mb-4">Gere uma lista de compras semanal com base nas suas preferências.</p>
                        <button onClick={handleGetAIShoppingList} disabled={isLoadingList} className="w-full bg-brand-primary-dark text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition flex items-center justify-center gap-2 disabled:bg-gray-400 dark:disabled:bg-gray-600">
                            {isLoadingList ? 'Gerando...' : 'Criar Lista'}
                            {!isLoadingList && <SparklesIcon />}
                        </button>
                        <AiContent content={aiShoppingList} isLoading={isLoadingList} />
                    </>
                )}
            </Accordion>
            
            <Accordion title="Cozinhe com o que Você Tem" defaultOpen={true}>
                <p className="text-sm text-ui-text-secondary mb-3">Liste os ingredientes que você tem em casa (separados por vírgula) e a IA criará receitas para você.</p>
                <textarea
                    placeholder="Ex: frango, tomate, arroz, cebola..."
                    value={userIngredients}
                    onChange={(e) => setUserIngredients(e.target.value)}
                    className="w-full p-3 mb-3 bg-ui-input-bg border border-ui-input-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary text-ui-text-primary placeholder-ui-text-secondary"
                    rows={3}
                />
                {generationError && <p className="text-red-500 text-xs text-center mb-2">{generationError}</p>}
                <button onClick={handleGenerateFromIngredients} disabled={isLoadingFromIngredients} className="w-full bg-brand-accent text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition flex items-center justify-center gap-2 disabled:bg-pink-700">
                    {isLoadingFromIngredients ? 'Criando Receitas...' : 'Gerar Receitas'}
                    {!isLoadingFromIngredients && <SparklesIcon />}
                </button>
                 <p className="text-xs text-ui-text-secondary mt-2 text-center">As receitas geradas aparecerão na lista abaixo.</p>
            </Accordion>

            <Accordion title="Explorar Receitas" defaultOpen={true}>
                <input
                    type="text"
                    placeholder="Buscar por nome ou ingrediente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 mb-4 bg-ui-input-bg border border-ui-input-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary text-ui-text-primary placeholder-ui-text-secondary"
                />
                <div>
                    {filteredRecipes.length > 0 
                        ? filteredRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={handleToggleFavorite} />)
                        : <p className="text-center text-ui-text-secondary mt-8">Nenhuma receita encontrada. Tente gerar uma com a IA!</p>
                    }
                </div>
            </Accordion>
        </div>
    );
};

export default NutritionTab;
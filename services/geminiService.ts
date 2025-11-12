import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { CyclePhase, User, Workout, Recipe, RecipeCategory } from '../types';

// IMPORTANT: This key is managed by the execution environment. Do not change it.
const API_KEY = process.env.API_KEY as string;

const getGenAI = () => {
  if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

// --- AUDIO UTILS for TTS ---
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const generateCycleTips = async (phase: CyclePhase, currentDayInCycle: number, userName: string): Promise<string> => {
    if (phase === CyclePhase.Desconhecida) {
        return "Insira a data do seu último ciclo para receber dicas personalizadas.";
    }

    try {
        const ai = getGenAI();
        const prompt = `Aja como uma coach de bem-estar feminina, super amigável e motivadora. Crie um conteúdo para uma mulher chamada ${userName} que está na fase '${phase}' (dia ${currentDayInCycle} do ciclo).
O tom deve ser leve, dinâmico e muito fácil de entender.

**REGRAS ESTRITAS DE FORMATAÇÃO:**
1.  **NÃO inclua** qualquer preâmbulo ou frase introdutória como "Claro! Aqui está...".
2.  Comece **DIRETAMENTE** com uma saudação calorosa, como "Olá, ${userName}!" ou "Olá, maravilhosa!".
3.  Use o formato markdown. Para os títulos das seções, use "### [Título] [Emoji]". Exemplo: "### Treino 🧘‍♀️". **NÃO** use negrito (**) nos títulos.
4.  Após os títulos, explique a dica e o "porquê" de forma simples e direta, usando negrito para destacar o "porquê". Exemplo: "**O porquê:**...".
5.  Finalize com uma mensagem curta, positiva e encorajadora.`;


        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating cycle tips:", error);
        return "Não foi possível gerar dicas no momento. Tente novamente mais tarde.";
    }
};

export const generateCycleSummary = async (phase: CyclePhase, currentDayInCycle: number): Promise<string> => {
    if (phase === CyclePhase.Desconhecida) {
        return "Atualize seu ciclo para dicas diárias.";
    }
    try {
        const ai = getGenAI();
        const prompt = `Aja como uma coach de bem-estar. Crie uma frase muito curta (máximo 15 palavras) e motivacional para uma mulher na fase '${phase}' (dia ${currentDayInCycle} do ciclo). A frase deve ser positiva e relevante para a fase. Exemplo para fase folicular: "Sua energia está renovada, aproveite este novo começo!".`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Clean up response text
        return response.text.replace(/"/g, '').trim();
    } catch (error) {
        console.error("Error generating cycle summary:", error);
        return "Dica do dia: Ouça seu corpo e cuide-se bem!";
    }
};

export const generatePersonalizedRecipe = async (user: User): Promise<string> => {
    if (!user.onboardingComplete) {
        return "Complete seu perfil para receber sugestões personalizadas."
    }

    try {
        const ai = getGenAI();
        const prompt = `
            Aja como um(a) nutricionista e chef de cozinha. Crie uma receita simples e saudável para uma pessoa com o seguinte perfil:
            - Gênero: ${user.gender}
            - Idade: ${user.age} anos
            - Objetivo de Fitness: ${user.fitnessGoal}
            - Objetivos de Bem-Estar: ${user.wellnessGoals?.join(', ') || 'Não informado'}
            - Nível de Atividade: ${user.activityLevel}
            - Horário de Treino Preferido: ${user.preferredWorkoutTime || 'Não informado'}
            - Preferências/Restrições Alimentares: ${user.dietaryPreferences?.join(', ') || 'Nenhuma'}
            - Alimentos que gosta/não gosta: ${user.foodPreferences || 'Não informado'}

            A receita deve ser prática para o dia a dia e alinhada com os objetivos de fitness e bem-estar da pessoa. Por exemplo, se o objetivo é aumentar energia e treina de manhã, sugira um café da manhã energético.
            Formate a resposta em markdown, incluindo:
            - **Nome da Receita:**
            - **Ingredientes:** (em uma lista)
            - **Modo de Preparo:** (em passos simples)
            - **Dica do Nutricionista:** (uma breve justificativa de por que essa receita é boa para o perfil informado)
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: {
                    thinkingBudget: 32768,
                },
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error generating personalized recipe:", error);
        return "Não foi possível gerar uma receita no momento. Tente novamente mais tarde.";
    }
}

export const generateShoppingList = async (user: User): Promise<string> => {
    if (!user.onboardingComplete) {
        return "Complete seu perfil para receber uma lista de compras personalizada."
    }

    try {
        const ai = getGenAI();
        const prompt = `
            Aja como um(a) nutricionista. Crie uma lista de compras semanal básica e saudável para uma pessoa com o seguinte perfil:
            - Objetivo de Fitness: ${user.fitnessGoal}
            - Preferências/Restrições Alimentares: ${user.dietaryPreferences?.join(', ') || 'Nenhuma'}

            Organize a lista nas seguintes categorias em markdown:
            - **🥦 Frutas e Vegetais:**
            - **🥩 Proteínas:** (incluindo opções vegetais se aplicável)
            - **🥖 Carboidratos Complexos:**
            - **🥛 Laticínios ou Alternativas:**
            - **🥑 Gorduras Saudáveis:**
            - **🥫 Despensa e Outros:**

            Forneça cerca de 3-5 itens por categoria. A lista deve ser um ponto de partida, não um plano de refeições completo.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
             config: {
                thinkingConfig: {
                    thinkingBudget: 32768,
                },
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error generating shopping list:", error);
        return "Não foi possível gerar uma lista de compras no momento. Tente novamente mais tarde.";
    }
}

export const generateRecipesFromIngredients = async (ingredients: string): Promise<Omit<Recipe, 'id' | 'isFavorite'>[]> => {
    try {
        const ai = getGenAI();
        const prompt = `Crie 2 ou 3 receitas saudáveis e simples usando estes ingredientes: ${ingredients}. Dê prioridade a receitas que usem o máximo dos ingredientes listados.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                thinkingConfig: {
                    thinkingBudget: 32768,
                },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recipes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    category: { type: Type.STRING, enum: Object.values(RecipeCategory) },
                                    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    instructions: { type: Type.STRING },
                                    calories: { type: Type.INTEGER },
                                    nutritionTips: { type: Type.STRING },
                                },
                                required: ["name", "category", "ingredients", "instructions", "calories"]
                            },
                        },
                    },
                },
            },
        });
        
        const jsonResponse = JSON.parse(response.text);
        return jsonResponse.recipes || [];

    } catch (error) {
        console.error("Error generating recipes from ingredients:", error);
        // Return an empty array or throw an error to be handled by the caller
        return [];
    }
};

export const generateWorkoutImage = async (
    workout: Omit<Workout, 'id' | 'completed' | 'imageUrl'>,
    aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
): Promise<string> => {
    try {
        const ai = getGenAI();
        let genderTerm: string;
        switch (workout.targetGender) {
            case 'Feminino': genderTerm = 'woman'; break;
            case 'Masculino': genderTerm = 'man'; break;
            default: genderTerm = 'person (gender neutral)'; break;
        }

        const prompt = `An illustrated, realistic image of a fit ${genderTerm} performing an exercise.
- Exercise Name: '${workout.name}'.
- Description: '${workout.description}'.
- Environment: ${workout.location.toLowerCase()} (gym or home).
Show correct form and posture based on the name and description. Full body should be visible. Use bright natural lighting against a clean white or light gray background.
The style should be modern for a fitness app, with realistic anatomy. Prefer a side or 3/4 view.
The person should look healthy, confident, and athletic. Ensure a consistent visual style with other generated images.`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            // Assemble the full Data URI, which is required for the browser to display the image.
            const fullBase64String = `data:image/jpeg;base64,${base64ImageBytes}`;
            return fullBase64String;
        }
        
        throw new Error("No image data returned from API.");
        
    } catch (error) {
        console.error("Error generating workout image:", error);
        // Fallback to a generic placeholder on failure, so the UI doesn't break.
        return 'https://placehold.co/600x400/F472B6/FFFFFF?text=Erro+ao+gerar+imagem';
    }
};

export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return base64Audio;
        }
        throw new Error("No audio data returned");
    } catch (error) {
        console.error("Error generating speech:", error);
        throw error;
    }
};

export const generateWorkoutDescription = async (
    user: User,
    workoutData: Partial<Workout>
): Promise<{ description: string, tips: string }> => {
    try {
        const ai = getGenAI();
        const prompt = `
            Aja como um(a) personal trainer super motivador(a) e didático(a). Crie uma descrição e dicas para o exercício, adaptado para o perfil do usuário.

            **Perfil do Usuário:**
            - Nível de Experiência: ${user.fitnessExperience}
            - Principal Objetivo de Fitness: ${user.fitnessGoal}

            **Detalhes do Exercício:**
            - Nome do Exercício: ${workoutData.name}
            - Foco Principal (Objetivo): ${workoutData.goal}
            - Tipo de Treino: ${workoutData.type}

            **Sua Tarefa (JSON output):**
            1.  **description**: Crie uma descrição ENVOLVENTE e FÁCIL de seguir. Use uma linguagem dinâmica, como se estivesse conversando com a pessoa. Adicione um emoji relevante (ex: 💪). Explique o movimento passo a passo de forma clara.
            2.  **tips**: Forneça uma dica de ouro ("✨ **Dica de Ouro:**") que seja super prática. Pode ser sobre respiração, postura para evitar erros comuns, ou como sentir o músculo certo trabalhando. Use emojis para tornar a dica mais visual e amigável.

            O tom geral deve ser encorajador e acessível, fazendo a pessoa se sentir confiante para realizar o exercício.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                 thinkingConfig: {
                    thinkingBudget: 32768,
                },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: {
                            type: Type.STRING,
                            description: "A descrição detalhada de como executar o exercício corretamente."
                        },
                        tips: {
                            type: Type.STRING,
                            description: "Dicas úteis sobre respiração, erros comuns ou progressão."
                        }
                    },
                    required: ["description", "tips"]
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        return jsonResponse;

    } catch (error) {
        console.error("Error generating workout description:", error);
        return {
            description: "Não foi possível gerar a descrição. Por favor, preencha manualmente.",
            tips: "Tente novamente mais tarde."
        };
    }
};

export const generateSimilarWorkoutSuggestions = async (
    currentWorkout: Workout,
    allWorkouts: Workout[]
): Promise<number[]> => {
    // We don't want to suggest the current workout
    const otherWorkouts = allWorkouts.filter(w => w.id !== currentWorkout.id);

    // If there are no other workouts, we can't make suggestions.
    if (otherWorkouts.length === 0) {
        return [];
    }

    try {
        const ai = getGenAI();

        const simplifiedWorkouts = otherWorkouts.map(w => ({
            id: w.id,
            name: w.name,
            goal: w.goal,
            equipment: w.equipment.join(', ') || 'Nenhum',
            type: w.type,
        }));

        const prompt = `
            Aja como um personal trainer especialista.
            O usuário está visualizando o seguinte exercício:
            - Nome: ${currentWorkout.name}
            - Objetivo Principal: ${currentWorkout.goal}
            - Equipamentos: ${currentWorkout.equipment.join(', ') || 'Nenhum'}
            - Tipo: ${currentWorkout.type}

            Abaixo está uma lista de outros exercícios disponíveis.
            Lista de Exercícios:
            ${JSON.stringify(simplifiedWorkouts, null, 2)}

            Sua tarefa é analisar a lista e selecionar 2 ou 3 exercícios que sejam mais similares ao exercício atual, com base principalmente no **Objetivo Principal** e nos **Equipamentos** necessários. Dê preferência a exercícios que compartilhem o mesmo objetivo.

            Retorne apenas os IDs dos exercícios sugeridos.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                thinkingConfig: {
                    thinkingBudget: 32768,
                },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggested_ids: {
                            type: Type.ARRAY,
                            description: "Uma lista de IDs numéricos dos exercícios sugeridos.",
                            items: {
                                type: Type.NUMBER,
                            }
                        }
                    },
                    required: ["suggested_ids"]
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        return jsonResponse.suggested_ids || [];

    } catch (error) {
        console.error("Error generating workout suggestions:", error);
        return [];
    }
};

export const generateMusclesWorked = async (workout: Workout): Promise<string[]> => {
    try {
        const ai = getGenAI();
        const prompt = `
            Aja como um especialista em fisiologia do exercício.
            Com base no nome do exercício "${workout.name}" e seu objetivo principal "${workout.goal}", liste os principais músculos primários e secundários trabalhados.
            Retorne uma lista concisa de até 5 músculos.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        muscles: {
                            type: Type.ARRAY,
                            description: "Uma lista de strings com os nomes dos músculos trabalhados.",
                            items: {
                                type: Type.STRING,
                            }
                        }
                    },
                    required: ["muscles"]
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        return jsonResponse.muscles || [];

    } catch (error) {
        console.error("Error generating muscles worked:", error);
        return ["Não foi possível determinar os músculos."];
    }
};

export const generateSymptomReport = async (
    phase: CyclePhase,
    currentDayInCycle: number,
    symptoms: string[]
): Promise<string> => {
    if (symptoms.length === 0) {
        return "Selecione um ou mais sintomas para gerar um relatório.";
    }

    try {
        const ai = getGenAI();
        const prompt = `
            Aja como uma especialista em saúde feminina, com um tom super acolhedor, empático e prático.
            Uma usuária está na fase **${phase}** do ciclo menstrual (dia **${currentDayInCycle}**).
            Hoje, ela relatou os seguintes sintomas: **${symptoms.join(', ')}**.

            Sua tarefa é gerar um relatório em markdown.
            
            **REGRAS ESTRITAS DE FORMATAÇÃO:**
            1.  **NÃO inclua** qualquer preâmbulo ou frase introdutória.
            2.  Comece **DIRETAMENTE** com uma validação gentil do que ela sente.
            3.  Use o formato markdown. Para os títulos das seções, use "### [Emoji] [Título]". Exemplo: "### 🔬 O que está acontecendo?". **NÃO** use negrito (**) nos títulos.
            4.  As seções devem ser: Validação, O que está acontecendo?, Dicas Práticas e Lembrete Amigo.
            5.  Use emojis para deixar a leitura mais leve e visual.
            6.  O relatório deve ser como uma conversa com uma amiga que entende do assunto.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating symptom report:", error);
        return "Não foi possível gerar o relatório no momento. Tente novamente mais tarde.";
    }
};

export const initializeChat = async (): Promise<Chat> => {
    const ai = getGenAI();
    const chat = ai.chats.create({
        model: 'gemini-2.5-pro',
        config: {
            systemInstruction: "Você é 'Bem', um assistente de saúde e bem-estar amigável e motivacional. Suas respostas devem ser úteis, baseadas em informações gerais de saúde (não conselhos médicos), e sempre com um tom positivo e encorajador. Você faz parte do aplicativo 'Meu Bem-Estar: Saúde & Equilíbrio'. Use markdown para formatar suas respostas, como negrito e listas.",
        },
    });
    return chat;
};
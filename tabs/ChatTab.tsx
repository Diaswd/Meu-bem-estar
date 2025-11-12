import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { initializeChat } from '../services/geminiService';
import { SendIcon, UserIcon, SparklesIcon } from '../components/icons/Icons';
import { useUser } from '../context/UserContext';
import MarkdownRenderer from '../components/MarkdownRenderer';

type Message = {
    role: 'user' | 'model';
    text: string;
};

const ChatTab: React.FC = () => {
    const { user } = useUser();
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        const init = async () => {
            const chatSession = await initializeChat();
            setChat(chatSession);
            setMessages([{ role: 'model', text: `Olá, ${user?.name}! Eu sou o Bem, seu assistente de saúde. Como posso te ajudar hoje a cuidar do seu bem-estar?` }]);
        };
        init();
    }, [user?.name]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chat || isLoading) return;

        const userMessage: Message = { role: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: currentInput });
            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = { role: 'model', text: 'Desculpe, ocorreu um erro ao me comunicar. Por favor, tente novamente.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
        const isUser = message.role === 'user';
        return (
            <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-secondary-light dark:bg-violet-500/30 flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-brand-primary-dark dark:text-brand-primary" />
                    </div>
                )}
                <MarkdownRenderer
                    content={message.text}
                    className={`max-w-xs md:max-w-md p-4 rounded-3xl ${isUser 
                        ? 'bg-brand-primary-dark text-white rounded-br-lg' 
                        : 'bg-white dark:bg-gray-800 text-brand-dark-text dark:text-gray-200 rounded-bl-lg shadow-sm'}`}
                />
                 {isUser && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-brand-light-text dark:text-gray-400" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 p-4 shadow-sm border-b dark:border-gray-700 z-10">
                <h1 className="text-xl font-bold text-center text-brand-dark-text dark:text-gray-100">Assistente IA</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} />
                ))}
                {isLoading && (
                     <div className="flex items-start gap-3 my-4 justify-start">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-secondary-light dark:bg-violet-500/30 flex items-center justify-center">
                            <SparklesIcon className="w-6 h-6 text-brand-primary-dark dark:text-brand-primary" />
                        </div>
                        <div className="max-w-xs md:max-w-md p-4 rounded-3xl bg-white dark:bg-gray-800 rounded-bl-lg shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="bg-white dark:bg-gray-800 p-4 border-t dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Pergunte algo ao Bem..."
                        className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-dark-text dark:text-white dark:placeholder-gray-400"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !userInput.trim()}
                        className="p-3 bg-brand-primary-dark text-white rounded-full transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 hover:bg-opacity-90"
                        aria-label="Enviar mensagem"
                    >
                        <SendIcon className="w-6 h-6"/>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatTab;

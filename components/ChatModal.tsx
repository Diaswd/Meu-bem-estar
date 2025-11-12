import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { initializeChat } from '../services/geminiService';
import { SendIcon, UserIcon, SparklesIcon, XIcon } from './icons/Icons';
import { useUser } from '../context/UserContext';
import MarkdownRenderer from './MarkdownRenderer';

type Message = {
    role: 'user' | 'model';
    text: string;
};

interface ChatModalProps {
    onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ onClose }) => {
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
                    className={`max-w-xs md:max-w-md p-4 rounded-3xl shadow-sm ${isUser 
                        ? 'bg-brand-primary-dark text-white rounded-br-lg' 
                        : 'bg-ui-card text-ui-text-primary rounded-bl-lg'}`}
                />
                 {isUser && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-slate-500 dark:text-gray-400" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-slate-200/20 dark:bg-black/20 backdrop-blur-md animate-fade-in h-screen">
            <header className="flex items-center justify-between bg-ui-card/80 backdrop-blur-xl p-4 shadow-sm border-b border-ui-card-border z-10 flex-shrink-0">
                <div className="w-8"></div> {/* Spacer */}
                <h1 className="text-xl font-bold text-center text-ui-text-primary">Assistente IA</h1>
                <button onClick={onClose} className="text-ui-text-secondary hover:text-ui-text-primary" aria-label="Fechar chat">
                    <XIcon className="w-6 h-6" />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} />
                ))}
                {isLoading && (
                     <div className="flex items-start gap-3 my-4 justify-start">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-secondary-light dark:bg-violet-500/30 flex items-center justify-center">
                            <SparklesIcon className="w-6 h-6 text-brand-primary" />
                        </div>
                        <div className="max-w-xs md:max-w-md p-4 rounded-3xl bg-ui-card rounded-bl-lg shadow-sm">
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

            <footer className="bg-ui-card/80 backdrop-blur-xl p-4 border-t border-ui-card-border flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Pergunte algo ao Bem..."
                        className="w-full p-3 bg-ui-input-bg border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-brand-secondary text-ui-text-primary placeholder-ui-text-secondary"
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

export default ChatModal;
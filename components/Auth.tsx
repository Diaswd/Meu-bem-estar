import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState<'Masculino' | 'Feminino'>('Feminino');
    const [error, setError] = useState('');

    const { login, register } = useUser();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (isLogin) {
            if (!login(email, password)) {
                setError('Credenciais inválidas. Tente se cadastrar.');
            }
        } else {
            if (!register({ name, email, password, gender })) {
                setError('Este e-mail já está em uso.');
            }
        }
    };
    
    const inputClasses = "w-full p-3 bg-ui-input-bg border border-ui-input-border rounded-lg text-ui-text-primary placeholder-ui-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary";

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-ui-card backdrop-blur-xl border border-ui-card-border p-8 rounded-3xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-brand-primary mb-2">{isLogin ? 'Login' : 'Cadastro'}</h1>
                <p className="text-center text-ui-text-secondary mb-6">Bem-vindo(a) ao Meu Bem-Estar!</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={inputClasses}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={inputClasses}
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={inputClasses}
                    />
                    {!isLogin && (
                        <div>
                             <label className="block text-sm font-medium text-ui-text-secondary mb-2">Gênero:</label>
                             <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value as 'Masculino' | 'Feminino')}
                                className={inputClasses}
                             >
                                <option value="Feminino">Feminino</option>
                                <option value="Masculino">Masculino</option>
                             </select>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full bg-brand-primary-dark text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition">
                        {isLogin ? 'Entrar' : 'Criar Conta'}
                    </button>
                </form>
                <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="w-full mt-4 text-sm text-center text-brand-primary hover:underline">
                    {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
                </button>
            </div>
        </div>
    );
};

export default Auth;
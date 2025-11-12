import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, ActivityLevel, FitnessExperience, FitnessGoal, DietaryPreference, WellnessGoal, PreferredWorkoutTime } from '../types';

// Mock user database - in a real app, this would be an API
const users: User[] = [];

// Mock user for development to bypass login
const mockUserForDev: User = {
    id: 1,
    name: 'Ana',
    email: 'dev@user.com',
    gender: 'Feminino',
    onboardingComplete: true,
    age: 28,
    weight: 60,
    height: 165,
    activityLevel: ActivityLevel.Leve,
    sleepTime: '22:30',
    wakeTime: '06:30',
    fitnessExperience: FitnessExperience.Iniciante,
    fitnessGoal: FitnessGoal.PerderPeso,
    dietaryPreferences: [],
    foodPreferences: 'Gosta de saladas e frango grelhado.',
    workoutLocation: 'Casa',
    wellnessGoals: [WellnessGoal.DormirMelhor, WellnessGoal.ReduzirEstresse],
    preferredWorkoutTime: PreferredWorkoutTime.Manha,
};


interface UserContextType {
    user: User | null;
    login: (email: string, pass: string) => boolean;
    logout: () => void;
    register: (userData: Omit<User, 'id' | 'onboardingComplete'>) => boolean;
    updateUser: (userData: Partial<Omit<User, 'id'>>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(mockUserForDev);

    useEffect(() => {
        if (user) {
            localStorage.setItem('app-user', JSON.stringify(user));
        } else {
            localStorage.removeItem('app-user');
        }
    }, [user]);

    const login = (email: string, pass: string): boolean => {
        // In a real app, you'd check the password hash from an API
        const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (foundUser) {
            setUser(foundUser);
            return true;
        }
        return false;
    };

    const logout = () => {
        // Logout is disabled for development to hide login screen
        // setUser(null);
        console.log("Logout desativado para desenvolvimento.");
    };

    const register = (userData: Omit<User, 'id' | 'onboardingComplete'>): boolean => {
        if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return false; // User already exists
        }
        const newUser: User = { 
            id: Date.now(), 
            ...userData,
            onboardingComplete: false // New users must complete onboarding
        };
        users.push(newUser); // In real app, this would be an API call
        setUser(newUser);
        return true;
    };

    const updateUser = (userData: Partial<Omit<User, 'id'>>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            // In a real app, you'd also update the user in the database
            const userIndex = users.findIndex(u => u.id === user.id);
            if(userIndex > -1) {
                users[userIndex] = updatedUser;
            }
        }
    };

    return (
        <UserContext.Provider value={{ user, login, logout, register, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
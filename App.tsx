import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import HomeTab from './tabs/HomeTab';
import WorkoutsTab from './tabs/WorkoutsTab';
import NutritionTab from './tabs/NutritionTab';
import WellnessTab from './tabs/WellnessTab';
import CycleTab from './tabs/CycleTab';
import TipsTab from './tabs/TipsTab';
import ChallengesTab from './tabs/ChallengesTab';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
// FIX: Import NavItem to be used for type annotation.
import { Tab, NavItem } from './types';
import { useUser } from './context/UserContext';
import { useTheme } from './context/ThemeContext';
import { HomeIcon, DumbbellIcon, AppleIcon, MoonIcon, DropletIcon, TrophyIcon } from './components/icons/Icons';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { user } = useUser();
  const { setTheme, setColorTheme } = useTheme();

  useEffect(() => {
    const body = document.body;
    if (user?.gender === 'Feminino') {
        body.setAttribute('data-gender-theme', 'female');
        body.classList.remove('texture-dots');
    } else {
        body.removeAttribute('data-gender-theme');
        body.classList.add('texture-dots');
    }
  }, [user?.gender]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab setActiveTab={setActiveTab} />;
      case 'workouts':
        return <WorkoutsTab />;
      case 'nutrition':
        return <NutritionTab />;
      case 'wellness':
        return <WellnessTab />;
      case 'cycle':
        return user?.gender === 'Feminino' ? <CycleTab /> : <HomeTab setActiveTab={setActiveTab} />;
      case 'challenges':
        return <ChallengesTab />;
      case 'tips':
        return <TipsTab />;
      default:
        return <HomeTab setActiveTab={setActiveTab} />;
    }
  };

  const isFemale = user?.gender === 'Feminino';

  const navItems: NavItem[] = isFemale
    ? [
        { id: 'workouts', label: 'Treinos', icon: <DumbbellIcon /> },
        { id: 'cycle', label: 'Ciclo', icon: <DropletIcon /> },
        { id: 'home', label: 'Início', icon: <HomeIcon /> },
        { id: 'wellness', label: 'Bem-Estar', icon: <MoonIcon /> },
        { id: 'nutrition', label: 'Alimentação', icon: <AppleIcon /> },
      ]
    : [
        { id: 'workouts', label: 'Treinos', icon: <DumbbellIcon /> },
        { id: 'challenges', label: 'Desafios', icon: <TrophyIcon /> },
        { id: 'home', label: 'Início', icon: <HomeIcon /> },
        { id: 'wellness', label: 'Bem-Estar', icon: <MoonIcon /> },
        { id: 'nutrition', label: 'Alimentação', icon: <AppleIcon /> },
      ];


  return (
    <div className="min-h-screen font-sans text-ui-text-primary">
      <main className="pb-28">
        {renderContent()}
      </main>
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        items={navItems}
      />
    </div>
  );
};

const App: React.FC = () => {
    const { user } = useUser();

    if (!user) {
        return <Auth />;
    }

    if (!user.onboardingComplete) {
        return <Onboarding />;
    }

    return <MainApp />;
};

export default App;
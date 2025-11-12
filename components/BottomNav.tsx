import React from 'react';
import { Tab, NavItem } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  items: NavItem[];
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, items }) => {
  return (
    <nav 
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      style={{ paddingBottom: `env(safe-area-inset-bottom, 0)` }}
    >
      {/* Container now uses a dynamic gradient background from CSS variables */}
      <div 
        className="flex items-center justify-around w-[95vw] max-w-md h-20 backdrop-blur-xl border border-ui-card-border rounded-full shadow-2xl px-2"
        style={{ background: 'var(--color-nav-gradient)' }}
      >
        {items.map((item, index) => {
          const isActive = activeTab === item.id;
          const isCentral = index === Math.floor(items.length / 2);

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex flex-col items-center justify-center gap-1 w-20 h-full
                transition-transform duration-300 ease-out
                ${isActive ? '-translate-y-3 scale-110' : 'translate-y-0'}
              `}
              aria-label={item.label}
              aria-pressed={isActive}
            >
              {/* Icon Container handles visual differences but not static positioning */}
              <div className={`
                flex items-center justify-center rounded-full transition-all duration-300
                ${isCentral ? 'w-16 h-16 bg-brand-primary text-white shadow-lg' : 'w-12 h-12'}
                ${!isCentral && isActive ? 'bg-brand-primary text-white' : ''}
                ${!isCentral && !isActive ? 'text-ui-text-secondary' : ''}
              `}>
                <div className={isCentral ? 'w-7 h-7' : 'w-6 h-6'}>
                  {item.icon}
                </div>
              </div>

              {/* Label */}
              <span className={`
                text-xs font-medium tracking-tight transition-all duration-300
                ${isActive ? 'opacity-100' : 'opacity-70'}
                ${isActive && !isCentral ? 'text-ui-text-primary font-semibold' : ''}
                ${!isActive ? 'text-ui-text-secondary' : ''}
                ${isCentral ? 'text-ui-text-primary' : ''}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
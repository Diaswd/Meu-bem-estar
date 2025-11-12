import React from 'react';

export const AppLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Meu Bem-Estar Logo"
    >
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(var(--color-secondary))' }} />
                <stop offset="100%" style={{ stopColor: 'rgb(var(--color-primary))' }} />
            </linearGradient>
        </defs>
        <path
            fill="url(#logoGradient)"
            d="M50 2 L42 22 C35 30 32 45 40 58 L50 98 L60 58 C68 45 65 30 58 22 L50 2 Z"
        />
    </svg>
);

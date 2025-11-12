import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SleepLog } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SleepChartProps {
    data: SleepLog[];
}

const SleepChart: React.FC<SleepChartProps> = ({ data }) => {
    const { theme, colorTheme } = useTheme();
    
    const isDarkMode = useMemo(() => {
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return theme === 'dark';
    }, [theme]);
    
    const themeColors = useMemo(() => ({
        emerald: { secondary: '#A78BFA', accent: '#F472B6' },
        lavender: { secondary: '#34D399', accent: '#FB923C' },
        orange: { secondary: '#60A5FA', accent: '#EC4899' },
        blue: { secondary: '#F472B6', accent: '#FACC15' },
        pink: { secondary: '#FB7185', accent: '#38BDF8' },
        sky: { secondary: '#22D3EE', accent: '#FBBF24' },
        rose: { secondary: '#FB923C', accent: '#A855F7' },
        teal: { secondary: '#0EA5E9', accent: '#EAB308' },
        indigo: { secondary: '#22D3EE', accent: '#D946EF' },
        lime: { secondary: '#22C55E', accent: '#F59E0B' },
    }), []);

    const currentColors = themeColors[colorTheme];

    const formattedData = data.map(log => ({
        ...log,
        date: new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    }));

    const textColor = isDarkMode ? '#a1a1aa' : '#52525b'; // zinc-400 : zinc-600
    const gridColor = isDarkMode ? '#3f3f46' : '#d4d4d8'; // zinc-700 : zinc-300
    const tooltipBg = isDarkMode ? 'rgb(39 39 42 / 0.8)' : 'rgb(255 255 255 / 0.8)'; // zinc-800 : white
    const tooltipBorder = isDarkMode ? '#52525b' : '#e4e4e7'; // zinc-600 : zinc-200

    return (
        <div className="w-full h-64 mt-4">
            <ResponsiveContainer>
                <LineChart
                    data={formattedData}
                    margin={{
                        top: 5,
                        right: 20,
                        left: -10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 12 }} />
                    <YAxis yAxisId="left" label={{ value: 'Horas', angle: -90, position: 'insideLeft', fill: textColor }} tick={{ fill: textColor, fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" domain={[1, 5]} label={{ value: 'Energia', angle: 90, position: 'insideRight', fill: textColor }} tick={{ fill: textColor, fontSize: 12 }} />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: tooltipBg, 
                            backdropFilter: 'blur(4px)',
                            border: `1px solid ${tooltipBorder}`, 
                            borderRadius: '8px' 
                        }}
                        labelStyle={{ color: textColor }}
                        itemStyle={{ fontWeight: 'bold' }}
                        labelFormatter={(label: string) => `Data: ${label}`}
                        formatter={(value: number, name: string) => {
                            if (name === 'Horas de Sono') {
                                return [`${value.toFixed(1)} horas`, name];
                            }
                            if (name === 'Nível de Energia') {
                                return [`${value} de 5`, name];
                            }
                            return [value, name];
                        }}
                    />
                    <Legend wrapperStyle={{color: textColor}}/>
                    <Line yAxisId="left" type="monotone" dataKey="hoursSlept" name="Horas de Sono" stroke={currentColors.secondary} strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="energyLevel" name="Nível de Energia" stroke={currentColors.accent} strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SleepChart;
import { WearableData } from '../types';

// This is a mock service. In a real application, this would
// connect to Apple HealthKit or Google Health Connect.
export const getTodaysActivity = async (): Promise<WearableData> => {
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Return mock data
    return {
        steps: 7534,
        goalSteps: 10000,
        activeCalories: 312,
        goalCalories: 400,
        distance: 5.6, // in km
        heartRate: {
            current: 72,
            resting: 58,
        },
    };
};

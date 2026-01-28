export const PHQ9_SEVERITY_RANGES = {
    'Any': { min: 0, max: 27 },
    'Normal': { min: 0, max: 4 },
    'Mild': { min: 5, max: 9 },
    'Moderate': { min: 10, max: 14 },
    'Severe': { min: 15, max: 27 }
};

export const GAD7_SEVERITY_RANGES = {
    'Any': { min: 0, max: 21 },
    'Normal': { min: 0, max: 4 },
    'Mild': { min: 5, max: 9 },
    'Moderate': { min: 10, max: 14 },
    'Severe': { min: 15, max: 21 }
};

export const EVENT_TYPE_WEIGHTS = {
    'Social': { interest: 0.8, transition: 0.1, clinical: 0.1, weight: 'interest' },
    'Creative': { interest: 0.8, transition: 0.1, clinical: 0.1, weight: 'interest' },
    'Wellness': { interest: 0.7, transition: 0.1, clinical: 0.2, weight: 'interest' },
    'Volunteering': { interest: 0.9, transition: 0.1, clinical: 0.0, weight: 'interest' },
    'Therapeutic': { interest: 0.1, transition: 0.5, clinical: 0.4, weight: 'theraputic' },
    'Peer-Led': { interest: 0.1, transition: 0.6, clinical: 0.3, weight: 'theraputic' },
    'Educational': { interest: 0.2, transition: 0.3, clinical: 0.5, weight: 'theraputic' },
    'Default': { interest: 0.4, transition: 0.3, clinical: 0.3, weight: 'default' },
};
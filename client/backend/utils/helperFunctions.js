export const getPHQ9Category = (score) => {
    if (score >= 20) return 'Severe';
    if (score >= 15) return 'Moderately severe';
    if (score >= 10) return 'Moderate';
    if (score >= 5)  return 'Mild';
    return 'None-Minimal';
};

export const getGAD7Category = (score) => {
    if (score >= 15) return 'Severe';
    if (score >= 10) return 'Moderate';
    if (score >= 5)  return 'Mild';
    return 'None-Minimal';
};

export function normalizeScore(score, max_score) {
    return max_score > 0 ? Math.round((score / max_score) * 100) / 100 : 0;
}

export function jaccardSimilarity(arr1, arr2) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
}

export function isWithinRange(lat1, lon1, lat2, lon2, cutoffDistance) {
    const toRad = (deg) => deg * (Math.PI / 180);
    const R = 6371; // Earth's radius in kilometers

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const kms = R * c;
    if (kms > cutoffDistance) { return false }
    return true
}


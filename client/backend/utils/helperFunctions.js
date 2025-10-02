export function getPHQ9Category(score) {
    if (score >= 0 && score <= 4) return 'None-Minimal';
    if (score <= 9) return "Mild"
    if (score <= 14) return 'Moderate'
    if (score <= 19) return 'Moderately severe'
    return 'Severe'
}

export function getGAD7Category(score) {
    if (score >= 0 && score <= 4) return 'None-Minimal';
    if (score <= 9) return "Mild"
    if (score <= 14) return 'Moderate'
    return 'Severe'
}

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


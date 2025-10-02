// Date helpers
export const getMonth = (date) => {
    return date.toLocaleString('en-US', { month: 'short' })
}

export const getDay = (date) => {
    return date.getDate();
}

export const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', { dateStyle: 'medium' });
}

export const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export const getInitials = (name = '') => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};
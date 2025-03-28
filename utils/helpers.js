export const helpers = {
    formatNumber: (num) => {
        if (num >= 100000) return Math.floor(num/1000) + 'k';
        if (num >= 10000) return Math.floor(num/1000) + 'k';
        if (num >= 1000) return Math.floor(num/1000) + 'k';
        return num;
    },
    
    readFile: (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    },
    
    showToast: (message, duration = 2000) => {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        document.body.appendChild(toast);
    
        setTimeout(() => {
            toast.remove();
        }, duration);
    },
    
    debounce: (func, delay = 300) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(null, args);
            }, delay);
        };
    }
};
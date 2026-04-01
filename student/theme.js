/**
 * Kirinyaga Hostels - Theme Manager
 * Handles dark/light mode across all pages with persistence and cross-tab sync
 * Version: 1.0.0
 */

(function() {
    'use strict';

    // ==================== CONFIGURATION ====================
    const THEME_KEY = 'kyu_theme';
    const THEME_DARK = 'dark';
    const THEME_LIGHT = 'light';
    const STORAGE_EVENT = 'storage';

    // ==================== DOM ELEMENTS ====================
    let themeToggleButtons = [];

    // ==================== CORE FUNCTIONS ====================
    
    /**
     * Get current theme from localStorage
     * @returns {string} 'dark' or 'light'
     */
    function getCurrentTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme === THEME_DARK || savedTheme === THEME_LIGHT) {
            return savedTheme;
        }
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return THEME_DARK;
        }
        return THEME_LIGHT;
    }

    /**
     * Apply theme to document body
     * @param {string} theme - 'dark' or 'light'
     */
    function applyTheme(theme) {
        const isDark = theme === THEME_DARK;
        
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Update all toggle buttons
        updateAllToggleButtons(isDark);
        
        // Dispatch custom event for pages to react
        const event = new CustomEvent('themeChanged', { detail: { theme: theme, isDark: isDark } });
        document.dispatchEvent(event);
    }

    /**
     * Update all theme toggle buttons on the page
     * @param {boolean} isDark - Whether dark mode is active
     */
    function updateAllToggleButtons(isDark) {
        themeToggleButtons = document.querySelectorAll('[data-theme-toggle], .dark-mode-toggle, #darkModeToggle');
        
        themeToggleButtons.forEach(button => {
            if (isDark) {
                button.innerHTML = '<i class="fas fa-sun"></i>';
                button.title = 'Switch to Light Mode';
            } else {
                button.innerHTML = '<i class="fas fa-moon"></i>';
                button.title = 'Switch to Dark Mode';
            }
        });
    }

    /**
     * Set theme and save to localStorage
     * @param {string} theme - 'dark' or 'light'
     */
    function setTheme(theme) {
        if (theme !== THEME_DARK && theme !== THEME_LIGHT) {
            console.warn('Invalid theme:', theme);
            return;
        }
        
        localStorage.setItem(THEME_KEY, theme);
        applyTheme(theme);
    }

    /**
     * Toggle between dark and light mode
     */
    function toggleTheme() {
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
        setTheme(newTheme);
    }

    // ==================== BUTTON MANAGEMENT ====================
    
    /**
     * Initialize theme toggle buttons
     */
    function initThemeButtons() {
        themeToggleButtons = document.querySelectorAll('[data-theme-toggle], .dark-mode-toggle, #darkModeToggle');
        
        themeToggleButtons.forEach(button => {
            // Remove existing listeners to prevent duplicates
            button.removeEventListener('click', toggleTheme);
            button.addEventListener('click', toggleTheme);
        });
    }

    /**
     * Watch for dynamically added theme buttons (for single-page apps)
     */
    function watchForNewButtons() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.matches && (node.matches('[data-theme-toggle]') || 
                            node.matches('.dark-mode-toggle') || 
                            node.matches('#darkModeToggle'))) {
                            node.removeEventListener('click', toggleTheme);
                            node.addEventListener('click', toggleTheme);
                            themeToggleButtons.push(node);
                            const isDark = getCurrentTheme() === THEME_DARK;
                            if (isDark) {
                                node.innerHTML = '<i class="fas fa-sun"></i>';
                            } else {
                                node.innerHTML = '<i class="fas fa-moon"></i>';
                            }
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // ==================== CROSS-TAB SYNC ====================
    
    /**
     * Handle storage events from other tabs
     * @param {StorageEvent} e - Storage event
     */
    function handleStorageChange(e) {
        if (e.key === THEME_KEY && e.newValue !== e.oldValue) {
            const newTheme = e.newValue || THEME_LIGHT;
            applyTheme(newTheme);
        }
    }

    // ==================== SYSTEM PREFERENCE ====================
    
    /**
     * Watch for system preference changes
     */
    function watchSystemPreference() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Only apply if user hasn't manually set a preference
                if (!localStorage.getItem(THEME_KEY)) {
                    const newTheme = e.matches ? THEME_DARK : THEME_LIGHT;
                    applyTheme(newTheme);
                }
            });
        }
    }

    // ==================== HELPER FUNCTIONS ====================
    
    /**
     * Get current theme state (useful for other scripts)
     * @returns {boolean} True if dark mode is active
     */
    function isDarkMode() {
        return document.body.classList.contains('dark-mode');
    }

    /**
     * Add theme class to an element (useful for dynamic content)
     * @param {HTMLElement} element - Element to add theme class to
     */
    function applyThemeToElement(element) {
        if (isDarkMode()) {
            element.classList.add('dark-mode');
        } else {
            element.classList.remove('dark-mode');
        }
    }

    // ==================== INITIALIZATION ====================
    
    /**
     * Initialize theme manager
     */
    function init() {
        // Get saved theme or system preference
        const savedTheme = localStorage.getItem(THEME_KEY);
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let initialTheme = savedTheme;
        if (!initialTheme) {
            initialTheme = systemPrefersDark ? THEME_DARK : THEME_LIGHT;
        }
        
        // Apply theme
        applyTheme(initialTheme);
        
        // Initialize buttons
        initThemeButtons();
        
        // Watch for new buttons
        watchForNewButtons();
        
        // Cross-tab sync
        window.addEventListener(STORAGE_EVENT, handleStorageChange);
        
        // Watch system preference
        watchSystemPreference();
        
        console.log('Theme manager initialized. Current theme:', getCurrentTheme());
    }

    // ==================== EXPORT PUBLIC API ====================
    
    // Make functions available globally
    window.KyuTheme = {
        init: init,
        setTheme: setTheme,
        toggleTheme: toggleTheme,
        getCurrentTheme: getCurrentTheme,
        isDarkMode: isDarkMode,
        applyThemeToElement: applyThemeToElement,
        THEME_DARK: THEME_DARK,
        THEME_LIGHT: THEME_LIGHT
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
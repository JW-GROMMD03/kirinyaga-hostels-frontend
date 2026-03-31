

(function() {
    // Load saved theme
    const savedTheme = localStorage.getItem('ownerTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }

    function updateDarkModeIcon(isDark) {
        const toggleBtn = document.getElementById('darkModeToggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            toggleBtn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        }
    }

    window.toggleDarkMode = function() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('ownerTheme', isDark ? 'dark' : 'light');
        updateDarkModeIcon(isDark);
        
        // Show toast notification if function exists
        if (typeof showSuccess === 'function') {
            showSuccess(isDark ? 'Dark mode enabled' : 'Light mode enabled');
        }
    };

    // Add event listener to dark mode toggle button if it exists
    document.addEventListener('DOMContentLoaded', function() {
        const darkModeBtn = document.getElementById('darkModeToggle');
        if (darkModeBtn) {
            darkModeBtn.addEventListener('click', window.toggleDarkMode);
        }
    });
})();
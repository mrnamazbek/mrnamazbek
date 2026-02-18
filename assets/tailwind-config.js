(function () {
    window.tailwind = window.tailwind || {};
    window.tailwind.config = {
        darkMode: 'class',
        theme: {
            extend: {
                fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                    display: ['Sora', 'sans-serif'],
                },
                colors: {
                    glass: {
                        100: 'rgba(255, 255, 255, 0.1)',
                        border: 'rgba(255, 255, 255, 0.2)',
                        surface: 'rgba(0, 0, 0, 0.4)'
                    }
                },
                cursor: {
                    'none': 'none',
                }
            }
        }
    };
})();

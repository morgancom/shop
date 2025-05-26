document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.main-header');
    let lastScrollY = window.scrollY;
    let isScrolling = false;

    function updateHeader() {
        const currentScrollY = window.scrollY;

        // Add scrolled class for background effect
        if (currentScrollY > 0) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }

        lastScrollY = currentScrollY;
        isScrolling = false;
    }

    // Throttle scroll events
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                updateHeader();
                isScrolling = false;
            });
            isScrolling = true;
        }
    }, { passive: true });

    // Category Menu Toggle
    const categoryToggle = document.querySelector('.category-toggle');
    const megaMenu = document.querySelector('.mega-menu');
    let menuTimeout;

    if (categoryToggle && megaMenu) {
        categoryToggle.addEventListener('mouseenter', () => {
            clearTimeout(menuTimeout);
            megaMenu.classList.add('show');
        });

        categoryToggle.addEventListener('mouseleave', () => {
            menuTimeout = setTimeout(() => {
                megaMenu.classList.remove('show');
            }, 200);
        });

        megaMenu.addEventListener('mouseenter', () => {
            clearTimeout(menuTimeout);
        });

        megaMenu.addEventListener('mouseleave', () => {
            megaMenu.classList.remove('show');
        });

        // Handle mobile menu
        categoryToggle.addEventListener('click', (e) => {
            if (window.innerWidth < 768) {
                e.preventDefault();
                megaMenu.classList.toggle('show');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!megaMenu.contains(e.target) && !categoryToggle.contains(e.target)) {
                megaMenu.classList.remove('show');
            }
        });

        // Close menu when clicking escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                megaMenu.classList.remove('show');
            }
        });

        categoryToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            megaMenu.classList.toggle('show');
            
            // Toggle chevron icon
            const chevron = this.querySelector('.fa-chevron-down');
            if (chevron) {
                chevron.classList.toggle('rotate');
            }
        });
        
        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (!megaMenu.contains(e.target) && e.target !== categoryToggle) {
                megaMenu.classList.remove('show');
                const chevron = categoryToggle.querySelector('.fa-chevron-down');
                if (chevron) {
                    chevron.classList.remove('rotate');
                }
            }
        });

        // Close menu when pressing Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && megaMenu.classList.contains('show')) {
                megaMenu.classList.remove('show');
                const chevron = categoryToggle.querySelector('.fa-chevron-down');
                if (chevron) {
                    chevron.classList.remove('rotate');
                }
            }
        });
    }
});

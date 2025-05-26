document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.main-header');
    
    // Handle viewport height for mobile browsers
    function setVH() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // Initial set
    setVH();

    // Update on resize and orientation change
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    // Handle mobile menu
    const mobileMenu = document.querySelector('.mobile-nav');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        if (window.innerWidth <= 768) {
            if (window.scrollY > lastScrollY) {
                mobileMenu.style.transform = 'translateY(100%)';
            } else {
                mobileMenu.style.transform = 'translateY(0)';
            }
            lastScrollY = window.scrollY;
        }
    }, { passive: true });

    // Add touch support for mobile
    let touchStartY = 0;
    document.addEventListener('touchstart', e => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (window.innerWidth <= 768) {
            const touchY = e.touches[0].clientY;
            const diff = touchStartY - touchY;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    mobileMenu.style.transform = 'translateY(100%)';
                } else {
                    mobileMenu.style.transform = 'translateY(0)';
                }
            }
        }
    }, { passive: true });
});

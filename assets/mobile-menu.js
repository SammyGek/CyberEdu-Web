/* mobile-menu.js */
(function() {
    'use strict';
    
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');
    
    if (!menuBtn || !mobileMenu) {
        console.warn('[Mobile Menu] Elementos no encontrados');
        return;
    }
    
    function toggleMenu() {
        const isOpen = mobileMenu.classList.contains('open');
        
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    function openMenu() {
        mobileMenu.classList.add('open');
        hamburgerIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
        menuBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
    }
    
    function closeMenu() {
        mobileMenu.classList.remove('open');
        hamburgerIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    }
    
    // Toggle al hacer clic en botón
    menuBtn.addEventListener('click', toggleMenu);
    
    // Cerrar al hacer clic en enlace
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMenu();
        }
    });
    
    console.log('[Mobile Menu] Inicializado');
    
})();
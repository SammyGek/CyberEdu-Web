/* CyberEdu Documentation Platform - App Logic (FREEMIUM) */
/* Requiere: const lessons = [...] definido antes de cargar este script */

(function() {
    'use strict';

    // --- STATE ---
    let currentLessonIndex = 0;
    const storageKey = window.CUADERNO_ID || 'default';
    let visitedLessons = new Set(JSON.parse(localStorage.getItem(`visited_${storageKey}`) || '[]'));

    // --- DOM ELEMENTS ---
    const navList = document.getElementById('nav-list');
    const contentArea = document.getElementById('content-area');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const searchInput = document.getElementById('search-input');
    const mainScroll = document.getElementById('main-scroll');
    const backToTop = document.getElementById('back-to-top');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    // --- RENDER NAV ---
    function renderNav(items) {
        navList.innerHTML = items.map((lesson) => {
            const isVisited = visitedLessons.has(lesson.id);
            const isPremium = lesson.isPremium || false;
            
            // Badge premium si la lección es premium
            const premiumBadge = isPremium 
                ? '<span class="premium-badge" title="Contenido Premium">👑</span>' 
                : '';
            
            return `
            <button onclick="loadLesson('${lesson.id}')" 
                class="nav-item w-full text-left px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2 group"
                id="btn-${lesson.id}">
                <i class="${lesson.icon} w-4 text-center group-hover:text-sky-400 transition-colors ${isVisited ? 'text-emerald-500' : ''}"></i>
                <span class="truncate flex-1">${lesson.title}</span>
                ${premiumBadge}
                <span class="category-badge category-${lesson.category}">${lesson.category}</span>
            </button>
        `}).join('');
    }

    // --- LOAD LESSON ---
    window.loadLesson = function(id) {
        const idx = lessons.findIndex(l => l.id === id);
        if (idx === -1) return;

        currentLessonIndex = idx;
        const lesson = lessons[idx];

        // Mark as visited
        visitedLessons.add(id);
        localStorage.setItem(`visited_${storageKey}`, JSON.stringify([...visitedLessons]));
        localStorage.setItem(`last_${storageKey}`, id);
        updateProgress();

        // Fade animation
        contentArea.classList.add('opacity-0');
        
        setTimeout(() => {
            contentArea.innerHTML = lesson.content;
            contentArea.classList.remove('opacity-0');
            mainScroll.scrollTop = 0;
            
            // Re-highlight code (Prism.js)
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
            
            updateNavButtons();
        }, 150);

        // Update active nav
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.remove('active-nav', 'bg-slate-800', 'text-white');
            el.classList.add('text-slate-400');
        });
        const activeBtn = document.getElementById(`btn-${id}`);
        if (activeBtn) {
            activeBtn.classList.add('active-nav', 'bg-slate-800', 'text-white');
            activeBtn.classList.remove('text-slate-400');
        }

        // Close mobile menu
        if (window.innerWidth < 768) {
            sidebar.classList.add('-translate-x-full');
        }
        
        renderNav(lessons);
    };

    // --- NAVIGATION ---
    window.navigatePrev = function() {
        if (currentLessonIndex > 0) {
            loadLesson(lessons[currentLessonIndex - 1].id);
        }
    };

    window.navigateNext = function() {
        if (currentLessonIndex < lessons.length - 1) {
            loadLesson(lessons[currentLessonIndex + 1].id);
        }
    };

    function updateNavButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn && nextBtn) {
            prevBtn.style.visibility = currentLessonIndex === 0 ? 'hidden' : 'visible';
            nextBtn.style.visibility = currentLessonIndex === lessons.length - 1 ? 'hidden' : 'visible';
            
            if (currentLessonIndex > 0) {
                prevBtn.querySelector('span').textContent = lessons[currentLessonIndex - 1].title;
            }
            if (currentLessonIndex < lessons.length - 1) {
                nextBtn.querySelector('span').textContent = lessons[currentLessonIndex + 1].title;
            }
        }
    }

    // --- PROGRESS ---
    function updateProgress() {
        const count = visitedLessons.size;
        const total = lessons.length - 1; // Exclude cover
        if (progressText) {
            progressText.textContent = `${Math.max(0, count - 1)}/${total} completados`;
        }
    }

    window.resetProgress = function() {
        if (confirm('¿Reiniciar progreso de lectura?')) {
            visitedLessons.clear();
            localStorage.removeItem(`visited_${storageKey}`);
            localStorage.removeItem(`last_${storageKey}`);
            updateProgress();
            renderNav(lessons);
        }
    };

    // --- SCROLL HANDLING ---
    if (mainScroll) {
        mainScroll.addEventListener('scroll', () => {
            const scrollTop = mainScroll.scrollTop;
            const scrollHeight = mainScroll.scrollHeight - mainScroll.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
            
            if (backToTop) {
                if (scrollTop > 300) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            }
        });
    }

    window.scrollToTop = function() {
        if (mainScroll) {
            mainScroll.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // --- COPY CODE ---
    window.copyCode = function(btn) {
        const code = btn.parentElement.querySelector('code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            btn.innerHTML = '<i class="fas fa-check mr-1"></i>Copiado!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-copy mr-1"></i>Copiar';
                btn.classList.remove('copied');
            }, 2000);
        });
    };

    // --- SEARCH ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = lessons.filter(l => 
                l.title.toLowerCase().includes(term) || 
                l.content.toLowerCase().includes(term)
            );
            renderNav(filtered);
        });
    }

    // --- KEYBOARD NAVIGATION ---
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        
        if (e.key === 'ArrowLeft') {
            navigatePrev();
        } else if (e.key === 'ArrowRight') {
            navigateNext();
        }
    });

    // --- MOBILE MENU ---
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }

    // --- INIT ---
    function init() {
        if (typeof lessons === 'undefined' || !lessons.length) {
            console.error('CyberEdu: No lessons defined');
            return;
        }
        
        renderNav(lessons);
        updateProgress();
        
        // Load last visited or cover
        const lastLesson = localStorage.getItem(`last_${storageKey}`);
        if (lastLesson && lessons.find(l => l.id === lastLesson)) {
            loadLesson(lastLesson);
        } else {
            loadLesson('portada');
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

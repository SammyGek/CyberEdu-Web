/* Hakiu Documentation Platform - App Logic v2.0 (CSP-Compliant) */
/* Requiere: window.CUADERNO_ID y window.lessons definidos en archivo nav.js externo */

(function() {
    'use strict';

    // --- STATE ---
    let currentLessonIndex = 0;
    const storageKey = window.CUADERNO_ID || 'default';
    let visitedLessons = new Set(JSON.parse(localStorage.getItem(`visited_${storageKey}`) || '[]'));

    // --- DOM ELEMENTS ---
    const navList = document.getElementById('nav-list');
    const mainScroll = document.getElementById('main-scroll');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const searchInput = document.getElementById('search-input');
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
                ? '<iconify-icon icon="mdi:crown" class="text-amber-400 text-sm"></iconify-icon>' 
                : '';
            
            return `
            <button onclick="loadLesson('${lesson.id}')" 
                class="nav-item w-full text-left px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2 group"
                id="btn-${lesson.id}">
                <iconify-icon icon="${lesson.icon}" class="w-4 text-center group-hover:text-sky-400 transition-colors ${isVisited ? 'text-emerald-500' : ''}"></iconify-icon>
                <span class="truncate flex-1">${lesson.title}</span>
                ${premiumBadge}
                <span class="category-badge category-${lesson.category}">${lesson.category}</span>
            </button>
        `}).join('');
    }

    // --- LOAD LESSON ---
    window.loadLesson = function(id) {
        const idx = window.lessons.findIndex(l => l.id === id);
        if (idx === -1) return;

        currentLessonIndex = idx;
        const lesson = window.lessons[idx];

        // Mark as visited
        visitedLessons.add(id);
        localStorage.setItem(`visited_${storageKey}`, JSON.stringify([...visitedLessons]));
        localStorage.setItem(`last_${storageKey}`, id);
        updateProgress();

        // Fade animation
        const allSections = document.querySelectorAll('section[data-lesson]');
        allSections.forEach(s => {
            s.style.opacity = '0';
            s.style.display = 'none';
        });
        
        setTimeout(() => {
            // Buscar la sección correspondiente
            const section = document.querySelector(`section[data-lesson="${id}"]`);
            
            if (!section) {
                console.error(`Sección no encontrada: ${id}`);
                return;
            }
            
            // Verificar si es premium y está vacía
            if (lesson.isPremium && section.innerHTML.trim() === '<!-- Contenido premium - se carga desde Supabase -->') {
                // Cargar contenido premium desde Supabase
                loadPremiumContent(id, section);
            } else {
                // Mostrar contenido (ya sea free o premium ya cargado)
                showSection(section);
            }
            
            mainScroll.scrollTop = 0;
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
        
        renderNav(window.lessons);
    };

    function showSection(section) {
        section.style.display = 'block';
        section.style.opacity = '1';
        
        // Re-highlight code (Prism.js)
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
        
        // Cargar script de la lección si existe
        const lesson = window.lessons.find(l => l.id === section.dataset.lesson);
        if (lesson && lesson.scriptFile) {
            loadLessonScript(lesson.scriptFile);
        }
    }

    async function loadPremiumContent(lessonId, section) {
        try {
            // Mostrar loading
            section.innerHTML = `
                <div class="flex items-center justify-center py-12">
                    <div class="text-center">
                        <iconify-icon icon="mdi:loading" class="text-4xl text-sky-400 animate-spin"></iconify-icon>
                        <p class="text-slate-400 mt-4">Cargando contenido premium...</p>
                    </div>
                </div>
            `;
            section.style.display = 'block';
            section.style.opacity = '1';

            // Verificar autenticación
            if (typeof supabase === 'undefined') {
                throw new Error('Supabase no está configurado');
            }

            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                // Usuario no autenticado - mostrar paywall
                showPaywall(section);
                return;
            }

            // Cargar contenido de Supabase
            const { data, error } = await supabase
                .from('premium_lessons')
                .select('html_content, script_file')
                .eq('cuaderno_id', window.CUADERNO_ID)
                .eq('lesson_id', lessonId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No encontrado - mostrar paywall
                    showPaywall(section);
                } else {
                    throw error;
                }
                return;
            }

            // Insertar contenido
            section.innerHTML = data.html_content;
            
            // Prism highlighting
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
            
            // Cargar script si existe
            if (data.script_file) {
                loadLessonScript(data.script_file);
            }

        } catch (error) {
            console.error('Error cargando contenido premium:', error);
            section.innerHTML = `
                <div class="critical-box">
                    <p><iconify-icon icon="mdi:alert-circle" class="text-red-400"></iconify-icon> 
                    <strong>Error:</strong> No se pudo cargar el contenido. Por favor, recarga la página.</p>
                </div>
            `;
        }
    }

    function showPaywall(section) {
        section.innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-12">
                <iconify-icon icon="mdi:crown" class="text-6xl text-amber-400 mb-6"></iconify-icon>
                <h2 class="text-3xl font-bold mb-4">Contenido Premium</h2>
                <p class="text-slate-400 text-lg mb-8">Esta lección es parte del contenido premium. Suscríbete para acceder a todo el material.</p>
                
                <div class="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
                    <h3 class="text-xl font-semibold mb-4">¿Qué incluye Premium?</h3>
                    <ul class="text-left space-y-2 text-slate-300">
                        <li><iconify-icon icon="mdi:check-circle" class="text-emerald-400"></iconify-icon> Acceso a todas las lecciones avanzadas</li>
                        <li><iconify-icon icon="mdi:check-circle" class="text-emerald-400"></iconify-icon> Laboratorios prácticos y ejercicios</li>
                        <li><iconify-icon icon="mdi:check-circle" class="text-emerald-400"></iconify-icon> Herramientas interactivas</li>
                        <li><iconify-icon icon="mdi:check-circle" class="text-emerald-400"></iconify-icon> Actualizaciones constantes</li>
                    </ul>
                </div>
                
                <a href="/login" class="inline-block bg-sky-600 hover:bg-sky-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
                    Iniciar Sesión
                </a>
                <a href="/register" class="inline-block ml-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
                    Crear Cuenta
                </a>
            </div>
        `;
    }

    // --- NAVIGATION ---
    window.navigatePrev = function() {
        if (currentLessonIndex > 0) {
            loadLesson(window.lessons[currentLessonIndex - 1].id);
        }
    };

    window.navigateNext = function() {
        if (currentLessonIndex < window.lessons.length - 1) {
            loadLesson(window.lessons[currentLessonIndex + 1].id);
        }
    };

    function updateNavButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn && nextBtn) {
            prevBtn.style.visibility = currentLessonIndex === 0 ? 'hidden' : 'visible';
            nextBtn.style.visibility = currentLessonIndex === window.lessons.length - 1 ? 'hidden' : 'visible';
            
            if (currentLessonIndex > 0) {
                prevBtn.querySelector('span').textContent = window.lessons[currentLessonIndex - 1].title;
            }
            if (currentLessonIndex < window.lessons.length - 1) {
                nextBtn.querySelector('span').textContent = window.lessons[currentLessonIndex + 1].title;
            }
        }
    }

    // --- PROGRESS ---
    function updateProgress() {
        const count = visitedLessons.size;
        const total = window.lessons.length - 1; // Exclude cover
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
            renderNav(window.lessons);
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
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<iconify-icon icon="mdi:check" class="mr-1"></iconify-icon>Copiado!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.remove('copied');
            }, 2000);
        });
    };

    // --- SEARCH ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = window.lessons.filter(l => 
                l.title.toLowerCase().includes(term)
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

    // --- LOAD LESSON SCRIPT (for interactive lessons) ---
    function loadLessonScript(scriptPath) {
        // Remove previous lesson script if exists
        const oldScript = document.getElementById('lesson-script');
        if (oldScript) {
            oldScript.remove();
        }
        
        // Create and load new script
        const script = document.createElement('script');
        script.id = 'lesson-script';
        script.src = `./scripts/${scriptPath}`;
        script.defer = true;
        script.onerror = () => {
            console.error(`Error cargando script de lección: ${scriptPath}`);
        };
        document.body.appendChild(script);
    }

    // --- INIT ---
    function init() {
        if (typeof window.lessons === 'undefined' || !window.lessons.length) {
            console.error('CyberEdu: No lessons defined in nav.js');
            return;
        }
        
        renderNav(window.lessons);
        updateProgress();
        
        // Load last visited or cover
        const lastLesson = localStorage.getItem(`last_${storageKey}`);
        if (lastLesson && window.lessons.find(l => l.id === lastLesson)) {
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
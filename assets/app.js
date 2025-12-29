/* CyberEdu Documentation Platform - App Logic (FREEMIUM + AUTH UI) */
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

    // ============================================================
    // AUTH UI - MODALS Y PAYWALL
    // ============================================================

    // --- CREAR MODALS EN EL DOM ---
    function createModals() {
        const modalsHTML = `
            <!-- Modal de Login/Register -->
            <div id="auth-modal" class="modal-overlay hidden">
                <div class="modal-container">
                    <button onclick="closeAuthModal()" class="modal-close">&times;</button>
                    
                    <div id="login-form" class="auth-form">
                        <h2 class="text-2xl font-bold text-white mb-6 text-center">Iniciar Sesión</h2>
                        
                        <div id="login-error" class="error-message hidden"></div>
                        
                        <form onsubmit="handleLogin(event)">
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="login-email" required class="form-input" placeholder="tu@email.com">
                            </div>
                            
                            <div class="form-group">
                                <label>Contraseña</label>
                                <input type="password" id="login-password" required class="form-input" placeholder="••••••••">
                            </div>
                            
                            <button type="submit" class="btn-primary w-full">
                                <i class="fas fa-sign-in-alt mr-2"></i>Iniciar Sesión
                            </button>
                        </form>
                        
                        <p class="text-center text-sm text-slate-400 mt-4">
                            ¿No tienes cuenta? <button onclick="switchToRegister()" class="text-sky-400 hover:underline">Regístrate</button>
                        </p>
                    </div>
                    
                    <div id="register-form" class="auth-form hidden">
                        <h2 class="text-2xl font-bold text-white mb-6 text-center">Crear Cuenta</h2>
                        
                        <div id="register-error" class="error-message hidden"></div>
                        <div id="register-success" class="success-message hidden"></div>
                        
                        <form onsubmit="handleRegister(event)">
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="register-email" required class="form-input" placeholder="tu@email.com">
                            </div>
                            
                            <div class="form-group">
                                <label>Contraseña</label>
                                <input type="password" id="register-password" required class="form-input" placeholder="Mínimo 6 caracteres" minlength="6">
                            </div>
                            
                            <button type="submit" class="btn-primary w-full">
                                <i class="fas fa-user-plus mr-2"></i>Crear Cuenta
                            </button>
                        </form>
                        
                        <p class="text-center text-sm text-slate-400 mt-4">
                            ¿Ya tienes cuenta? <button onclick="switchToLogin()" class="text-sky-400 hover:underline">Inicia sesión</button>
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Paywall Premium -->
            <div id="paywall-modal" class="modal-overlay hidden">
                <div class="modal-container max-w-lg">
                    <button onclick="closePaywall()" class="modal-close">&times;</button>
                    
                    <div class="text-center">
                        <div class="text-6xl mb-4">👑</div>
                        <h2 class="text-3xl font-bold text-white mb-2">Contenido Premium</h2>
                        <p class="text-slate-400 mb-6">Desbloquea acceso completo al curso de ciberseguridad</p>
                        
                        <div class="bg-slate-800 rounded-lg p-6 mb-6">
                            <div class="flex items-baseline justify-center mb-4">
                                <span class="text-4xl font-bold text-white">€6.99</span>
                                <span class="text-slate-400 ml-2">/mes</span>
                            </div>
                            <p class="text-sm text-slate-400">o €49/año (ahorra 30%)</p>
                        </div>
                        
                        <div class="text-left space-y-3 mb-6">
                            <div class="flex items-start gap-3">
                                <i class="fas fa-check text-emerald-500 mt-1"></i>
                                <div>
                                    <p class="text-white font-semibold">Acceso completo</p>
                                    <p class="text-sm text-slate-400">8 cuadernos con +100 lecciones</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3">
                                <i class="fas fa-check text-emerald-500 mt-1"></i>
                                <div>
                                    <p class="text-white font-semibold">Actualizado mensualmente</p>
                                    <p class="text-sm text-slate-400">Contenido nuevo cada mes</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3">
                                <i class="fas fa-check text-emerald-500 mt-1"></i>
                                <div>
                                    <p class="text-white font-semibold">Soporte prioritario</p>
                                    <p class="text-sm text-slate-400">Dudas resueltas en 24h</p>
                                </div>
                            </div>
                        </div>
                        
                        <button onclick="handleUpgrade()" class="btn-premium w-full mb-3">
                            <i class="fas fa-crown mr-2"></i>Hazte Premium
                        </button>
                        
                        <button onclick="closePaywall()" class="text-sm text-slate-400 hover:text-white">
                            Continuar con plan gratuito
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Menú de Usuario -->
            <div id="user-menu" class="hidden">
                <button id="user-menu-btn" class="user-menu-btn">
                    <i class="fas fa-user-circle text-2xl"></i>
                </button>
                
                <div id="user-dropdown" class="user-dropdown hidden">
                    <div class="px-4 py-3 border-b border-slate-700">
                        <p id="user-email" class="text-sm text-white font-semibold"></p>
                        <p id="user-plan" class="text-xs text-slate-400"></p>
                    </div>
                    
                    <button onclick="handleLogout()" class="dropdown-item">
                        <i class="fas fa-sign-out-alt mr-2"></i>Cerrar Sesión
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalsHTML);
    }

    // --- FUNCIONES DE MODAL ---
    window.openAuthModal = function() {
        document.getElementById('auth-modal').classList.remove('hidden');
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
    };

    window.closeAuthModal = function() {
        document.getElementById('auth-modal').classList.add('hidden');
        clearAuthErrors();
    };

    window.switchToRegister = function() {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
        clearAuthErrors();
    };

    window.switchToLogin = function() {
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
        clearAuthErrors();
    };

    function clearAuthErrors() {
        document.getElementById('login-error').classList.add('hidden');
        document.getElementById('register-error').classList.add('hidden');
        document.getElementById('register-success').classList.add('hidden');
    }

    // --- PAYWALL ---
    window.openPaywall = function() {
        document.getElementById('paywall-modal').classList.remove('hidden');
    };

    window.closePaywall = function() {
        document.getElementById('paywall-modal').classList.add('hidden');
    };

    window.handleUpgrade = function() {
        // TODO: Integrar Stripe
        alert('🚧 Integración con Stripe próximamente.\n\nPor ahora, contacta a admin@cyberedu.com para upgrade manual.');
    };

    // --- AUTH HANDLERS ---
    window.handleLogin = async function(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        
        errorEl.classList.add('hidden');
        
        if (!window.cyberEduAuth) {
            errorEl.textContent = 'Sistema de autenticación no disponible';
            errorEl.classList.remove('hidden');
            return;
        }
        
        const result = await window.cyberEduAuth.signIn(email, password);
        
        if (result.success) {
            closeAuthModal();
            updateUserMenu();
            // Recargar lección actual por si ahora tiene acceso
            loadLesson(lessons[currentLessonIndex].id);
        } else {
            errorEl.textContent = result.error || 'Error al iniciar sesión';
            errorEl.classList.remove('hidden');
        }
    };

    window.handleRegister = async function(event) {
        event.preventDefault();
        
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const errorEl = document.getElementById('register-error');
        const successEl = document.getElementById('register-success');
        
        errorEl.classList.add('hidden');
        successEl.classList.add('hidden');
        
        if (!window.cyberEduAuth) {
            errorEl.textContent = 'Sistema de autenticación no disponible';
            errorEl.classList.remove('hidden');
            return;
        }
        
        const result = await window.cyberEduAuth.signUp(email, password);
        
        if (result.success) {
            successEl.textContent = '¡Cuenta creada! Verifica tu email para continuar.';
            successEl.classList.remove('hidden');
            
            setTimeout(() => {
                switchToLogin();
            }, 2000);
        } else {
            errorEl.textContent = result.error || 'Error al crear cuenta';
            errorEl.classList.remove('hidden');
        }
    };

    window.handleLogout = async function() {
        if (!confirm('¿Cerrar sesión?')) return;
        
        await window.cyberEduAuth.signOut();
        updateUserMenu();
    };

    // --- USER MENU ---
    function updateUserMenu() {
        const userMenuEl = document.getElementById('user-menu');
        const authBtn = document.getElementById('auth-btn');
        const mobileAuthBtn = document.getElementById('mobile-auth-btn');
        
        if (!window.cyberEduAuth || !window.cyberEduAuth.user) {
            // No logueado: Mostrar botón login, ocultar menú usuario
            if (userMenuEl) userMenuEl.classList.add('hidden');
            if (authBtn) authBtn.classList.remove('hidden');
            if (mobileAuthBtn) {
                mobileAuthBtn.onclick = openAuthModal;
                mobileAuthBtn.innerHTML = '<i class="fas fa-user-circle text-xl"></i>';
            }
            return;
        }
        
        // Logueado: Ocultar botón login, mostrar menú usuario
        if (authBtn) authBtn.classList.add('hidden');
        if (userMenuEl) userMenuEl.classList.remove('hidden');
        
        // Cambiar icono mobile a menú usuario
        if (mobileAuthBtn) {
            mobileAuthBtn.onclick = function() {
                const dropdown = document.getElementById('user-dropdown');
                if (dropdown) dropdown.classList.toggle('hidden');
            };
            const plan = window.cyberEduAuth.subscription?.plan || 'free';
            const icon = plan === 'premium' ? 'fas fa-crown' : 'fas fa-user-circle';
            mobileAuthBtn.innerHTML = `<i class="${icon} text-xl text-sky-400"></i>`;
        }
        
        document.getElementById('user-email').textContent = window.cyberEduAuth.user.email;
        
        const plan = window.cyberEduAuth.subscription?.plan || 'free';
        const planText = plan === 'premium' ? 'Premium 👑' : 'Gratuito';
        document.getElementById('user-plan').textContent = planText;
    }

    // Toggle dropdown
    document.addEventListener('click', function(e) {
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (!userMenuBtn || !userDropdown) return;
        
        if (e.target.closest('#user-menu-btn')) {
            userDropdown.classList.toggle('hidden');
        } else if (!e.target.closest('#user-dropdown')) {
            userDropdown.classList.add('hidden');
        }
    });

    // ============================================================
    // RENDER NAV (Con badges premium)
    // ============================================================
    function renderNav(items) {
        navList.innerHTML = items.map((lesson) => {
            const isVisited = visitedLessons.has(lesson.id);
            const isPremium = lesson.isPremium || false;
            
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

    // ============================================================
    // LOAD LESSON (Con lógica premium)
    // ============================================================
    window.loadLesson = async function(id) {
        const idx = lessons.findIndex(l => l.id === id);
        if (idx === -1) return;

        currentLessonIndex = idx;
        const lesson = lessons[idx];

        // Mark as visited
        visitedLessons.add(id);
        localStorage.setItem(`visited_${storageKey}`, JSON.stringify([...visitedLessons]));
        localStorage.setItem(`last_${storageKey}`, id);
        updateProgress();

        // ============================================================
        // LÓGICA PREMIUM
        // ============================================================
        
        // Si la lección es premium y el content está vacío
        if (lesson.isPremium && (!lesson.content || lesson.content.trim() === '')) {
            // Verificar si el usuario está autenticado
            if (!window.cyberEduAuth || !window.cyberEduAuth.user) {
                // No logueado → Mostrar modal de login
                contentArea.classList.add('opacity-0');
                setTimeout(() => {
                    contentArea.innerHTML = `
                        <div class="text-center py-20">
                            <div class="text-6xl mb-4">🔒</div>
                            <h2 class="text-2xl font-bold text-white mb-2">Contenido Bloqueado</h2>
                            <p class="text-slate-400 mb-6">Inicia sesión para acceder a este contenido</p>
                            <button onclick="openAuthModal()" class="btn-primary">
                                <i class="fas fa-sign-in-alt mr-2"></i>Iniciar Sesión
                            </button>
                        </div>
                    `;
                    contentArea.classList.remove('opacity-0');
                }, 150);
                
                updateActiveNav(id);
                return;
            }
            
            // Logueado pero no premium → Mostrar paywall
            if (!window.cyberEduAuth.isPremium) {
                contentArea.classList.add('opacity-0');
                setTimeout(() => {
                    contentArea.innerHTML = `
                        <div class="text-center py-20">
                            <div class="text-6xl mb-4">👑</div>
                            <h2 class="text-2xl font-bold text-white mb-2">Contenido Premium</h2>
                            <p class="text-slate-400 mb-6">Actualiza a Premium para acceder</p>
                            <button onclick="openPaywall()" class="btn-premium">
                                <i class="fas fa-crown mr-2"></i>Ver Planes
                            </button>
                        </div>
                    `;
                    contentArea.classList.remove('opacity-0');
                }, 150);
                
                updateActiveNav(id);
                return;
            }
            
            // Usuario ES premium → Cargar desde Supabase
            contentArea.classList.add('opacity-0');
            contentArea.innerHTML = `
                <div class="text-center py-20">
                    <div class="spinner mb-4"></div>
                    <p class="text-slate-400">Cargando contenido premium...</p>
                </div>
            `;
            
            try {
                const premiumLessons = await window.cyberEduAuth.fetchPremiumLessons(storageKey);
                const premiumLesson = premiumLessons.find(pl => pl.lesson_id === id);
                
                if (premiumLesson && premiumLesson.html_content) {
                    lesson.content = premiumLesson.html_content;
                    
                    setTimeout(() => {
                        contentArea.innerHTML = lesson.content;
                        contentArea.classList.remove('opacity-0');
                        mainScroll.scrollTop = 0;
                        
                        if (typeof Prism !== 'undefined') {
                            Prism.highlightAll();
                        }
                        
                        updateNavButtons();
                    }, 150);
                } else {
                    contentArea.innerHTML = `
                        <div class="text-center py-20">
                            <div class="text-6xl mb-4">⚠️</div>
                            <h2 class="text-2xl font-bold text-white mb-2">Contenido no disponible</h2>
                            <p class="text-slate-400">No se pudo cargar este contenido premium</p>
                        </div>
                    `;
                    contentArea.classList.remove('opacity-0');
                }
            } catch (error) {
                console.error('Error cargando contenido premium:', error);
                contentArea.innerHTML = `
                    <div class="text-center py-20">
                        <div class="text-6xl mb-4">❌</div>
                        <h2 class="text-2xl font-bold text-white mb-2">Error</h2>
                        <p class="text-slate-400">No se pudo cargar el contenido. Intenta de nuevo.</p>
                    </div>
                `;
                contentArea.classList.remove('opacity-0');
            }
            
            updateActiveNav(id);
            return;
        }

        // ============================================================
        // LECCIÓN FREE O YA TIENE CONTENIDO
        // ============================================================
        
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

        updateActiveNav(id);
    };

    function updateActiveNav(id) {
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
    }

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
        } else if (e.key === 'Escape') {
            closeAuthModal();
            closePaywall();
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
        
        // Crear modals en el DOM
        createModals();
        
        // Actualizar menú de usuario si hay sesión
        if (window.cyberEduAuth) {
            window.addEventListener('authStateChanged', updateUserMenu);
            updateUserMenu();
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

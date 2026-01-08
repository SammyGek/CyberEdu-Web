/* Hakiu - Authentication System (with Session Timeout & Cache Cleaner) */
/* Supabase Auth para login/register/logout */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ============================================================
// CONFIGURACIÓN
// ============================================================

const supabaseUrl = window.SUPABASE_URL;
const supabaseAnonKey = window.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Hakiu Auth: Falta configurar SUPABASE_URL y SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================================

const SECURITY_CONFIG = {
    SESSION_TIMEOUT: 30 * 60 * 1000,        // 30 minutos en milisegundos
    ACTIVITY_CHECK_INTERVAL: 60 * 1000,     // Verificar cada 1 minuto
    INACTIVITY_WARNING: 5 * 60 * 1000       // Advertir 5 min antes de expirar
};

// ============================================================
// ESTADO GLOBAL
// ============================================================

window.hakiuAuth = {
    user: null,
    session: null,
    profile: null, // Nuevo: Guardaremos el perfil completo aquí (tabla profiles)
    subscription: null,
    isPremium: false,
    isLoading: true,
    lastActivity: Date.now()
};

// ============================================================
// GESTIÓN DE ACTIVIDAD (Session Timeout)
// ============================================================

/**
 * Actualizar timestamp de última actividad
 */
function updateActivity() {
    window.hakiuAuth.lastActivity = Date.now();
    localStorage.setItem('lastActivity', Date.now().toString());
}

/**
 * Verificar si la sesión ha expirado por inactividad
 */
function checkSessionTimeout() {
    const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0');
    const now = Date.now();
    const timeSinceActivity = now - lastActivity;
    
    // Si hay sesión activa pero el usuario ha estado inactivo
    if (window.hakiuAuth.session && timeSinceActivity > SECURITY_CONFIG.SESSION_TIMEOUT) {
        console.warn('⏱️ Sesión expirada por inactividad');
        signOut();
        
        // Mostrar notificación al usuario
        alert('Tu sesión ha expirado por inactividad. Por favor, inicia sesión de nuevo.');
        return true;
    }
    
    // Advertencia antes de expirar
    const timeUntilExpire = SECURITY_CONFIG.SESSION_TIMEOUT - timeSinceActivity;
    if (timeUntilExpire < SECURITY_CONFIG.INACTIVITY_WARNING && timeUntilExpire > 0) {
        const minutesLeft = Math.floor(timeUntilExpire / 60000);
        console.warn(`⚠️ Tu sesión expirará en ${minutesLeft} minutos`);
        
        // Opcional: Mostrar banner de advertencia
        // showInactivityWarning(minutesLeft);
    }
    
    return false;
}

/**
 * Configurar listeners de actividad del usuario
 */
function setupActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
        document.addEventListener(event, updateActivity, { passive: true });
    });
    
    // Verificar timeout periódicamente
    setInterval(checkSessionTimeout, SECURITY_CONFIG.ACTIVITY_CHECK_INTERVAL);
}

// ============================================================
// HELPERS: Limpieza de Caché (Nuke Local Session)
// ============================================================

/**
 * Limpieza profunda de sesión local corrupta
 */
function nukeLocalSession() {
    console.warn("☢️ Nuke Local Session: Limpiando residuos de auth...");
    window.hakiuAuth.user = null;
    window.hakiuAuth.session = null;
    window.hakiuAuth.subscription = null;
    window.hakiuAuth.isPremium = false;
    window.hakiuAuth.profile = null;
    
    // Limpia todo lo que empiece por 'sb-' (keys de Supabase)
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key === 'lastActivity') {
            localStorage.removeItem(key);
        }
    });
}

// ============================================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================================

/**
 * Registrar nuevo usuario (V5 - Full Data)
 * Recibe email, password y un objeto profileData con todo lo necesario
 */
async function signUp(email, password, profileData) {
    try {
        // Estructuramos los datos para enviarlos a Supabase
        // Supabase guardará esto en 'raw_user_meta_data'
        // El trigger en la base de datos leerá esto y poblará la tabla 'profiles'
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    first_name: profileData.first_name,
                    last_name: profileData.last_name,
                    username: profileData.username,
                    birthdate: profileData.birthdate,
                    country: profileData.country,
                    
                    // Checks legales (planos para evitar confusion en DB)
                    agreements: {
                        terms: profileData.terms_accepted,
                        privacy: profileData.privacy_accepted,
                        marketing: profileData.marketing_accepted
                    },
                    
                    referral_source: profileData.referral_source
                }
            }
        });

        if (error) throw error;

        console.log('✅ Usuario registrado:', data.user?.email);
        updateActivity(); // Iniciar tracking de actividad
        
        return { success: true, data };
        
    } catch (error) {
        console.error('❌ Error al registrar:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Iniciar sesión
 */
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        console.log('✅ Sesión iniciada:', data.user.email);
        updateActivity(); // Iniciar tracking de actividad
        
        // Cargar datos de usuario
        await loadUserSubscription(data.user.id);
        
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error al iniciar sesión:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Cerrar sesión
 */
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;

        // Limpiar estado global
        nukeLocalSession();

        console.log('✅ Sesión cerrada');
        
        // Recargar página para resetear UI
        window.location.reload();
        
        return { success: true };
    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error.message);
        // Incluso si falla en el servidor, limpiamos localmente
        nukeLocalSession();
        window.location.reload();
        return { success: false, error: error.message };
    }
}

/**
 * Obtener sesión actual
 */
async function getSession() {
    try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        return data.session;
    } catch (error) {
        console.error('❌ Error al obtener sesión:', error.message);
        nukeLocalSession();
        return null;
    }
}

/**
 * Cargar subscription y perfil público del usuario
 */
async function loadUserSubscription(userId) {
    try {
        // 1. Cargar Suscripción
        const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!subError && subData) {
            window.hakiuAuth.subscription = subData;
            window.hakiuAuth.isPremium = subData.plan === 'premium' && subData.status === 'active';
            console.log('✅ Subscription cargada:', subData.plan);
        } else {
            // Fallback simple si no existe (el trigger debería crearlo, pero por seguridad)
            console.log('⚠️ Creando subscription FREE por defecto...');
            await createDefaultSubscription(userId);
        }

        // 2. Cargar Perfil Público (nombre, avatar, etc.) de la tabla 'profiles'
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (!profileError && profileData) {
            window.hakiuAuth.profile = profileData;
            console.log('✅ Perfil cargado:', profileData.first_name);
        } else {
            console.warn('⚠️ No se pudo cargar el perfil público', profileError);
        }

        return window.hakiuAuth.subscription;
    } catch (error) {
        console.error('❌ Error al cargar datos de usuario:', error.message);
        return { plan: 'free', status: 'active' }; 
    }
}

/**
 * Crear subscription FREE por defecto (backup del trigger)
 */
async function createDefaultSubscription(userId) {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .insert({
                user_id: userId,
                plan: 'free',
                status: 'active'
            })
            .select()
            .single();

        if (error) throw error;

        window.hakiuAuth.subscription = data;
        window.hakiuAuth.isPremium = false;

        console.log('✅ Subscription FREE creada');
        
        return data;
    } catch (error) {
        console.error('❌ Error al crear subscription:', error.message);
        return null;
    }
}

/**
 * Obtener lecciones premium desde Supabase
 */
async function fetchPremiumLessons(cuadernoId) {
    // Verificar timeout antes de hacer request
    if (checkSessionTimeout()) {
        return [];
    }
    
    // Solo si el usuario es premium
    if (!window.hakiuAuth.isPremium) {
        console.log('⚠️ Usuario no premium, no puede cargar lecciones premium');
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('premium_lessons')
            .select('*')
            .eq('cuaderno_id', cuadernoId);

        if (error) throw error;

        console.log(`✅ ${data.length} lecciones premium cargadas`);
        updateActivity(); // Usuario está activo
        
        return data;
    } catch (error) {
        console.error('❌ Error al cargar lecciones premium:', error.message);
        return [];
    }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

/**
 * Inicializar auth system al cargar la página
 */
async function initAuth() {
    console.log('🔐 Inicializando Hakiu Auth...');
    
    window.hakiuAuth.isLoading = true;

    // Obtener sesión actual
    let session = await getSession();

    if (session) {
        // Verificar si la sesión ha expirado por inactividad
        const expired = checkSessionTimeout();
        
        if (!expired) {
            window.hakiuAuth.user = session.user;
            window.hakiuAuth.session = session;

            // Cargar datos (con manejo de errores)
            try {
                await loadUserSubscription(session.user.id);
                console.log('✅ Usuario autenticado:', session.user.email);
                
                // Configurar listeners de actividad
                setupActivityListeners();
                updateActivity();
            } catch (err) {
                console.error("Error inicializando datos de usuario", err);
                // Si falla catastróficamente, limpiamos sesión por seguridad
                nukeLocalSession();
            }
        }
    } else {
        console.log('ℹ️ No hay sesión activa');
    }

    window.hakiuAuth.isLoading = false;

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: window.hakiuAuth
    }));
}

/**
 * Escuchar cambios en auth state
 */
supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Auth state changed:', event);

    if (event === 'SIGNED_IN') {
        window.hakiuAuth.user = session.user;
        window.hakiuAuth.session = session;
        await loadUserSubscription(session.user.id);
        setupActivityListeners();
        updateActivity();
    } else if (event === 'SIGNED_OUT') {
        window.hakiuAuth.user = null;
        window.hakiuAuth.session = null;
        window.hakiuAuth.profile = null;
        window.hakiuAuth.subscription = null;
        window.hakiuAuth.isPremium = false;
        window.hakiuAuth.lastActivity = 0;
        localStorage.removeItem('lastActivity');
        nukeLocalSession(); // Asegurar limpieza total
    }

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: window.hakiuAuth
    }));
});

// ============================================================
// EXPORTAR API PÚBLICA
// ============================================================

window.hakiuAuth.signUp = signUp;
window.hakiuAuth.signIn = signIn;
window.hakiuAuth.signOut = signOut;
window.hakiuAuth.getSession = getSession;
window.hakiuAuth.fetchPremiumLessons = fetchPremiumLessons;
window.hakiuAuth.loadUserSubscription = loadUserSubscription;
window.hakiuAuth.updateActivity = updateActivity;
window.hakiuAuth.checkSessionTimeout = checkSessionTimeout;

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

console.log('✅ Hakiu Auth System cargado (con session timeout)');
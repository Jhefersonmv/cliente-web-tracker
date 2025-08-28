/**
 * ========================================
 * CRONOGRAMA TAMDREA - FUNCIONALIDADES JS
 * ========================================
 */

// Estado de la aplicación
const AppState = {
    animationsEnabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isLoading: true,
    countersAnimated: false
};

// Configuración de la aplicación
const Config = {
    counterDuration: 2000,
    progressAnimationDuration: 1500,
    observerThreshold: 0.1,
    debounceDelay: 150
};

/**
 * ========================================
 * UTILIDADES GENERALES
 * ========================================
 */
const Utils = {
    // Función de debounce para optimizar rendimiento
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Easing function para animaciones suaves
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    },

    // Formatear números con separadores de miles
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Verificar si un elemento está visible en el viewport
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

/**
 * ========================================
 * ANIMACIONES DE CONTADORES
 * ========================================
 */
const CounterAnimations = {
    // Animar contador numérico
    animateCounter(element, target, duration = Config.counterDuration) {
        if (!AppState.animationsEnabled) {
            this.setFinalValue(element, target);
            return;
        }

        const start = 0;
        const startTime = performance.now();
        const isPercentage = element.textContent.includes('%');
        const suffix = isPercentage ? '%' : '';

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = Utils.easeOutCubic(progress);
            const current = Math.floor(start + (target * easedProgress));

            element.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.setFinalValue(element, target);
            }
        };

        requestAnimationFrame(animate);
    },

    // Establecer valor final del contador
    setFinalValue(element, target) {
        const isPercentage = element.textContent.includes('%');
        const suffix = isPercentage ? '%' : '';
        element.textContent = target + suffix;
        element.classList.add('counter-completed');
    },

    // Inicializar todos los contadores
    initializeCounters() {
        const statValues = document.querySelectorAll('.stat-value[data-target]');
        const metricValues = document.querySelectorAll('.metric-value[data-target]');
        
        // Resetear valores iniciales
        statValues.forEach(stat => {
            const isPercentage = stat.textContent.includes('%');
            stat.textContent = '0' + (isPercentage ? '%' : '');
        });

        // Animar cuando sean visibles
        this.observeCounters([...statValues, ...metricValues]);
    },

    // Observar contadores para animar cuando sean visibles
    observeCounters(counters) {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !AppState.countersAnimated) {
                        const target = parseInt(entry.target.dataset.target);
                        if (!isNaN(target)) {
                            this.animateCounter(entry.target, target);
                        }
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: Config.observerThreshold });

            counters.forEach(counter => observer.observe(counter));
        } else {
            // Fallback para navegadores sin soporte
            counters.forEach(counter => {
                const target = parseInt(counter.dataset.target);
                if (!isNaN(target)) {
                    this.animateCounter(counter, target);
                }
            });
        }
    }
};

/**
 * ========================================
 * EFECTOS DE TIMELINE
 * ========================================
 */
const TimelineEffects = {
    // Inicializar efectos de hover en timeline
    initializeHoverEffects() {
        const timelineItems = document.querySelectorAll('.timeline-content');
        
        timelineItems.forEach(item => {
            this.addHoverListeners(item);
            this.addFocusListeners(item);
        });
    },

    // Agregar listeners de hover
    addHoverListeners(item) {
        const debouncedMouseEnter = Utils.debounce(() => {
            if (AppState.animationsEnabled) {
                item.style.transform = 'translateY(-2px) scale(1.01)';
                item.style.zIndex = '10';
                this.highlightTimelineMarker(item, true);
            }
        }, 50);

        const debouncedMouseLeave = Utils.debounce(() => {
            if (AppState.animationsEnabled) {
                item.style.transform = 'translateY(0) scale(1)';
                item.style.zIndex = '1';
                this.highlightTimelineMarker(item, false);
            }
        }, 50);

        item.addEventListener('mouseenter', debouncedMouseEnter);
        item.addEventListener('mouseleave', debouncedMouseLeave);
    },

    // Agregar listeners de focus para accesibilidad
    addFocusListeners(item) {
        item.setAttribute('tabindex', '0');
        
        item.addEventListener('focus', () => {
            item.style.outline = '2px solid #667eea';
            item.style.outlineOffset = '2px';
        });

        item.addEventListener('blur', () => {
            item.style.outline = 'none';
        });
    },

    // Resaltar marcador de timeline
    highlightTimelineMarker(item, highlight) {
        const timelineItem = item.closest('.timeline-item');
        const marker = timelineItem?.querySelector('.marker-dot');
        
        if (marker && AppState.animationsEnabled) {
            if (highlight) {
                marker.style.transform = 'scale(1.2)';
                marker.style.transition = 'transform 0.3s ease';
            } else {
                marker.style.transform = 'scale(1)';
            }
        }
    },

    // Animar entrada de elementos del timeline
    animateTimelineEntrance() {
        if (!AppState.animationsEnabled) return;

        const timelineItems = document.querySelectorAll('.timeline-item');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.style.animation = `slideInLeft 0.6s ease forwards`;
                            entry.target.style.opacity = '1';
                        }, index * 100);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            timelineItems.forEach(item => {
                item.style.opacity = '0';
                observer.observe(item);
            });
        }
    }
};

/**
 * ========================================
 * ACTUALIZACIONES DINÁMICAS
 * ========================================
 */
const DynamicUpdates = {
    // Actualizar progreso basado en hitos completados
    updateProgress() {
        const completed = document.querySelectorAll('.marker-dot.completed').length;
        const current = document.querySelectorAll('.marker-dot.current').length;
        const total = document.querySelectorAll('.marker-dot').length;
        
        // Calcular porcentaje (considerar elementos actuales como 50% completos)
        const percentage = Math.round(((completed + (current * 0.5)) / total) * 100);
        
        // Actualizar elementos de progreso
        this.updateProgressElements(percentage);
        
        // Actualizar estadísticas
        this.updateStatistics(completed, total - completed - current, percentage);
    },

    // Actualizar elementos visuales de progreso
    updateProgressElements(percentage) {
        const progressFill = document.querySelector('.progress-fill');
        const progressPercentage = document.querySelector('.progress-percentage');
        
        if (progressFill && AppState.animationsEnabled) {
            setTimeout(() => {
                progressFill.style.width = percentage + '%';
            }, 500);
        } else if (progressFill) {
            progressFill.style.width = percentage + '%';
        }
        
        if (progressPercentage) {
            progressPercentage.textContent = percentage + '%';
        }
    },

    // Actualizar estadísticas del header
    updateStatistics(completed, pending, percentage) {
        const statCards = document.querySelectorAll('.stat-card');
        const updates = [
            { index: 0, value: percentage, suffix: '%' }, // Progreso total
            { index: 1, value: completed, suffix: '' },   // Hitos completados
            { index: 2, value: pending, suffix: '' },     // Pendientes
            { index: 3, value: this.calculateDaysElapsed(), suffix: '' } // Días transcurridos
        ];

        updates.forEach(update => {
            const statValue = statCards[update.index]?.querySelector('.stat-value');
            if (statValue) {
                statValue.dataset.target = update.value;
            }
        });
    },

    // Calcular días transcurridos desde el inicio del proyecto
    calculateDaysElapsed() {
        const projectStart = new Date('2025-08-09');
        const today = new Date();
        const diffTime = Math.abs(today - projectStart);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    // Calcular días restantes hasta la fecha de entrega
    calculateDaysRemaining() {
        const projectEnd = new Date('2025-09-09');
        const today = new Date();
        const diffTime = projectEnd - today;
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
};

/**
 * ========================================
 * FUNCIONES DE EXPORTACIÓN
 * ========================================
 */
const ExportFunctions = {
    // Configurar botón de exportación
    setupExportButton() {
        const exportBtn = document.querySelector('.export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', this.handleExport.bind(this));
        }
    },

    // Manejar exportación
    handleExport() {
        // Preparar para impresión
        this.prepareForPrint();
        
        // Imprimir
        window.print();
        
        // Restaurar después de imprimir
        setTimeout(() => {
            this.restoreAfterPrint();
        }, 1000);
    },

    // Preparar documento para impresión
    prepareForPrint() {
        document.body.classList.add('printing');
        
        // Detener animaciones
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    },

    // Restaurar documento después de imprimir
    restoreAfterPrint() {
        document.body.classList.remove('printing');
        
        // Reanudar animaciones
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
};

/**
 * ========================================
 * OPTIMIZACIONES DE RENDIMIENTO
 * ========================================
 */
const PerformanceOptimizations = {
    // Lazy loading de imágenes (si las hubiera)
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    },

    // Optimizar animaciones con requestAnimationFrame
    throttleAnimations() {
        let ticking = false;

        const updateAnimations = () => {
            // Actualizar animaciones aquí si es necesario
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateAnimations);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick);
        window.addEventListener('resize', Utils.debounce(requestTick, Config.debounceDelay));
    }
};

/**
 * ========================================
 * INICIALIZACIÓN PRINCIPAL
 * ========================================
 */
class CronogramaApp {
    constructor() {
        this.init();
    }

    async init() {
        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        try {
            // Inicializar componentes
            await this.initializeComponents();
            
            // Marcar como cargado
            AppState.isLoading = false;
            document.body.classList.add('app-loaded');
            
            console.log('✅ Cronograma Tamdrea inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            this.handleInitializationError(error);
        }
    }

    async initializeComponents() {
        // Actualizar datos dinámicos
        DynamicUpdates.updateProgress();
        
        // Inicializar animaciones de contadores
        CounterAnimations.initializeCounters();
        
        // Configurar efectos de timeline
        TimelineEffects.initializeHoverEffects();
        TimelineEffects.animateTimelineEntrance();
        
        // Configurar exportación
        ExportFunctions.setupExportButton();
        
        // Optimizaciones de rendimiento
        PerformanceOptimizations.setupLazyLoading();
        PerformanceOptimizations.throttleAnimations();
        
        // Event listeners adicionales
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listener para cambios en preferencias de movimiento
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addEventListener('change', (e) => {
            AppState.animationsEnabled = !e.matches;
        });

        // Listener para visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pausar animaciones cuando la página no es visible
                document.body.classList.add('page-hidden');
            } else {
                document.body.classList.remove('page-hidden');
            }
        });

        // Listener para errores globales
        window.addEventListener('error', this.handleGlobalError);
    }

    handleInitializationError(error) {
        // Mostrar mensaje de error amigable al usuario
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
            <h3>⚠️ Error de inicialización</h3>
            <p>Hubo un problema al cargar el cronograma. Por favor, recarga la página.</p>
            <button onclick="window.location.reload()">Recargar página</button>
        `;
        document.body.appendChild(errorMessage);
    }

    handleGlobalError(event) {
        console.error('Error global capturado:', event.error);
        // Aquí podrías enviar el error a un servicio de logging
    }
}

// Inicializar la aplicación
const app = new CronogramaApp();
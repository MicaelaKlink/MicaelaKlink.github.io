// ===== MOBILE DETECTION =====
const isMobile = window.innerWidth <= 768;
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// ===== MODAL FUNCTIONS =====
// Open modal popup
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close modal popup
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling
    
    // Stop all videos in this modal
    const iframes = modal.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        const src = iframe.src;
        iframe.src = src; // Reload iframe to stop video
    });
    
    // Stop HTML5 videos
    const videos = modal.querySelectorAll('video');
    videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
    });
}

// Close modal when clicking outside the content
window.onclick = function(event) {
    // Check if it's a modal (not lightbox)
    if (event.target.classList.contains('modal') && !event.target.id.includes('lightbox')) {
        const modalId = event.target.id;
        event.target.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Stop all videos in this modal
        const iframes = event.target.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            const src = iframe.src;
            iframe.src = src; // Reload iframe to stop video
        });
        
        // Stop HTML5 videos
        const videos = event.target.querySelectorAll('video');
        videos.forEach(video => {
            video.pause();
            video.currentTime = 0;
        });
    }
    // Check if it's the lightbox background
    if (event.target.id === 'lightbox-modal') {
        closeLightbox();
    }
}

// ===== LIGHTBOX FUNCTIONS =====
let currentCarouselImages = [];
let currentLightboxIndex = 0;

// Function to open the lightbox (works with both carousel and regular images)
function openLightbox(element) {
    const modal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    
    // Check if image is part of a carousel
    const carouselContainer = element.closest('.carousel-container');
    
    if (carouselContainer) {
        // Get all images from this carousel
        currentCarouselImages = Array.from(carouselContainer.querySelectorAll('.carousel-slide img')).map(img => img.src);
        // Find which image was clicked
        currentLightboxIndex = currentCarouselImages.indexOf(element.src);
    } else {
        // Single image (regular zoomable image)
        currentCarouselImages = [element.src];
        currentLightboxIndex = 0;
    }
    
    lightboxImg.src = currentCarouselImages[currentLightboxIndex];
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Show/hide navigation arrows based on number of images
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    if (currentCarouselImages.length > 1) {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
}

// Function to close the lightbox
function closeLightbox() {
    document.getElementById('lightbox-modal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function navigateLightbox(direction) {
    currentLightboxIndex += direction;
    
    // Loop around
    if (currentLightboxIndex < 0) {
        currentLightboxIndex = currentCarouselImages.length - 1;
    } else if (currentLightboxIndex >= currentCarouselImages.length) {
        currentLightboxIndex = 0;
    }
    
    document.getElementById('lightbox-img').src = currentCarouselImages[currentLightboxIndex];
}

// ===== MOBILE TOUCH SWIPE FOR LIGHTBOX =====
if (isTouchDevice) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const lightboxModal = document.getElementById('lightbox-modal');
    if (lightboxModal) {
        lightboxModal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        lightboxModal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const swipeThreshold = 50; // minimum distance for swipe
            if (currentCarouselImages.length > 1) {
                if (touchEndX < touchStartX - swipeThreshold) {
                    // Swipe left - next image
                    navigateLightbox(1);
                }
                if (touchEndX > touchStartX + swipeThreshold) {
                    // Swipe right - previous image
                    navigateLightbox(-1);
                }
            }
        }
    }
}

// ===== UNIFIED KEYBOARD NAVIGATION =====
document.addEventListener('keydown', function(event) {
    // Check if lightbox is open first (higher priority)
    const lightboxModal = document.getElementById('lightbox-modal');
    if (lightboxModal && lightboxModal.style.display === 'block') {
        if (event.key === 'ArrowLeft') navigateLightbox(-1);
        if (event.key === 'ArrowRight') navigateLightbox(1);
        if (event.key === 'Escape') closeLightbox();
        return; // Don't process other modals
    }
    
    // Then check for regular modals
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
            
            // Stop all videos in this modal
            const iframes = modal.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                const src = iframe.src;
                iframe.src = src; // Reload iframe to stop video
            });
            
            // Stop HTML5 videos
            const videos = modal.querySelectorAll('video');
            videos.forEach(video => {
                video.pause();
                video.currentTime = 0;
            });
        });
        document.body.style.overflow = 'auto';
    }
});

// ===== CAROUSEL INITIALIZATION =====
document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const slides = carousel.querySelector('.carousel-slides');
    const indicatorsContainer = carousel.querySelector('.carousel-indicators');
    const slideElements = carousel.querySelectorAll('.carousel-slide');
    
    let currentIndex = 0;
    const totalSlides = slideElements.length;

    // Clear any existing dots first
    indicatorsContainer.innerHTML = '';

    // Create indicator dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        indicatorsContainer.appendChild(dot);
    }

    const dots = indicatorsContainer.querySelectorAll('.carousel-dot');

    function updateCarousel() {
        slides.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }

    // Add click handlers to carousel images for lightbox
    slideElements.forEach(slide => {
        const img = slide.querySelector('img');
        if (img) {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => openLightbox(img));
        }
    });
    
    // ===== MOBILE TOUCH SWIPE FOR CAROUSEL =====
    if (isTouchDevice) {
        let touchStartX = 0;
        let touchEndX = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleCarouselSwipe();
        }, false);
        
        function handleCarouselSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                nextSlide();
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                prevSlide();
            }
        }
    }
});

// ===== FILTER PROJECTS (Tech Page) =====
function filterProjects(category) {
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach(card => {
        if (category === 'all') {
            card.style.display = 'block';
            // Add fade-in animation
            card.style.animation = 'fadeIn 0.5s ease-in';
        } else {
            const categories = card.getAttribute('data-category');
            if (categories && categories.includes(category)) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease-in';
            } else {
                card.style.display = 'none';
            }
        }
    });
    
    // Update active button state
    const buttons = document.querySelectorAll('.filter-buttons .btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ===== FILTER LOOSE GRID (Graphics & Art Pages) =====
function filterLoose(category) {
    const cards = document.querySelectorAll('.loose-card');
    
    cards.forEach(card => {
        if (category === 'all') {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease-in';
        } else {
            const categories = card.getAttribute('data-category');
            if (categories && categories.includes(category)) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease-in';
            } else {
                card.style.display = 'none';
            }
        }
    });
    
    // Update active button state
    const buttons = document.querySelectorAll('.filter-buttons .btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#') && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ===== MOBILE NAVIGATION TOGGLE =====
// Add hamburger menu functionality if you want to add a mobile menu later
function createMobileMenu() {
    const nav = document.querySelector('nav ul');
    if (nav && isMobile) {
        // Add mobile menu icon
        const menuIcon = document.createElement('div');
        menuIcon.className = 'mobile-menu-icon';
        menuIcon.innerHTML = '<i class="fas fa-bars"></i>';
        menuIcon.style.cssText = 'display: none; cursor: pointer; font-size: 1.5rem; color: #3d4c3d;';
        
        const container = document.querySelector('nav .container');
        if (container && window.innerWidth <= 768) {
            menuIcon.style.display = 'block';
            container.insertBefore(menuIcon, nav);
            nav.style.display = 'none';
            
            menuIcon.addEventListener('click', () => {
                if (nav.style.display === 'none') {
                    nav.style.display = 'flex';
                    menuIcon.innerHTML = '<i class="fas fa-times"></i>';
                } else {
                    nav.style.display = 'none';
                    menuIcon.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        }
    }
}

// ===== WINDOW RESIZE HANDLER =====
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Recalculate mobile state
        const nowMobile = window.innerWidth <= 768;
        if (nowMobile !== isMobile) {
            location.reload(); // Reload page on significant size change
        }
    }, 250);
});

// ===== PREVENT ZOOM ON DOUBLE TAP (iOS) =====
if (isTouchDevice) {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// ===== LAZY LOADING IMAGES =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== PAGE LOAD OPTIMIZATIONS =====
window.addEventListener('DOMContentLoaded', () => {
    // Add loaded class to body for CSS animations
    document.body.classList.add('page-loaded');
    
    // Initialize mobile menu if needed
    if (window.innerWidth <= 768) {
        createMobileMenu();
    }
});

// ===== PERFORMANCE: Debounce scroll events =====
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            // Add any scroll-based animations here
            ticking = false;
        });
        ticking = true;
    }
});



// ===== BACK TO TOP BUTTON =====
const backToTopButton = document.getElementById('backToTop');

if (backToTopButton) {
    // Show button when user scrolls down 300px
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    // Smooth scroll to top when clicked
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
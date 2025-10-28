// Функция для инициализации каруселей
function initCarousels() {
    document.querySelectorAll('.carousel').forEach(carousel => {
        const inner = carousel.querySelector('.carousel-inner');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');

        let currentIndex = 0;
        const totalSlides = slides.length;

        // Функция обновления позиции
        function updateCarousel() {
            inner.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        // Кнопка "вперед"
        if (nextBtn) {
            nextBtn.onclick = () => {
                currentIndex = (currentIndex + 1) % totalSlides;
                updateCarousel();
            };
        }

        // Кнопка "назад"
        if (prevBtn) {
            prevBtn.onclick = () => {
                currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                updateCarousel();
            };
        }

        // Инициализация
        updateCarousel();
    });
}

// Инициализация каруселей при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    initCarousels();

    // Также переинициализируем карусели при открытии разделов
    const originalToggleSublist = window.toggleSublist;
    window.toggleSublist = function (type) {
        originalToggleSublist(type);
        // Даем время на анимацию открытия и затем инициализируем карусели
        setTimeout(() => {
            initCarousels();
        }, 300);
    };
});

// Также добавьте в функцию toggleSublist вызов инициализации
function toggleSublist(type) {
    const sublist = document.getElementById('sublist-' + type);
    const arrow = document.getElementById('arrow-' + type);

    if (sublist.classList.contains('hidden')) {
        sublist.classList.remove('hidden', 'opacity-0', 'scale-95');
        // Даем время для применения изменений
        setTimeout(() => {
            sublist.classList.add('opacity-100', 'scale-100');
        }, 10);
        arrow.classList.add('rotate-180');
        setTimeout(() => initCarousels(), 500);
    } else {
        sublist.classList.remove('opacity-100', 'scale-100');
        sublist.classList.add('opacity-0', 'scale-95');

        setTimeout(() => {
            sublist.classList.add('hidden');
        }, 500);
        arrow.classList.remove('rotate-180');
    }
}
import './bootstrap';
import Swiper from 'swiper/bundle';

import.meta.glob([
  '../images/**',
  '../fonts/**',
]);


var swiper = new Swiper('.swiper-container', {
  slidesPerView: 1.5,
  spaceBetween: 10,
  navigation: false,
});

const navButton = document.getElementById('nav-button');
const navMenu = document.getElementById('nav-menu');
navButton.addEventListener('click', (e) => {
    e.preventDefault();

    navMenu.classList.toggle('hidden');
});
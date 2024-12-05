// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Import AOS and its CSS
import AOS from 'aos';
import 'aos/dist/aos.css';

// Initialize AOS globally
AOS.init({
    duration: 1000, // Animation duration in milliseconds
    once: true,     // Whether animation should happen only once - while scrolling down
    offset: 120,    // Offset (in px) from the original trigger point
    easing: 'ease-in-out', // Easing function for AOS animations
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

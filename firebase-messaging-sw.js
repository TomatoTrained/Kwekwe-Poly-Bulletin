// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
    apiKey: "AIzaSyAL7NNio6HiW6sEG6D7ICwUGVgtui8VVns",
    authDomain: "kwekwe-poly-bulletin.firebaseapp.com",
    projectId: "kwekwe-poly-bulletin",
    storageBucket: "kwekwe-poly-bulletin.firebasestorage.app",
    messagingSenderId: "988682570917",
    appId: "1:988682570917:web:8e66c6fbe54384a56a914c",
    measurementId: "G-JE1FN4M7Y3"
};

firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: payload.data?.category || 'general',
        data: payload.data,
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: '/icon-192x192.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/icon-192x192.png'
            }
        ]
    };

    // Show notification
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    if (event.action === 'view') {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'dismiss') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Handle push events
self.addEventListener('push', (event) => {
    console.log('Push event received:', event);

    if (event.data) {
        const data = event.data.json();
        console.log('Push data:', data);

        const options = {
            body: data.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: data.tag || 'general',
            data: data.data,
            actions: [
                {
                    action: 'view',
                    title: 'View',
                    icon: '/icon-192x192.png'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss',
                    icon: '/icon-192x192.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Cache management for offline support
const CACHE_NAME = 'kwekwe-poly-bulletin-v1';
const urlsToCache = [
    '/',
    '/indexo.html',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js',
    'https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

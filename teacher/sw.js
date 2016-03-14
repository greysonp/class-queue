console.log('Started', self);

self.addEventListener('install', function(event) {
    console.log('Installed', event);
    return self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('Activated', event);
});

self.addEventListener('push', function(event) {
    console.log('Push message received', event);
    event.waitUntil(
        self.registration.showNotification('New Question!', {
            icon: 'images/icon.png',
            tag: 'class-queue-tag'
        })
    );
});

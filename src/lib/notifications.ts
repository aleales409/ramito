/**
 * Utility module for handling browser and OS push notifications.
 * Works even when the app is in the background or minimized.
 */

// Request permission to send notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  }

  return false;
}

// Display a system-level notification
export async function sendPushNotification(title: string, body: string): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const options: any = {
    body,
    icon: '/logo-ramito.png',
    badge: '/logo-ramito.png',
    tag: 'ramito-notification',
    renotify: true,
    vibrate: [200, 100, 200],
    silent: false
  };

  try {
    // Attempt to show notification via Service Worker registration for background support
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, options);
        return;
      }
    }
  } catch (err) {
    console.warn('Failed to show notification via service worker, falling back to standard Notification:', err);
  }

  // Fallback to standard web notification
  try {
    new Notification(title, options);
  } catch (err) {
    console.error('Failed to create standard web notification:', err);
  }
}

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, type Token, type ActionPerformed } from '@capacitor/push-notifications';
import api from '../api/client';

// ── Types ───────────────────────────────────────────────────────────────────

interface PushRegistrationPayload {
  platform: string;
  token: string;
}

// ── Hook ────────────────────────────────────────────────────────────────────

/**
 * Registers the device for push notifications on native platforms
 * (Android / iOS) via Capacitor.  On the web this is a no-op.
 *
 * The device token is sent to the backend so the server can target
 * this device for alerts and system notifications.
 *
 * Call once at the top level (e.g. in `App.tsx`).
 */
export function usePushNotifications(): void {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (registeredRef.current) return;
    if (!Capacitor.isNativePlatform()) return;
    registeredRef.current = true;

    async function setup() {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('[push] Permission not granted');
        return;
      }

      await PushNotifications.register();

      PushNotifications.addListener('registration', (token: Token) => {
        void sendTokenToBackend(token.value);
      });

      PushNotifications.addListener('registrationError', (err) => {
        console.error('[push] Registration failed', err);
      });

      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification: ActionPerformed) => {
          handleNotificationAction(notification);
        },
      );
    }

    void setup();

    return () => {
      void PushNotifications.removeAllListeners();
    };
  }, []);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function sendTokenToBackend(token: string): Promise<void> {
  const payload: PushRegistrationPayload = {
    platform: Capacitor.getPlatform(),
    token,
  };

  try {
    await api.post('/notifications/devices', payload);
  } catch (err) {
    console.error('[push] Failed to register device token', err);
  }
}

function handleNotificationAction(notification: ActionPerformed): void {
  const data = notification.notification.data as Record<string, string> | undefined;
  if (!data) return;

  // Deep-link into the app based on the notification payload.
  if (data['route']) {
    window.location.hash = data['route'];
  }
}

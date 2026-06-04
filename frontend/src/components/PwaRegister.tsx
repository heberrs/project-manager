'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Service worker registrado com sucesso:', reg.scope);
          })
          .catch((err) => {
            console.error('Falha ao registrar o service worker:', err);
          });
      });
    }
  }, []);

  return null;
}

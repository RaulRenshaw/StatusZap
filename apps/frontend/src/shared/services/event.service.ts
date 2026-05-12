/**
 * event.service.ts — bus de eventos interno
 *
 * Usado para notificar componentes sobre mudanças de dados
 * sem precisar de estado global complexo.
 */

export const STORE_EVENT = "sr:update";

export function emitStoreUpdate() {
  window.dispatchEvent(new Event(STORE_EVENT));
}

export function onStoreUpdate(handler: () => void) {
  window.addEventListener(STORE_EVENT, handler);
  return () => window.removeEventListener(STORE_EVENT, handler);
}

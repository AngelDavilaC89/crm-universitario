"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

const TIMEOUT_MINUTES = 10;
const TIMEOUT_MS = TIMEOUT_MINUTES * 60 * 1000;

export function SessionTimeout() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Configurar nuevo timer
    timerRef.current = setTimeout(() => {
      // Si pasan los 10 minutos sin actividad, cerrar sesión
      console.log("Sesión expirada por inactividad");
      signOut({ callbackUrl: "/login" });
    }, TIMEOUT_MS);
  };

  useEffect(() => {
    // Eventos que indican actividad del usuario
    const events = [
      "mousemove",
      "mousedown",
      "click",
      "scroll",
      "keypress",
      "touchstart"
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Inicializar el timer cuando carga la app
    resetTimer();

    // Agregar listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Limpieza
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  return null; // Este componente es invisible
}

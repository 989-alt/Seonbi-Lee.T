"use client";

import { useEffect } from "react";
import { idleLogoutAction } from "../actions";

const IDLE_MS = 30 * 60 * 1000; // 30분 동안 조작이 없으면 로그아웃
const EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

export function IdleLogout() {
  useEffect(() => {
    let last = Date.now();
    const bump = () => { last = Date.now(); };
    EVENTS.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const timer = window.setInterval(() => {
      if (Date.now() - last >= IDLE_MS) {
        window.clearInterval(timer);
        void idleLogoutAction();
      }
    }, 30_000);
    return () => {
      window.clearInterval(timer);
      EVENTS.forEach((e) => window.removeEventListener(e, bump));
    };
  }, []);
  return null;
}

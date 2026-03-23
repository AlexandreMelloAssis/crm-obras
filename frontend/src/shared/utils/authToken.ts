import { STORAGE_KEYS } from "@/lib/constants";

const COOKIE_NAME = "crm_obras_token";

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
}

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  setCookie(COOKIE_NAME, token);
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEYS.TOKEN) ?? getCookie(COOKIE_NAME);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.TOKEN);
  deleteCookie(COOKIE_NAME);
}

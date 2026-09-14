import type { AppData, Settings } from "./types";

const KEY = "water-business-manager-data-v1";
const SESSION_KEY = "water-business-manager-session";

const defaultSettings: Settings = {
  businessName: "Water Business Manager",
  ownerName: "",
  phone: "",
  address: "",
  currency: "₹",
  darkMode: false,
};

const initialData: AppData = {
  shops: [],
  products: [
    { id: crypto.randomUUID(), name: "Water Can", price: 50, active: true },
    { id: crypto.randomUUID(), name: "Water Bottle", price: 20, active: true },
    { id: crypto.randomUUID(), name: "Juice", price: 30, active: true },
  ],
  supplies: [],
  payments: [],
  settings: defaultSettings,
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw) as AppData;
  } catch {
    return initialData;
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

export function setLoggedIn(value: boolean) {
  if (value) sessionStorage.setItem(SESSION_KEY, "true");
  else sessionStorage.removeItem(SESSION_KEY);
}
import type { AppData, Payment, Supply } from "./types";

export const today = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const money = (value: number, currency = "₹") =>
  `${currency}${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const dateLabel = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function shopSupply(data: AppData, shopId: string, upto?: string) {
  return data.supplies
    .filter(s => s.shopId === shopId && (!upto || s.date <= upto))
    .reduce((sum, s) => sum + s.total, 0);
}

export function shopPayments(data: AppData, shopId: string, upto?: string) {
  return data.payments
    .filter(p => p.shopId === shopId && (!upto || p.date <= upto))
    .reduce((sum, p) => sum + p.amount, 0);
}

export function shopBalance(data: AppData, shopId: string, upto?: string) {
  return shopSupply(data, shopId, upto) - shopPayments(data, shopId, upto);
}

export function daySupply(data: AppData, date: string) {
  return data.supplies.filter(s => s.date === date).reduce((a, s) => a + s.total, 0);
}

export function dayPayments(data: AppData, date: string) {
  return data.payments.filter(p => p.date === date).reduce((a, p) => a + p.amount, 0);
}

export function csvEscape(value: unknown) {
  const s = String(value ?? "");
  return `"${s.replaceAll('"', '""')}"`;
}

export function downloadCsv(filename: string, rows: unknown[][]) {
  const csv = rows.map(row => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAll(data: AppData) {
  const rows: unknown[][] = [["Type", "Date", "Shop", "Product", "Quantity", "Price", "Amount", "Method", "Notes"]];
  const shops = new Map(data.shops.map(s => [s.id, s.name]));
  data.supplies.forEach((s: Supply) =>
    s.items.forEach(i => rows.push(["Supply", s.date, shops.get(s.shopId), i.productName, i.quantity, i.price, i.total, "", s.notes]))
  );
  data.payments.forEach((p: Payment) =>
    rows.push(["Payment", p.date, shops.get(p.shopId), "", "", "", p.amount, p.method, p.notes])
  );
  downloadCsv(`water-business-backup-${today()}.csv`, rows);
}
import { CATEGORY_KEYWORDS } from "@/components/utils/categoryConfig";

// ── Bank/E-wallet Templates ──────────────────────────────────────────────────
export const BANK_TEMPLATES = [
  {
    id: "auto",
    name: "Deteksi Otomatis",
    icon: "🔍",
    description: "Cocok untuk semua format CSV",
  },
  {
    id: "bca",
    name: "BCA",
    icon: "🏦",
    description: "Mutasi rekening BCA",
    mapping: { date: "Tanggal", note: "Keterangan", debit: "Debet", credit: "Kredit" },
    dateFormat: "DD/MM/YYYY",
    delimiter: ",",
    skipRows: 0,
  },
  {
    id: "mandiri",
    name: "Mandiri",
    icon: "🏦",
    description: "Mutasi rekening Mandiri",
    mapping: { date: "Tanggal Transaksi", note: "Deskripsi Transaksi", debit: "Nominal Debet", credit: "Nominal Kredit" },
    dateFormat: "DD/MM/YYYY",
    delimiter: ",",
    skipRows: 0,
  },
  {
    id: "bri",
    name: "BRI",
    icon: "🏦",
    description: "Mutasi rekening BRI",
    mapping: { date: "TANGGAL", note: "KETERANGAN", amount: "NOMINAL", type: "DB/CR" },
    dateFormat: "DD-MM-YYYY",
    delimiter: ",",
    skipRows: 0,
  },
  {
    id: "bni",
    name: "BNI",
    icon: "🏦",
    description: "Mutasi rekening BNI",
    mapping: { date: "Tanggal", note: "Keterangan", debit: "Debit", credit: "Kredit" },
    dateFormat: "DD/MM/YYYY",
    delimiter: ";",
    skipRows: 0,
  },
  {
    id: "gopay",
    name: "GoPay",
    icon: "💚",
    description: "Riwayat transaksi GoPay",
    mapping: { date: "Tanggal", note: "Keterangan", amount: "Nominal", type: "Jenis" },
    dateFormat: "DD MMM YYYY",
    delimiter: ",",
    skipRows: 0,
  },
  {
    id: "ovo",
    name: "OVO",
    icon: "💜",
    description: "Riwayat transaksi OVO",
    mapping: { date: "Date", note: "Description", amount: "Amount", type: "Type" },
    dateFormat: "DD/MM/YYYY",
    delimiter: ",",
    skipRows: 0,
  },
  {
    id: "dana",
    name: "DANA",
    icon: "💙",
    description: "Riwayat transaksi DANA",
    mapping: { date: "Tanggal", note: "Keterangan", amount: "Nominal", type: "Tipe" },
    dateFormat: "DD/MM/YYYY HH:mm",
    delimiter: ",",
    skipRows: 0,
  },
  {
    id: "shopee",
    name: "ShopeePay",
    icon: "🧡",
    description: "Riwayat transaksi ShopeePay",
    mapping: { date: "Waktu Transaksi", note: "Keterangan", amount: "Jumlah", type: "Tipe Transaksi" },
    dateFormat: "DD/MM/YYYY HH:mm:ss",
    delimiter: ",",
    skipRows: 0,
  },
];

// ── CSV Parsing ───────────────────────────────────────────────────────────────
export function parseCSV(text, delimiter = ",") {
  // Try to detect delimiter if auto
  if (delimiter === "auto") {
    const firstLine = text.split(/\r?\n/)[0];
    delimiter = firstLine.includes(";") ? ";" : ",";
  }

  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  function splitLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuotes = !inQuotes;
      } else if (line[i] === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += line[i];
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = splitLine(lines[0]).map(h => h.replace(/^"|"$/g, "").trim());
  const rows = lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const vals = splitLine(line).map(v => v.replace(/^"|"$/g, "").trim());
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
      return obj;
    });

  return { headers, rows };
}

// ── Auto-detect column mapping ────────────────────────────────────────────────
export function autoDetectMapping(headers) {
  const map = { date: "", amount: "", debit: "", credit: "", note: "", type: "", category: "" };
  headers.forEach(h => {
    const lower = h.toLowerCase();
    if (!map.date && (lower.includes("tanggal") || lower.includes("date") || lower.includes("tgl") || lower.includes("waktu") || lower.includes("time"))) map.date = h;
    if (!map.debit && (lower.includes("debet") || lower.includes("debit") || lower.includes("db") || lower === "keluar" || lower.includes("pengeluaran"))) map.debit = h;
    if (!map.credit && (lower.includes("kredit") || lower.includes("credit") || lower.includes("cr") || lower === "masuk" || lower.includes("pemasukan"))) map.credit = h;
    if (!map.amount && !map.debit && (lower.includes("amount") || lower.includes("nominal") || lower.includes("jumlah") || lower === "nilai")) map.amount = h;
    if (!map.note && (lower.includes("keterangan") || lower.includes("deskripsi") || lower.includes("description") || lower.includes("catatan") || lower.includes("note") || lower.includes("merchant") || lower.includes("remark"))) map.note = h;
    if (!map.type && (lower === "type" || lower === "tipe" || lower.includes("jenis") || lower === "db/cr" || lower === "cr/db")) map.type = h;
    if (!map.category && (lower.includes("kategori") || lower.includes("category"))) map.category = h;
  });
  return map;
}

// ── Date Parsing ─────────────────────────────────────────────────────────────
const MONTH_MAP = {
  jan: "01", feb: "02", mar: "03", apr: "04", mei: "05", may: "05",
  jun: "06", jul: "07", agu: "08", aug: "08", sep: "09", okt: "10",
  oct: "10", nov: "11", des: "12", dec: "12"
};

export function parseDate(str) {
  if (!str) return null;
  str = str.trim();

  // ISO: 2024-01-15
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;

  // DD MMM YYYY (e.g. "15 Jan 2024")
  const dMonY = str.match(/^(\d{1,2})\s+([a-zA-Z]{3})\s+(\d{4})/);
  if (dMonY) {
    const m = MONTH_MAP[dMonY[2].toLowerCase()];
    if (m) return `${dMonY[3]}-${m}-${String(dMonY[1]).padStart(2, "0")}`;
  }

  // MM/DD/YYYY
  const mdy = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (mdy && parseInt(mdy[1]) <= 12) {
    const day = parseInt(mdy[2]) > 12 ? `${mdy[3]}-${mdy[1]}-${mdy[2]}` : `${mdy[3]}-${mdy[2]}-${mdy[1]}`;
    return day;
  }

  return null;
}

// ── Amount Parsing ────────────────────────────────────────────────────────────
export function parseAmount(str) {
  if (!str || str.toString().trim() === "" || str.toString().trim() === "-") return 0;
  const s = str.toString()
    .replace(/[Rp\s]/gi, "")
    .replace(/\./g, "")    // remove thousand separator (.)
    .replace(",", ".");     // decimal comma → dot
  return Math.abs(parseFloat(s)) || 0;
}

// ── Category Detection ────────────────────────────────────────────────────────
export function detectCategory(text, type = "expense") {
  if (!text) return "other";
  const lower = text.toLowerCase();

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      // Validate category exists for this type
      if (type === "income" && ["salary", "freelance", "other"].includes(cat)) return cat;
      if (type === "expense" && !["salary", "freelance"].includes(cat)) return cat;
    }
  }
  return "other";
}

// ── Detect transaction type ───────────────────────────────────────────────────
export function detectType(row, mapping) {
  const typeVal = mapping.type ? (row[mapping.type] || "").toLowerCase() : "";
  const isCredit = typeVal.includes("cr") || typeVal.includes("kredit") || typeVal.includes("credit")
    || typeVal.includes("masuk") || typeVal.includes("income") || typeVal.includes("pemasukan")
    || typeVal.includes("top up") || typeVal.includes("topup") || typeVal.includes("transfer masuk")
    || typeVal.includes("refund");
  return isCredit ? "income" : "expense";
}

// ── Main transformer ──────────────────────────────────────────────────────────
export function transformRows(rows, mapping, defaultType = "expense") {
  const results = [];
  const errors = [];

  rows.forEach((row, idx) => {
    // Determine amount and type
    let amount = 0;
    let type = defaultType;

    if (mapping.debit && mapping.credit) {
      const debitAmt = parseAmount(row[mapping.debit]);
      const creditAmt = parseAmount(row[mapping.credit]);
      if (debitAmt > 0) { amount = debitAmt; type = "expense"; }
      else if (creditAmt > 0) { amount = creditAmt; type = "income"; }
      else { errors.push(`Baris ${idx + 2}: jumlah kosong`); return; }
    } else if (mapping.amount) {
      amount = parseAmount(row[mapping.amount]);
      type = mapping.type ? detectType(row, mapping) : defaultType;
    } else {
      errors.push(`Baris ${idx + 2}: kolom jumlah tidak ditemukan`);
      return;
    }

    if (amount <= 0) { errors.push(`Baris ${idx + 2}: jumlah tidak valid`); return; }

    const date = parseDate(row[mapping.date]);
    if (!date) { errors.push(`Baris ${idx + 2}: format tanggal tidak dikenali (${row[mapping.date]})`); return; }

    const note = mapping.note ? (row[mapping.note] || "") : "";
    const category = detectCategory(note, type);

    results.push({ date, amount, type, note, category });
  });

  return { results, errors };
}
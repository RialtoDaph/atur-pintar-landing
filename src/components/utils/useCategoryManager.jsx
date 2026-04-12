import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { CATEGORY_KEYWORDS } from "./categoryConfig";
import { FALLBACK_CATEGORIES } from "@/components/transactions/TransactionCategories";

const STOP_WORDS = new Set(["ke", "di", "dan", "yang", "untuk", "dari", "beli", "bayar", "buat", "dengan", "ini", "itu", "ada", "bisa", "atau", "saya", "aku", "kamu"]);

function extractKeywords(note) {
  return note
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .slice(0, 4)
    .join(" ");
}

/**
 * Centralized hook for category & transaction management
 */
export function useCategoryManager() {
  const [allCatsMap, setAllCatsMap] = useState({});

  useEffect(() => {
    base44.entities.GlobalCategory.list("sort_order").then(res => {
      const active = res.filter(c => c.is_active !== false);
      const cats = active.length > 0 ? active : FALLBACK_CATEGORIES;
      const map = {};
      cats.forEach(cat => {
        const key = cat.id ? `global_${cat.id}` : cat.key;
        map[key] = { key, label: cat.name, emoji: cat.emoji, color: cat.color, type: cat.type };
        // Also map by plain key for fallback compatibility
        if (cat.key) map[cat.key] = map[key];
      });
      setAllCatsMap(map);
    }).catch(() => {
      const map = {};
      FALLBACK_CATEGORIES.forEach(cat => {
        map[cat.key] = { key: cat.key, label: cat.name, emoji: cat.emoji, color: cat.color, type: cat.type };
      });
      setAllCatsMap(map);
    });
  }, []);

  const getCategoryByKey = useCallback((key) => {
    if (!key) return null;
    return allCatsMap[key] || null;
  }, [allCatsMap]);

  const detectCategory = useCallback((text) => {
    const lower = text.toLowerCase();
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some((kw) => lower.includes(kw))) return cat;
    }
    return null;
  }, []);

  /**
   * Save to CategoryLearning in DB (+ localStorage fallback)
   */
  const learnCategory = useCallback(async (note, category) => {
    if (!note || !category) return;
    const fragment = extractKeywords(note);
    if (!fragment) return;

    // localStorage for fast local suggestions
    const localKey = "cat_history";
    const existing = JSON.parse(localStorage.getItem(localKey) || "{}");
    existing[fragment] = category;
    const entries = Object.entries(existing);
    if (entries.length > 200) entries.splice(0, entries.length - 200);
    localStorage.setItem(localKey, JSON.stringify(Object.fromEntries(entries)));

    // DB for cross-device persistence
    try {
      const matches = await base44.entities.CategoryLearning.filter({ note_fragment: fragment });
      if (matches && matches.length > 0) {
        await base44.entities.CategoryLearning.update(matches[0].id, {
          category,
          count: (matches[0].count || 1) + 1
        });
      } else {
        await base44.entities.CategoryLearning.create({ note_fragment: fragment, category, count: 1 });
      }
    } catch (_) {}
  }, []);

  /**
   * Suggest from CategoryLearning DB (count >= 2) or localStorage
   */
  const suggestFromHistory = useCallback((note) => {
    if (!note) return null;
    const fragment = extractKeywords(note);
    if (!fragment) return null;
    const history = JSON.parse(localStorage.getItem("cat_history") || "{}");
    const words = fragment.split(" ");
    for (const word of words) {
      for (const [pastNote, category] of Object.entries(history)) {
        if (pastNote.includes(word)) return category;
      }
    }
    return null;
  }, []);

  /**
   * Suggest from CategoryLearning DB with count >= 2
   */
  const suggestFromDB = useCallback(async (note) => {
    if (!note || note.length < 3) return null;
    const fragment = extractKeywords(note);
    if (!fragment) return null;
    try {
      const words = fragment.split(" ");
      for (const word of words) {
        const matches = await base44.entities.CategoryLearning.filter({ note_fragment: word });
        const strong = matches?.find(m => (m.count || 1) >= 2);
        if (strong) return strong.category;
      }
    } catch (_) {}
    return null;
  }, []);

  const parseTransaction = useCallback((text) => {
    const amountRegex = /(\d[\d.,]*)\s*(ribu|rb|k|juta|jt|miliar|mil)?\b/gi;
    const matches = [...text.matchAll(amountRegex)];
    let amount = null;
    let amountStr = null;

    for (const m of matches) {
      const num = parseFloat(m[1].replace(/\./g, "").replace(/,/g, "."));
      const suffix = (m[2] || "").toLowerCase();
      let value = num;
      if (["ribu", "rb", "k"].includes(suffix)) value = num * 1000;
      else if (["juta", "jt"].includes(suffix)) value = num * 1000000;
      else if (["miliar", "mil"].includes(suffix)) value = num * 1000000000;
      if (value >= 100) { amount = value; amountStr = m[0]; break; }
    }
    if (!amount) return null;

    const note = text.replace(amountStr, "").trim().replace(/\s+/g, " ") || "Transaksi";
    const incomeKW = ["terima", "dapat", "gaji", "masuk", "income", "pemasukan", "salary"];
    const isIncome = incomeKW.some((kw) => text.toLowerCase().includes(kw));
    const category = detectCategory(text);
    return { amount, note, type: isIncome ? "income" : "expense", category };
  }, [detectCategory]);

  const createTransaction = useCallback(async (txData) => {
    return base44.entities.Transaction.create({
      amount: txData.amount,
      type: txData.type,
      category: txData.category || "other",
      note: txData.note,
      date: txData.date || new Date().toISOString().split("T")[0],
      is_recurring: txData.is_recurring || false,
      recurring_interval: txData.recurring_interval,
      recurring_last_generated: txData.recurring_last_generated,
      goal_id: txData.goal_id,
    });
  }, []);

  const formatCategory = useCallback((categoryKey) => {
    const cat = getCategoryByKey(categoryKey);
    if (!cat) return { emoji: "📦", label: categoryKey };
    return { emoji: cat.emoji || "📦", label: cat.label || categoryKey };
  }, [getCategoryByKey]);

  return {
    customCats: [],
    allCatsMap,
    subCatsByParent: {},
    getCategoryByKey,
    detectCategory,
    parseTransaction,
    createTransaction,
    formatCategory,
    learnCategory,
    suggestFromHistory,
    suggestFromDB,
    loadCustomCats: () => {},
  };
}
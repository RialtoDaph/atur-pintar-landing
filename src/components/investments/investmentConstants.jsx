export const INVESTMENT_TYPES_LIST = [
  { key: "saham",     emoji: "📈", label_id: "Saham",     label_en: "Stocks"      },
  { key: "reksa_dana",emoji: "💰", label_id: "Reksa Dana", label_en: "Mutual Fund" },
  { key: "crypto",   emoji: "₿",  label_id: "Crypto",     label_en: "Crypto"      },
  { key: "deposito", emoji: "🏦", label_id: "Deposito",   label_en: "Deposit"     },
  { key: "obligasi", emoji: "📄", label_id: "Obligasi",   label_en: "Bonds"       },
  { key: "emas",     emoji: "🥇", label_id: "Emas",       label_en: "Gold"        },
  { key: "lainnya",  emoji: "💼", label_id: "Lainnya",    label_en: "Other"       },
];

export const INVESTMENT_TYPES_MAP = Object.fromEntries(
  INVESTMENT_TYPES_LIST.map(t => [t.key, t])
);

// Unit label per type per language
export const UNIT_LABELS = {
  saham:     { id: "Lembar", en: "Shares" },
  reksa_dana:{ id: "Unit",   en: "Units"  },
  crypto:    { id: "Koin",   en: "Coins"  },
  deposito:  { id: "Akun",   en: "Account"},
  obligasi:  { id: "Lembar", en: "Sheets" },
  emas:      { id: "Gram",   en: "Grams"  },
  lainnya:   { id: "Unit",   en: "Units"  },
};

// Which types support live asset search
export const SEARCHABLE_TYPES = ["saham", "crypto", "obligasi"];

// Which types have fixed/manual entry (no live price search relevant)
export const MANUAL_TYPES = ["deposito", "emas", "reksa_dana", "lainnya"];

// Type-specific extra fields config
export const TYPE_EXTRA_FIELDS = {
  deposito: { tenor: true, interest_rate: true },
  emas:     { weight_grams: true },
};
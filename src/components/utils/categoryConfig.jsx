// Unified category configuration used across the app
export const DEFAULT_CATEGORIES = {
  expense: [
    { key: "housing", i18nKey: "cat_housing", emoji: "🏠", color: "#4F7CFF" },
    { key: "food", i18nKey: "cat_food", emoji: "🍔", color: "#00C9A7" },
    { key: "transport", i18nKey: "cat_transport", emoji: "🚗", color: "#F5A623" },
    { key: "health", i18nKey: "cat_health", emoji: "❤️", color: "#FF6B6B" },
    { key: "entertainment", i18nKey: "cat_entertainment", emoji: "🎬", color: "#9B59B6" },
    { key: "shopping", i18nKey: "cat_shopping", emoji: "🛍️", color: "#E91E8C" },
    { key: "subscriptions", i18nKey: "cat_subscriptions", emoji: "📱", color: "#1ABC9C" },
    { key: "other", i18nKey: "cat_other", emoji: "📦", color: "#95A5A6" },
  ],
  income: [
    { key: "salary", i18nKey: "cat_salary", emoji: "💼", color: "#27AE60" },
    { key: "freelance", i18nKey: "cat_freelance", emoji: "💻", color: "#2ECC71" },
    { key: "other", i18nKey: "cat_other", emoji: "📦", color: "#95A5A6" },
  ],
};

// Built-in subcategories for specific categories
export const BUILTIN_SUBCATEGORIES = {};

export const CATEGORY_KEYWORDS = {
  food: [
    "makan", "minum", "makanan", "minuman", "snack", "jajan", "kuliner",
    "nasi", "ayam", "mie", "mi", "bakso", "baso", "soto", "rendang", "sate", "satay",
    "martabak", "terang bulan", "gado-gado", "gadogado", "pecel", "lontong",
    "ketoprak", "batagor", "siomay", "cilok", "cimol", "cireng", "cuanki",
    "empek-empek", "pempek", "otak-otak", "seblak", "mie ayam", "mie goreng",
    "mie rebus", "mie kuah", "kwetiau", "bihun", "nasi goreng", "nasi uduk",
    "nasi padang", "nasi kuning", "nasi liwet", "nasi pecel", "nasi campur",
    "nasi bakar", "bubur ayam", "bubur", "ketupat", "opor", "rawon",
    "gulai", "tongseng", "semur", "garang asem", "pindang", "ikan bakar",
    "ayam geprek", "geprek", "ayam goreng", "ayam bakar", "bebek goreng",
    "bebek betutu", "pepes", "tempe", "tahu", "tofu", "gado",
    "rujak", "asinan", "kerupuk", "krupuk", "emping", "rempeyek",
    "lumpia", "risoles", "kroket", "lemper", "klepon", "onde-onde",
    "dadar gulung", "kue", "donat", "doughnut", "roti", "toast",
    "sandwich", "burger", "pizza", "pasta", "steak", "hotdog",
    "sushi", "ramen", "dimsum", "dim sum", "shabu", "bbq",
    "kopi", "coffee", "espresso", "latte", "cappuccino", "americano",
    "teh", "boba", "bubble tea", "thai tea", "susu", "milk",
    "jus", "juice", "smoothie", "minuman", "es teh", "es jeruk",
    "es campur", "es cendol", "cendol", "segar",
    "cafe", "kafe", "restoran", "warung", "warteg", "kedai", "depot",
    "kantin", "foodcourt", "food court", "gofood", "grabfood", "shopeefood",
    "shopee food", "traveloka food", "delivery", "ojek makan",
    "indomie", "indomaret", "alfamart", "superindo", "chiki", "chitato",
    "cheetos", "oreo", "wafer", "permen", "coklat", "chocolate",
    "ice cream", "es krim", "gelato", "pudding", "puding",
    "mcd", "mcdonalds", "kfc", "wendy", "burger king", "a&w", "j.co",
    "starbucks", "chatime", "tiger sugar", "koi", "janji jiwa", "kopi kenangan",
  ],
  transport: ["gojek", "grab", "taxi", "taksi", "ojek", "bensin", "bbm", "parkir", "tol", "busway", "mrt", "lrt", "kereta", "angkot", "bus", "commuter", "transjakarta", "maxim"],
  shopping: ["shopee", "tokopedia", "lazada", "baju", "sepatu", "tas", "pakaian", "fashion", "belanja"],
  health: ["dokter", "rumah sakit", "obat", "apotek", "klinik", "periksa", "gym", "fitness"],
  entertainment: ["bioskop", "film", "movie", "game", "konser", "tiket", "hiburan"],
  subscriptions: ["netflix", "spotify", "youtube premium", "icloud", "disney", "langganan"],
  housing: ["listrik", "air", "pdam", "wifi", "internet", "sewa", "kost", "kontrakan", "gas"],
  salary: ["gaji", "salary", "upah", "honor"],
  freelance: ["freelance", "proyek", "project", "fee"],
};
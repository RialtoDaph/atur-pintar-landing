import { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AppConfigContext = createContext();

export function AppConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      // Try session cache first to avoid hitting rate limit on every page load
      try {
        const cached = sessionStorage.getItem('app_config_cache');
        if (cached) {
          setConfig(JSON.parse(cached));
          setLoading(false);
          return;
        }
      } catch {}

      // Retry with exponential backoff on 429
      const fetchWithRetry = async (attempt = 0) => {
        try {
          const records = await base44.entities.AppConfig.list();
          const cfg = records?.[0] || getDefaults();
          try { sessionStorage.setItem('app_config_cache', JSON.stringify(cfg)); } catch {}
          setConfig(cfg);
        } catch (error) {
          if (error?.status === 429 && attempt < 3) {
            await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
            return fetchWithRetry(attempt + 1);
          }
          console.error('Error loading AppConfig:', error);
          setConfig(getDefaults());
        }
      };
      await fetchWithRetry();
      setLoading(false);
    }
    loadConfig();
  }, []);

  return (
    <AppConfigContext.Provider value={{ config, loading }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (!context) {
    return { config: getDefaults(), loading: false };
  }
  return context;
}

function getDefaults() {
  return {
    feature_split_bill: true,
    feature_shared_wallet: true,
    feature_investment: true,
    feature_nana_ai: true,
    feature_gamification: true,
    feature_waiting_list: false,
    maintenance_mode: false,
    premium_price_monthly: 49000,
    premium_price_yearly: 490000,
    app_name: 'Atur Pintar'
  };
}
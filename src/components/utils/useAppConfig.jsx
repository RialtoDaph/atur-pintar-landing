import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useAppConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const configs = await base44.entities.AppConfig.list();
      if (configs.length > 0) {
        setConfig(configs[0]);
      } else {
        // Create default config if none exists
        const newConfig = await base44.entities.AppConfig.create({
          feature_split_bill: true,
          feature_shared_wallet: true,
          feature_investment: true,
          feature_nana_ai: true,
          feature_gamification: true,
          feature_waiting_list: true,
          maintenance_mode: false,
          premium_price_monthly: 49000,
          premium_price_yearly: 490000,
          app_name: "Atur Pintar"
        });
        setConfig(newConfig);
      }
    } catch (error) {
      console.error('Error loading AppConfig:', error);
    }
    setLoading(false);
  }

  return { config, loading, refetch: loadConfig };
}
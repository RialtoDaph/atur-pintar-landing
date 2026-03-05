import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Search crypto assets via CoinGecko
async function searchCrypto(query) {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    
    if (!data.coins || data.coins.length === 0) return [];

    // Get top 5 results with price data
    const topCoins = data.coins.slice(0, 5);
    const ids = topCoins.map(c => c.id).join(',');
    
    const priceRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
    const priceData = await priceRes.json();

    return topCoins.map(coin => ({
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      id: coin.id,
      price: priceData[coin.id]?.usd || 0,
      priceFormatted: `$${(priceData[coin.id]?.usd || 0).toFixed(2)}`,
      change24h: priceData[coin.id]?.usd_24h_change || 0,
      type: 'crypto'
    }));
  } catch (e) {
    console.error('Crypto search error:', e);
    return [];
  }
}

// Search stocks via Finnhub
async function searchStocks(query) {
  try {
    const apiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!apiKey) {
      console.error('FINNHUB_API_KEY not set');
      return [];
    }

    const res = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${apiKey}`);
    const data = await res.json();

    if (!data.result || data.result.length === 0) return [];

    // Get top 5 results
    const topResults = data.result.slice(0, 5);
    
    // Fetch price data for each symbol
    const pricePromises = topResults.map(item =>
      fetch(`https://finnhub.io/api/v1/quote?symbol=${item.symbol}&token=${apiKey}`)
        .then(r => r.json())
        .catch(() => null)
    );

    const prices = await Promise.all(pricePromises);

    return topResults.map((item, idx) => {
      const priceData = prices[idx];
      return {
        name: item.description || item.symbol,
        symbol: item.symbol,
        price: priceData?.c || 0,
        priceFormatted: `$${(priceData?.c || 0).toFixed(2)}`,
        change24h: priceData?.d || 0,
        changePercent: priceData?.dp || 0,
        type: 'saham'
      };
    }).filter(s => s.price > 0);
  } catch (e) {
    console.error('Stock search error:', e);
    return [];
  }
}

// Search for mutual funds / Indonesian assets
async function searchMutualFunds(query) {
  // For now, return empty - in production, integrate with Indonesian financial APIs
  // like BNI Investasi, Mandiri Investasi, etc.
  return [];
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { query, type } = body;

    if (!query || query.trim().length < 1) {
      return Response.json({ results: [] });
    }

    let results = [];

    if (type === 'crypto') {
      results = await searchCrypto(query);
    } else if (type === 'saham' || type === 'obligasi') {
      results = await searchStocks(query);
    } else if (type === 'reksa_dana' || type === 'deposito') {
      // For mutual funds and bonds, try stock search as fallback
      results = await searchStocks(query);
    }

    return Response.json({ results: results.slice(0, 5) });
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ results: [], error: error.message }, { status: 500 });
  }
});
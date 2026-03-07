import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function getUsdToIdr() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await res.json();
    return data?.rates?.IDR || 16000;
  } catch (_) {
    return 16000;
  }
}

// Generate date points for a given period
function generateDatePoints(period) {
  const now = new Date();
  const points = [];
  
  let totalDays, intervalDays;
  if (period === '1M') { totalDays = 30; intervalDays = 1; }
  else if (period === '3M') { totalDays = 90; intervalDays = 4; }
  else if (period === '6M') { totalDays = 180; intervalDays = 7; }
  else { totalDays = 365; intervalDays = 14; }

  for (let d = totalDays; d >= 0; d -= intervalDays) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    points.push(date);
  }
  // Always include today
  if (points[points.length - 1].toDateString() !== now.toDateString()) {
    points.push(now);
  }
  return points;
}

function dateToStr(date) {
  return date.toISOString().split('T')[0];
}

// Fetch historical crypto price from CoinGecko (range endpoint)
async function getCryptoHistory(symbol, fromDate, toDate) {
  try {
    const coinId = symbol.toLowerCase();
    const from = Math.floor(fromDate.getTime() / 1000);
    const to = Math.floor(toDate.getTime() / 1000);
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=idr&from=${from}&to=${to}`
    );
    const data = await res.json();
    if (!data.prices || data.prices.length === 0) return null;
    // Returns array of [timestamp_ms, price]
    return data.prices;
  } catch (_) {
    return null;
  }
}

// Fetch historical stock price from Finnhub (candle endpoint)
async function getStockHistory(symbol, fromDate, toDate) {
  try {
    const apiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!apiKey) return null;
    const from = Math.floor(fromDate.getTime() / 1000);
    const to = Math.floor(toDate.getTime() / 1000);
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${apiKey}`
    );
    const data = await res.json();
    if (data.s !== 'ok' || !data.t) return null;
    // Returns parallel arrays: t (timestamps), c (close prices)
    const usdToIdr = await getUsdToIdr();
    return data.t.map((ts, i) => [ts * 1000, Math.round(data.c[i] * usdToIdr)]);
  } catch (_) {
    return null;
  }
}

// Fetch historical gold price from Yahoo Finance (GC=F)
async function getGoldHistory(fromDate, toDate) {
  try {
    const from = Math.floor(fromDate.getTime() / 1000);
    const to = Math.floor(toDate.getTime() / 1000);
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&period1=${from}&period2=${to}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;
    const timestamps = result.timestamp;
    const closes = result.indicators?.quote?.[0]?.close;
    if (!timestamps || !closes) return null;
    const usdToIdr = await getUsdToIdr();
    return timestamps.map((ts, i) => [ts * 1000, Math.round((closes[i] / 31.1035) * usdToIdr)]);
  } catch (_) {
    return null;
  }
}

// Find closest price in price array (sorted by timestamp) for a given target timestamp
function findClosestPrice(priceArray, targetTs) {
  if (!priceArray || priceArray.length === 0) return null;
  let closest = priceArray[0];
  let minDiff = Math.abs(priceArray[0][0] - targetTs);
  for (const point of priceArray) {
    const diff = Math.abs(point[0] - targetTs);
    if (diff < minDiff) {
      minDiff = diff;
      closest = point;
    }
  }
  return closest[1];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { period = '6M' } = body;

    // Load user investments
    const investments = await base44.entities.Investment.filter({ created_by: user.email });

    if (!investments || investments.length === 0) {
      return Response.json({ data: [] });
    }

    // Generate date points
    const datePoints = generateDatePoints(period);
    const fromDate = datePoints[0];
    const toDate = datePoints[datePoints.length - 1];

    // Group investments by type and symbol to minimize API calls
    // We'll fetch history for each investment separately
    const investmentHistories = await Promise.all(
      investments.map(async (inv) => {
        const type = inv.type;
        const symbol = inv.notes_symbol || inv.name; // try to get symbol from name
        const quantity = inv.quantity || 1;
        const initialAmount = inv.initial_amount || 0;
        const currentValue = inv.current_value || 0;

        let priceHistory = null;

        if (type === 'crypto') {
          // Map common names to CoinGecko IDs
          const coinMap = {
            'bitcoin': 'bitcoin', 'btc': 'bitcoin',
            'ethereum': 'ethereum', 'eth': 'ethereum',
            'solana': 'solana', 'sol': 'solana',
            'bnb': 'binancecoin', 'binance coin': 'binancecoin',
            'cardano': 'cardano', 'ada': 'cardano',
            'xrp': 'ripple', 'ripple': 'ripple',
            'dogecoin': 'dogecoin', 'doge': 'dogecoin',
            'polygon': 'matic-network', 'matic': 'matic-network',
          };
          const coinId = coinMap[symbol.toLowerCase()] || symbol.toLowerCase();
          priceHistory = await getCryptoHistory(coinId, fromDate, toDate);
        } else if (type === 'saham') {
          priceHistory = await getStockHistory(symbol.toUpperCase(), fromDate, toDate);
        } else if (type === 'emas') {
          priceHistory = await getGoldHistory(fromDate, toDate);
        }

        return { inv, priceHistory, quantity, initialAmount, currentValue, type };
      })
    );

    // For each date point, calculate total portfolio value
    const chartData = datePoints.map((date) => {
      const targetTs = date.getTime();
      const dateStr = dateToStr(date);
      let totalValue = 0;
      let hasRealData = false;

      for (const { inv, priceHistory, quantity, initialAmount, currentValue } of investmentHistories) {
        if (priceHistory && priceHistory.length > 0) {
          const price = findClosestPrice(priceHistory, targetTs);
          if (price !== null) {
            totalValue += price * quantity;
            hasRealData = true;
          } else {
            // Fallback: use current value proportionally
            totalValue += currentValue;
          }
        } else {
          // No price history available — use current value as fallback
          totalValue += currentValue;
        }
      }

      const label = period === '1M'
        ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        : date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });

      return {
        date: dateStr,
        value: Math.round(totalValue),
        label,
        hasRealData,
      };
    });

    return Response.json({ data: chartData });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
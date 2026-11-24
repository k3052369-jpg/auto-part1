const fs = require('fs');
const path = require('path');

const URL = 'https://open.er-api.com/v6/latest/USD';
const REFRESH_MS = 10 * 60 * 1000;
const CACHE_FILE = path.join(__dirname, 'usd-iqd-cache.json');

function readCache() {
  try {
    const cached = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    if (Number.isFinite(cached.rate) && cached.rate > 0 && typeof cached.updatedAt === 'string') {
      return cached;
    }
    console.warn('[rate] ignoring invalid cached USD/IQD rate');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('[rate] could not read USD/IQD cache:', error.message);
    }
  }
  return { rate: null, updatedAt: null };
}

let state = readCache();
let refreshPromise = null;

function getUsdToIqd() {
  return { ...state };
}

function usdToIqd(usd) {
  const amount = Number(usd);
  return Number.isFinite(amount) && state.rate ? amount * state.rate : null;
}

async function updateRate() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(URL, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const rate = data && data.result === 'success' && data.rates && data.rates.IQD;
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
      throw new Error('IQD rate missing or invalid in response');
    }

    state = { rate, updatedAt: new Date().toISOString() };
    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(state), 'utf8');
    } catch (error) {
      console.error('[rate] could not save USD/IQD cache:', error.message);
    }

    console.log(`[rate] 1 USD = ${rate} IQD (open.er-api.com)`);
  } catch (error) {
    console.error('[rate] fallback refresh failed:', error.message);
  } finally {
    clearTimeout(timeoutId);
  }

  return getUsdToIqd();
}

function refresh() {
  if (!refreshPromise) {
    refreshPromise = updateRate().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

refresh();
const refreshTimer = setInterval(refresh, REFRESH_MS);
if (typeof refreshTimer.unref === 'function') refreshTimer.unref();

module.exports = { getUsdToIqd, usdToIqd, refresh };

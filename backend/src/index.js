import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../../frontend/dist')));
}

// Cielo API - Get detailed token PnL (includes stats in response!)
async function getTokenPnl(wallet, sortBy = 'pnl_desc') {
  try {
    const input = JSON.stringify({
      json: {
        wallet,
        sortBy,
        page: '1',
        timeframe: 'max'
      }
    });

    const url = `https://app.cielo.finance/api/trpc/profile.fetchTokenPnlSlow?input=${encodeURIComponent(input)}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': 'https://app.cielo.finance/'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Cielo tokens error:', error.response?.status, error.message);
    return null;
  }
}

// Main wallet endpoint
app.get('/api/wallet/:address', async (req, res) => {
  const { address } = req.params;

  if (!address) {
    return res.status(400).json({ error: 'Wallet address required' });
  }

  try {
    console.log(`Fetching wallet: ${address}`);

    // Fetch token data from Cielo (includes stats!)
    const [winsData, lossesData] = await Promise.all([
      getTokenPnl(address, 'pnl_desc'),
      getTokenPnl(address, 'pnl_asc')
    ]);

    // Extract data from response - structure: result.data.json.data
    const winsJson = winsData?.result?.data?.json?.data;
    const lossesJson = lossesData?.result?.data?.json?.data;

    if (!winsJson && !lossesJson) {
      return res.status(404).json({ error: 'No trading data found for this wallet' });
    }

    // Stats come from the token response itself!
    const statsSource = winsJson || lossesJson;

    let data = {
      wallet: address,
      stats: {
        realizedPnlUsd: statsSource?.total_pnl_usd || 0,
        tokensTraded: statsSource?.total_tokens_traded || 0,
        winrate: statsSource?.winrate || 0,
        medianHoldTime: statsSource?.combined_median_hold_time || 0,
        totalVolume: statsSource?.total_volume_usd || 0
      },
      topWins: [],
      topLosses: [],
      bestTrade: null,
      worstTrade: null
    };

    // Extract tokens
    const topTokens = winsJson?.tokens || [];
    const bottomTokens = lossesJson?.tokens || [];

    data.topWins = topTokens.slice(0, 5);
    data.topLosses = bottomTokens.slice(0, 5);
    data.bestTrade = topTokens[0] || null;
    data.worstTrade = bottomTokens[0] || null;

    console.log(`Found ${topTokens.length} tokens, PnL: $${data.stats.realizedPnlUsd.toFixed(2)}, Winrate: ${data.stats.winrate.toFixed(1)}%`);

    res.json(data);
  } catch (error) {
    console.error('Wallet fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet data' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// SPA fallback - serve index.html for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../../frontend/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

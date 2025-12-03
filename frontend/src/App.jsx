import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

// Slide transition variants
const slideVariants = {
  enter: { opacity: 0, x: 100, scale: 0.95 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -100, scale: 0.95 }
};

// Hold time categories
function getHoldCategory(seconds) {
  if (!seconds || seconds <= 5) return { name: 'SPEED DEMON', emoji: '⚡', desc: 'In and out before the chart loads' };
  if (seconds <= 15) return { name: 'QUICK FLIPPER', emoji: '🔄', desc: 'Blink and you miss it' };
  if (seconds <= 30) return { name: 'PAPER HANDS', emoji: '📄', desc: 'Panic selling is an art form' };
  if (seconds <= 60) return { name: 'AVERAGE DEGEN', emoji: '🦧', desc: 'Standard trench warrior' };
  if (seconds <= 300) return { name: 'PATIENT APE', emoji: '🐵', desc: 'Actually reads the chart' };
  if (seconds <= 3600) return { name: 'DIAMOND HANDS', emoji: '💎', desc: 'Built different' };
  return { name: 'ROUND TRIPPER', emoji: '🎢', desc: 'Watched gains become losses' };
}

// Format helpers
const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('en-US').format(Math.round(num));
};

const formatPnl = (num) => {
  if (num === undefined || num === null) return '$0';
  const prefix = num >= 0 ? '+$' : '-$';
  const abs = Math.abs(num);
  if (abs >= 1000000) return prefix + (abs / 1000000).toFixed(2) + 'M';
  if (abs >= 1000) return prefix + (abs / 1000).toFixed(1) + 'K';
  return prefix + formatNumber(abs);
};

const formatHoldTime = (seconds) => {
  if (!seconds) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

function App() {
  const [wallet, setWallet] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [started, setStarted] = useState(false);

  const fetchWallet = async () => {
    if (!wallet.trim()) {
      setError('Enter a wallet address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/api/wallet/${wallet.trim()}`);
      setData(response.data);
      setCurrentSlide(0);
      setStarted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  const totalSlides = 8;
  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));
  const restart = () => {
    setStarted(false);
    setData(null);
    setCurrentSlide(0);
    setWallet('');
  };

  // Landing page
  if (!started) {
    return <LandingPage
      wallet={wallet}
      setWallet={setWallet}
      loading={loading}
      error={error}
      onSubmit={fetchWallet}
    />;
  }

  // Wrapped slideshow
  return (
    <div className="min-h-screen grid-bg flex flex-col">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-lime/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Slides */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4">
        <AnimatePresence mode="wait">
          {currentSlide === 0 && <IntroSlide key="intro" />}
          {currentSlide === 1 && <TotalCoinsSlide key="coins" data={data} />}
          {currentSlide === 2 && <TotalPnlSlide key="pnl" data={data} />}
          {currentSlide === 3 && <WinrateSlide key="winrate" data={data} />}
          {currentSlide === 4 && <HoldTimeSlide key="hold" data={data} />}
          {currentSlide === 5 && <BestTradeSlide key="best" data={data} />}
          {currentSlide === 6 && <WorstTradeSlide key="worst" data={data} />}
          {currentSlide === 7 && <SummarySlide key="summary" data={data} onRestart={restart} />}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <SlideControls
        current={currentSlide}
        total={totalSlides}
        onPrev={prevSlide}
        onNext={nextSlide}
        onRestart={restart}
      />
    </div>
  );
}

// ============ LANDING PAGE ============
function LandingPage({ wallet, setWallet, loading, error, onSubmit }) {
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-lime/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-neon-mint/5 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl mx-auto text-center px-4"
      >
        <motion.h1
          className="text-5xl md:text-7xl font-bold font-display mb-2"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <span className="bg-gradient-to-r from-neon-green via-neon-lime to-neon-mint bg-clip-text text-transparent">
            PUMP FUN
          </span>
        </motion.h1>
        <h2 className="text-4xl md:text-6xl font-bold font-display text-white/90 mb-6">
          WRAPPED
        </h2>

        <p className="text-white/60 text-lg mb-12 font-mono">
          Your degen year. Pumped. Dumped. Exposed.
        </p>

        <div className="glass rounded-2xl p-8 gradient-border">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
              placeholder="Enter your Solana wallet address"
              className="flex-1 bg-dark-700 border border-neon-green/20 rounded-xl px-6 py-4 text-white placeholder-white/30 font-mono text-sm focus:outline-none focus:border-neon-green/50 transition-all"
            />
            <button
              onClick={onSubmit}
              disabled={loading}
              className="btn-glow bg-gradient-to-r from-neon-green to-neon-lime px-8 py-4 rounded-xl font-semibold text-dark-900 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                'Get Wrapped'
              )}
            </button>
          </div>

          {error && (
            <p className="text-neon-red mt-4 font-mono text-sm">{error}</p>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-6 mt-12">
          {[
            { icon: '📈', label: 'PnL Analysis' },
            { icon: '🚀', label: 'Best Pumps' },
            { icon: '📉', label: 'Worst Dumps' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-white/50 text-sm font-mono">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ============ SLIDES ============

function IntroSlide() {
  return (
    <motion.div
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.h1
        className="text-5xl md:text-7xl font-bold font-display text-white mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Life moves fast
      </motion.h1>
      <motion.p
        className="text-2xl md:text-3xl text-neon-green font-mono"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        Luckily, we took notes.
      </motion.p>
    </motion.div>
  );
}

function TotalCoinsSlide({ data }) {
  const coins = data?.stats?.tokensTraded || 0;

  return (
    <motion.div
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.p
        className="text-xl md:text-2xl text-white/60 font-mono mb-4"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        This year, you aped into
      </motion.p>

      <motion.h1
        className="text-7xl md:text-[10rem] font-bold font-display mb-4 leading-none"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{
          opacity: 1,
          scale: [0.3, 1.2, 0.95, 1.05, 1],
        }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <span className="bg-gradient-to-r from-neon-green to-neon-lime bg-clip-text text-transparent">
          {formatNumber(coins)}
        </span>
      </motion.h1>

      <motion.p
        className="text-3xl md:text-4xl text-white font-display"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        different coins
      </motion.p>

      <motion.p
        className="text-lg text-white/40 font-mono mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        {coins > 500 ? "You're a certified degen." : coins > 100 ? "That's a lot of aping." : "Quality over quantity, right?"}
      </motion.p>
    </motion.div>
  );
}

function TotalPnlSlide({ data }) {
  const pnl = data?.stats?.realizedPnlUsd || 0;
  const isPositive = pnl >= 0;

  return (
    <motion.div
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.p
        className="text-xl md:text-2xl text-white/60 font-mono mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Your total realized PnL was
      </motion.p>

      <motion.h1
        className="text-5xl md:text-8xl font-bold font-mono mb-6"
        initial={{ opacity: 0, scale: 0.3, y: 20 }}
        animate={{
          opacity: 1,
          scale: [0.3, 1.4, 0.9, 1.15, 1],
          x: [0, -12, 12, -6, 0],
          y: 0
        }}
        transition={{ delay: 0.5, duration: 1.2 }}
      >
        <span className={isPositive ? 'text-neon-green' : 'text-neon-red'}>
          {formatPnl(pnl)}
        </span>
      </motion.h1>

      <motion.p
        className="text-xl text-white/50 font-mono mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        {isPositive
          ? pnl > 50000 ? "You're actually printing. Legendary."
          : pnl > 10000 ? "Nice gains, degen."
          : "Every win counts."
          : pnl < -50000 ? "The trenches took everything."
          : pnl < -10000 ? "Expensive lessons learned."
          : "Just tuition fees, right?"
        }
      </motion.p>
    </motion.div>
  );
}

function WinrateSlide({ data }) {
  const winrate = data?.stats?.winrate || 0;

  return (
    <motion.div
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.p
        className="text-xl md:text-2xl text-white/60 font-mono mb-6"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        With a win rate of
      </motion.p>

      <motion.h1
        className="text-7xl md:text-[10rem] font-bold font-display mb-4 leading-none"
        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
      >
        <span className={winrate >= 50 ? 'text-neon-green' : 'text-neon-red'}>
          {winrate.toFixed(1)}%
        </span>
      </motion.h1>

      <motion.p
        className="text-xl text-white/50 font-mono mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        {winrate >= 60
          ? "You actually know what you're doing."
          : winrate >= 50
          ? "Breaking even-ish. Not bad."
          : winrate >= 40
          ? "The house edge is real."
          : "Consistency is key... just not this kind."
        }
      </motion.p>
    </motion.div>
  );
}

function HoldTimeSlide({ data }) {
  const holdTime = data?.stats?.medianHoldTime || 0;
  const category = getHoldCategory(holdTime);

  return (
    <motion.div
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.p
        className="text-lg md:text-xl text-white/60 font-mono mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Your median hold time was
      </motion.p>

      <motion.h2
        className="text-4xl md:text-6xl font-bold font-mono text-neon-green mb-10"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        {formatHoldTime(holdTime)}
      </motion.h2>

      <motion.p
        className="text-lg text-white/60 font-mono mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        That makes you a
      </motion.p>

      <motion.div
        className="inline-block"
        initial={{ opacity: 0, scale: 0.3, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 150, damping: 12 }}
      >
        <span className="text-7xl md:text-8xl mb-4 block">{category.emoji}</span>
        <span className="text-3xl md:text-5xl font-bold font-display bg-gradient-to-r from-neon-green via-neon-lime to-neon-mint bg-clip-text text-transparent block mb-4">
          {category.name}
        </span>
        <span className="text-white/40 font-mono text-lg">{category.desc}</span>
      </motion.div>
    </motion.div>
  );
}

function BestTradeSlide({ data }) {
  const trade = data?.bestTrade || data?.topWins?.[0];
  if (!trade) return <EmptySlide message="No winning trades found" />;

  const symbol = trade.token_symbol || trade.symbol || 'Unknown';
  const name = trade.token_name || symbol;
  const pnl = trade.total_pnl_usd || trade.pnl || 0;
  const tokenAddress = trade.token_address;

  return (
    <motion.div
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.p
        className="text-lg md:text-xl text-white/60 font-mono mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Your best trade was
      </motion.p>

      {tokenAddress && (
        <motion.div
          className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-green/20 to-neon-lime/20 border-4 border-neon-green/40 overflow-hidden flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <img
            src={`https://logos.cielo.finance/solana/${tokenAddress}.webp`}
            alt={symbol}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<span class="text-5xl">🚀</span>';
            }}
          />
        </motion.div>
      )}

      <motion.h1
        className="text-4xl md:text-6xl font-bold font-display text-white mb-2"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        ${symbol}
      </motion.h1>

      <motion.p
        className="text-base text-white/40 font-mono mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {name !== symbol ? name : ''}
      </motion.p>

      <motion.p
        className="text-lg text-white/60 font-mono mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        with a PnL of
      </motion.p>

      <motion.h2
        className="text-5xl md:text-7xl font-bold font-mono text-neon-green"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: [0.5, 1.3, 1] }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {formatPnl(pnl)}
      </motion.h2>
    </motion.div>
  );
}

function WorstTradeSlide({ data }) {
  const trade = data?.worstTrade || data?.topLosses?.[0];
  if (!trade) return <EmptySlide message="No losing trades found (lucky you)" />;

  const symbol = trade.token_symbol || trade.symbol || 'Unknown';
  const name = trade.token_name || symbol;
  const pnl = trade.total_pnl_usd || trade.pnl || 0;
  const tokenAddress = trade.token_address;

  return (
    <motion.div
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.p
        className="text-lg md:text-xl text-white/60 font-mono mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Your worst trade was
      </motion.p>

      {tokenAddress && (
        <motion.div
          className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-red/20 to-neon-pink/20 border-4 border-neon-red/40 overflow-hidden flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <img
            src={`https://logos.cielo.finance/solana/${tokenAddress}.webp`}
            alt={symbol}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<span class="text-5xl">💀</span>';
            }}
          />
        </motion.div>
      )}

      <motion.h1
        className="text-4xl md:text-6xl font-bold font-display text-white mb-2"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        ${symbol}
      </motion.h1>

      <motion.p
        className="text-base text-white/40 font-mono mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {name !== symbol ? name : ''}
      </motion.p>

      <motion.p
        className="text-lg text-white/60 font-mono mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        with a PnL of
      </motion.p>

      <motion.h2
        className="text-5xl md:text-7xl font-bold font-mono text-neon-red"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: [0.5, 1.3, 1] }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {formatPnl(pnl)}
      </motion.h2>

      <motion.p
        className="text-lg text-white/40 font-mono mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        We don't talk about this one.
      </motion.p>
    </motion.div>
  );
}

function SummarySlide({ data, onRestart }) {
  const stats = data?.stats || {};
  const topWins = data?.topWins || [];

  return (
    <motion.div
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.5 }}
      className="text-center max-w-2xl mx-auto w-full px-4"
    >
      <motion.h1
        className="text-3xl md:text-5xl font-bold font-display mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="bg-gradient-to-r from-neon-green to-neon-lime bg-clip-text text-transparent">
          Your 2025 Wrapped
        </span>
      </motion.h1>

      <motion.div
        className="glass rounded-2xl p-6 gradient-border mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="p-3">
            <p className="text-white/50 text-xs font-mono mb-1">Total PnL</p>
            <p className={`text-xl md:text-2xl font-bold font-mono ${stats.realizedPnlUsd >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
              {formatPnl(stats.realizedPnlUsd)}
            </p>
          </div>
          <div className="p-3">
            <p className="text-white/50 text-xs font-mono mb-1">Tokens Traded</p>
            <p className="text-xl md:text-2xl font-bold font-mono text-white">{formatNumber(stats.tokensTraded)}</p>
          </div>
          <div className="p-3">
            <p className="text-white/50 text-xs font-mono mb-1">Win Rate</p>
            <p className="text-xl md:text-2xl font-bold font-mono text-white">{(stats.winrate || 0).toFixed(1)}%</p>
          </div>
          <div className="p-3">
            <p className="text-white/50 text-xs font-mono mb-1">Median Hold</p>
            <p className="text-xl md:text-2xl font-bold font-mono text-white">{formatHoldTime(stats.medianHoldTime)}</p>
          </div>
        </div>
      </motion.div>

      {topWins.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="text-lg font-bold text-white/80 mb-3 font-display">Top Pumps</h3>
          <div className="space-y-2">
            {topWins.slice(0, 3).map((trade, i) => (
              <motion.div
                key={i}
                className="glass rounded-xl p-3 flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-neon-green/60 font-mono text-sm">#{i + 1}</span>
                  <span className="text-white font-mono">${trade.token_symbol || trade.symbol}</span>
                </div>
                <span className="text-neon-green font-mono font-bold">{formatPnl(trade.total_pnl_usd || trade.pnl)}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.button
        onClick={onRestart}
        className="btn-glow bg-gradient-to-r from-neon-green to-neon-lime px-8 py-4 rounded-xl font-semibold text-dark-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Check Another Wallet
      </motion.button>

      <motion.p
        className="text-white/30 font-mono text-xs mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Data powered by Cielo Finance
      </motion.p>
    </motion.div>
  );
}

function EmptySlide({ message }) {
  return (
    <motion.div
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="text-center"
    >
      <p className="text-2xl text-white/40 font-mono">{message}</p>
    </motion.div>
  );
}

// ============ NAVIGATION ============
function SlideControls({ current, total, onPrev, onNext, onRestart }) {
  const hasPrev = current > 0;
  const hasNext = current < total - 1;

  return (
    <motion.div
      className="relative z-10 flex justify-center py-6 md:py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="glass rounded-full px-3 md:px-4 py-2 flex items-center gap-2 md:gap-4 border border-neon-green/20">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className={`px-3 md:px-4 py-2 rounded-full font-mono text-xs md:text-sm transition-all ${
            hasPrev
              ? 'bg-dark-600 text-white hover:bg-dark-700'
              : 'bg-dark-700/50 text-white/30 cursor-not-allowed'
          }`}
        >
          ← Prev
        </button>

        <div className="flex items-center gap-1 px-2">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? 'bg-neon-green w-4' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <button
          onClick={hasNext ? onNext : onRestart}
          className="px-3 md:px-4 py-2 rounded-full font-mono text-xs md:text-sm bg-neon-green/20 text-neon-green hover:bg-neon-green/30 transition-all"
        >
          {hasNext ? 'Next →' : 'Done'}
        </button>
      </div>
    </motion.div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { publicAPI } from '../../services/api';

const CryptoRates = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRates = async () => {
    try {
      const data = await publicAPI.getCryptoRates();
      setRates(data?.data || data || []);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError('Failed to fetch rates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price, isINR = true) => {
    if (price >= 1000) {
      return isINR ? `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
    return isINR ? `₹${price.toFixed(2)}` : `$${price.toFixed(4)}`;
  };

  const formatChange = (change) => {
    if (change === undefined || change === null) return '0.00%';
    const prefix = change >= 0 ? '+' : '';
    return `${prefix}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change) => {
    if (change === undefined || change === null) return 'text-gray-400';
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getCoinName = (id) => {
    const names = {
      'bitcoin': 'Bitcoin',
      'ethereum': 'Ethereum',
      'tether': 'Tether (USDT)',
      'binancecoin': 'BNB',
      'solana': 'Solana',
      'ripple': 'XRP',
      'dogecoin': 'Dogecoin',
      'cardano': 'Cardano',
      'polkadot': 'Polkadot',
      'avalanche-2': 'Avalanche',
      'chainlink': 'Chainlink',
      'polygon': 'Polygon'
    };
    return names[id] || id.charAt(0).toUpperCase() + id.slice(1);
  };

  const getCoinIcon = (id) => {
    const icons = {
      'bitcoin': '₿',
      'ethereum': 'Ξ',
      'tether': '₮',
      'binancecoin': 'B',
      'solana': 'S',
      'ripple': 'X',
      'dogecoin': 'D',
      'cardano': 'A',
      'polkadot': '●',
      'avalanche-2': 'A',
      'chainlink': '⬡',
      'polygon': 'M'
    };
    return icons[id] || id.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Live Crypto Prices</h1>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Auto-refresh every 30s</p>
            {lastUpdated && (
              <p className="text-gray-500 text-xs">
                Updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl mb-4">
            {error}
          </div>
        )}

        {loading && rates.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
          </div>
        ) : (
          <div className="grid gap-3">
            {rates.map((coin) => (
              <div
                key={coin.id}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl p-4 border border-[#2a2a2a] hover:border-[#D4AF37] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-xl">
                      {getCoinIcon(coin.id)}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{getCoinName(coin.id)}</h3>
                      <p className="text-gray-500 text-sm uppercase">{coin.id}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{formatPrice(coin.inr)}</p>
                    <p className="text-gray-400 text-sm">{formatPrice(coin.usd, false)}</p>
                  </div>

                  <div className={`text-right ${getChangeColor(coin.inr_24h_change)}`}>
                    <p className="font-bold">{formatChange(coin.inr_24h_change)}</p>
                    <p className="text-xs">24h</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={fetchRates}
          className="mt-6 w-full py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#C9A227] transition-colors"
        >
          Refresh Prices
        </button>
      </div>
    </div>
  );
};

export default CryptoRates;

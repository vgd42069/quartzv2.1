import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Sparkles, Clock, AlertCircle, MessageCircle, Heart, Send, CornerDownRight } from 'lucide-react';

const App = () => {
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(true);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('trending'); // trending, volume, odds, social
  const [generatedImages, setGeneratedImages] = useState({}); // Store generated images by market ID
  const [imageLoading, setImageLoading] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  // Mock comment data - in production this would come from a backend/database
  const getCommentsForMarket = (marketId) => {
    const mockComments = {
      'demo-1': [
        {
          id: 1,
          user: 'CryptoWhale',
          avatar: '🐋',
          text: 'BTC hitting 120k seems very likely with institutional adoption accelerating. ETFs are eating up supply.',
          timestamp: '2 hours ago',
          likes: 47,
          liked: false,
          replies: [
            {
              id: 2,
              user: 'BearMarket2024',
              avatar: '🐻',
              text: 'Disagree. We\'re seeing distribution patterns from whales. This rally is running out of steam.',
              timestamp: '1 hour ago',
              likes: 23,
              liked: false
            }
          ]
        },
        {
          id: 3,
          user: 'MacroTrader',
          avatar: '📊',
          text: 'Everything depends on Fed policy. If they cut rates aggressively, we could see 150k+',
          timestamp: '3 hours ago',
          likes: 65,
          liked: false,
          replies: []
        }
      ],
      'demo-2': [
        {
          id: 4,
          user: 'PoliticsWatcher',
          avatar: '🗳️',
          text: 'This is clearly a meme bet, but the 8% is interesting. Shows some contrarian thinking.',
          timestamp: '5 hours ago',
          likes: 12,
          liked: false,
          replies: []
        }
      ],
      'demo-3': [
        {
          id: 5,
          user: 'EconNerd',
          avatar: '📈',
          text: 'CPI is cooling, unemployment ticking up. Fed has room to cut. 67% seems about right.',
          timestamp: '1 hour ago',
          likes: 89,
          liked: false,
          replies: [
            {
              id: 6,
              user: 'InflationHawk',
              avatar: '🦅',
              text: 'Powell literally said "higher for longer" last week. Market is too optimistic.',
              timestamp: '45 min ago',
              likes: 34,
              liked: false
            },
            {
              id: 7,
              user: 'EconNerd',
              avatar: '📈',
              text: '@InflationHawk Actions speak louder than words. Watch the dots plot.',
              timestamp: '30 min ago',
              likes: 21,
              liked: false
            }
          ]
        }
      ],
      'demo-4': [
        {
          id: 8,
          user: 'AIResearcher',
          avatar: '🤖',
          text: 'AGI timeline is highly uncertain. 23% seems reasonable given current rate of progress.',
          timestamp: '6 hours ago',
          likes: 156,
          liked: false,
          replies: [
            {
              id: 9,
              user: 'TechOptimist',
              avatar: '🚀',
              text: 'You\'re underestimating scaling laws. We\'re closer than people think.',
              timestamp: '5 hours ago',
              likes: 78,
              liked: false
            }
          ]
        }
      ]
    };
    
    return mockComments[marketId] || [];
  };

  // Fetch Polymarket data from Gamma API
  const fetchMarkets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching markets from Polymarket...');
      
      const response = await fetch('https://gamma-api.polymarket.com/markets', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received markets:', data.length);
      
      // Filter and sort by volume24hr
      const activeMarkets = data
        .filter(m => m.active === true && m.closed === false && m.archived === false)
        .sort((a, b) => parseFloat(b.volume24hr || 0) - parseFloat(a.volume24hr || 0))
        .slice(0, 15);
      
      console.log('Active markets after filtering:', activeMarkets.length);
      
      if (activeMarkets.length === 0) {
        throw new Error('No active markets found');
      }
      
      setMarkets(activeMarkets);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching markets:', err);
      setError(`⚠️ Live API unavailable (${err.message}). Showing demo markets - the analysis feature still works!`);
      loadDemoData();
      setLoading(false);
    }
  };

  // Demo data fallback
  const loadDemoData = () => {
    const demoMarkets = [
      {
        conditionId: 'demo-1',
        question: 'Will Bitcoin reach $120,000 before March 2026?',
        outcomePrices: ['0.52', '0.48'],
        volume24hr: '2340000',
        liquidity: '450000',
        endDate: '2026-03-01T00:00:00Z',
        active: true,
        closed: false,
        archived: false
      },
      {
        conditionId: 'demo-2',
        question: 'Will Donald Trump win the 2026 Nobel Peace Prize?',
        outcomePrices: ['0.08', '0.92'],
        volume24hr: '890000',
        liquidity: '120000',
        endDate: '2026-10-15T00:00:00Z',
        active: true,
        closed: false,
        archived: false
      },
      {
        conditionId: 'demo-3',
        question: 'Will the Fed cut interest rates in March 2026?',
        outcomePrices: ['0.67', '0.33'],
        volume24hr: '1560000',
        liquidity: '380000',
        endDate: '2026-03-20T00:00:00Z',
        active: true,
        closed: false,
        archived: false
      },
      {
        conditionId: 'demo-4',
        question: 'Will AI companies announce a major breakthrough in AGI before June 2026?',
        outcomePrices: ['0.23', '0.77'],
        volume24hr: '3120000',
        liquidity: '670000',
        endDate: '2026-06-01T00:00:00Z',
        active: true,
        closed: false,
        archived: false
      },
      {
        conditionId: 'demo-5',
        question: 'Will the S&P 500 exceed 7,000 by end of Q1 2026?',
        outcomePrices: ['0.71', '0.29'],
        volume24hr: '1890000',
        liquidity: '520000',
        endDate: '2026-03-31T23:59:59Z',
        active: true,
        closed: false,
        archived: false
      },
      {
        conditionId: 'demo-6',
        question: 'Will Apple launch a VR/AR product in 2026?',
        outcomePrices: ['0.44', '0.56'],
        volume24hr: '765000',
        liquidity: '210000',
        endDate: '2026-12-31T23:59:59Z',
        active: true,
        closed: false,
        archived: false
      },
      {
        conditionId: 'demo-7',
        question: 'Will unemployment rate exceed 5% by July 2026?',
        outcomePrices: ['0.31', '0.69'],
        volume24hr: '1234000',
        liquidity: '290000',
        endDate: '2026-07-31T23:59:59Z',
        active: true,
        closed: false,
        archived: false
      },
      {
        conditionId: 'demo-8',
        question: 'Will SpaceX successfully land humans on Mars before 2027?',
        outcomePrices: ['0.12', '0.88'],
        volume24hr: '987000',
        liquidity: '180000',
        endDate: '2026-12-31T23:59:59Z',
        active: true,
        closed: false,
        archived: false
      }
    ];
    
    setMarkets(demoMarkets);
    setLastUpdate(new Date());
  };

  // Generate AI narrative with macro/micro "why" analysis
  const generateNarrative = async (market) => {
    setNarrativeLoading(true);
    setSelectedMarket(market);
    
    // Generate image for this market if not already generated
    if (!generatedImages[market.conditionId]) {
      generateMarketImage(market);
    }
    
    setTimeout(() => {
      const yesProb = parseFloat(market.outcomePrices?.[0] || 0.5) * 100;
      const noProb = 100 - yesProb;
      const volume24h = parseFloat(market.volume24hr || 0);
      const liquidity = parseFloat(market.liquidity || 0);
      const daysUntilEnd = Math.ceil((new Date(market.endDate) - new Date()) / (1000 * 60 * 60 * 24));
      
      let analysis = '';
      
      // CONDENSED MARKET SNAPSHOT
      analysis += `**Market Snapshot:** ${yesProb.toFixed(1)}% YES / ${noProb.toFixed(1)}% NO`;
      analysis += ` • $${volume24h > 1000000 ? (volume24h / 1000000).toFixed(1) + 'M' : (volume24h / 1000).toFixed(0) + 'K'} 24h vol`;
      analysis += ` • ${daysUntilEnd} day${daysUntilEnd !== 1 ? 's' : ''} to resolution\n\n`;
      
      // MACRO NARRATIVE - The broader context
      analysis += `**The Macro View:**\n`;
      
      const question = market.question.toLowerCase();
      
      if (question.includes('bitcoin') || question.includes('crypto') || question.includes('btc')) {
        if (yesProb > 60) {
          analysis += `The crypto market is showing renewed institutional confidence. With Bitcoin ETFs drawing record inflows and major corporations adding BTC to balance sheets, traders are pricing in continued momentum. The Fed's monetary policy stance and global liquidity conditions remain the dominant macro drivers.`;
        } else if (yesProb > 40) {
          analysis += `Bitcoin sits between competing forces: institutional adoption versus regulatory uncertainty. Traders hedge between the "digital gold" narrative and concerns about monetary tightening dampening risk appetite across all asset classes.`;
        } else {
          analysis += `Market sentiment reflects skepticism about near-term crypto rallies. Regulatory headwinds, macro uncertainty, and profit-taking after recent gains weigh on conviction. Traders await clearer catalysts before repositioning.`;
        }
      } else if (question.includes('fed') || question.includes('interest rate') || question.includes('rate cut')) {
        if (yesProb > 60) {
          analysis += `Economic data signals the Fed has room to ease. Traders read recent inflation trends, employment figures, and Fed commentary as greenlight for rate cuts. The narrative: monetary policy pivoting from restrictive to accommodative as inflation pressures subside.`;
        } else {
          analysis += `The market bets on Fed patience despite cooling inflation. The central bank's "higher for longer" messaging and concerns about re-accelerating inflation keep rate cut expectations in check. Traders price in a cautious Fed that won't rush to ease.`;
        }
      } else if (question.includes('s&p') || question.includes('stock') || question.includes('market') || question.includes('500')) {
        if (yesProb > 60) {
          analysis += `Equity markets ride a wave of optimism. Strong corporate earnings, AI-driven productivity narratives, and expectations of economic resilience support elevated valuations. Traders bet that markets can sustain premium multiples despite macro uncertainties.`;
        } else {
          analysis += `Caution creeps into equity markets. Concerns about stretched valuations, geopolitical risks, or economic slowdown temper bullish sentiment. The market prices in the possibility that current levels are unsustainable without stronger fundamental support.`;
        }
      } else if (question.includes('ai') || question.includes('agi') || question.includes('chatgpt') || question.includes('breakthrough')) {
        if (yesProb > 40) {
          analysis += `The AI arms race accelerates. With major labs burning billions on compute and talent, traders believe we're approaching capability inflection points. The narrative: competition breeds innovation, and someone will achieve a breakthrough sooner rather than later.`;
        } else {
          analysis += `Despite hype cycles, traders are skeptical of near-term AGI breakthroughs. The gap between current narrow AI and true artificial general intelligence remains vast. The market prices in reality that fundamental research takes time, regardless of capital deployed.`;
        }
      } else if (question.includes('trump') || question.includes('election') || question.includes('political')) {
        analysis += `Political prediction markets are uniquely sentiment-driven. Traders weigh polling data, campaign momentum, economic conditions, and historical precedents. The macro context includes voter sentiment on economy, geopolitical stability, and cultural issues shaping electoral outcomes.`;
      } else if (question.includes('unemployment') || question.includes('jobs') || question.includes('employment')) {
        if (yesProb > 50) {
          analysis += `Labor market softness emerges in the data. Leading indicators like jobless claims, job openings, and hiring plans signal potential weakness ahead. Traders connect this to broader economic deceleration and implications for both monetary policy and consumer spending.`;
        } else {
          analysis += `The jobs market shows resilience. Despite rate hikes and recession fears, employment remains robust. Traders see this strength reflecting fundamental economic health, though it also keeps pressure on the Fed to maintain restrictive policy longer.`;
        }
      } else if (question.includes('apple') || question.includes('tesla') || question.includes('spacex') || question.includes('tech')) {
        analysis += `Tech sector dynamics reflect broader innovation cycles and market appetite for growth stories. Traders balance enthusiasm for breakthrough products against execution risks, regulatory pressures, and competitive threats. Individual company outcomes tie to both sector-wide trends and company-specific catalysts.`;
      } else {
        if (yesProb > 65) {
          analysis += `Strong consensus forms around this outcome. Traders interpret recent signals and trends as pointing decisively in one direction. The market prices in high confidence based on visible catalysts and momentum.`;
        } else if (yesProb > 50) {
          analysis += `Traders see slightly higher probability of this outcome, but meaningful uncertainty remains. Multiple scenarios are plausible depending on how key variables evolve in coming weeks.`;
        } else if (yesProb > 35) {
          analysis += `The market leans against this outcome while acknowledging it remains possible. Traders weigh contrary evidence and see the balance of probabilities tilt in the other direction.`;
        } else {
          analysis += `Strong skepticism dominates. Current trajectories, available evidence, and historical patterns suggest this outcome is unlikely. Traders would need significant unexpected developments to shift their view.`;
        }
      }
      
      analysis += `\n\n**The Micro View:**\n`;
      
      // MICRO NARRATIVE - Specific market dynamics and the "why"
      if (volume24h > 1000000) {
        analysis += `High trading volume ($${(volume24h / 1000000).toFixed(1)}M) signals active price discovery. Smart money is positioning, conviction levels are strong enough to move significant capital. `;
      } else if (volume24h > 100000) {
        analysis += `Moderate volume suggests engaged traders but not mainstream attention. `;
      } else {
        analysis += `Low volume indicates this remains niche. `;
      }
      
      if (yesProb >= 45 && yesProb <= 55) {
        analysis += `The near 50-50 split reveals information asymmetry: different traders access or weight different signals differently. Each new data point could swing sentiment. This is where alpha lives—in resolving uncertainty before the broader market does.`;
      } else if (yesProb >= 70 || yesProb <= 30) {
        analysis += `The pronounced odds reflect information consensus. Most traders converged on the same interpretation of available data. For contrarians, this creates opportunity if consensus is wrong—but bucking the crowd requires strong conviction in differentiated analysis.`;
      } else {
        analysis += `The modest lean suggests informed disagreement. Bulls and bears both have rational cases, creating a tug-of-war in the order book. Watch for catalysts that could shift the balance decisively.`;
      }
      
      if (liquidity > 500000) {
        analysis += ` Deep liquidity ($${(liquidity / 1000).toFixed(0)}K) means institutional-grade market structure—positions can be sized meaningfully.`;
      } else if (liquidity > 50000) {
        analysis += ` Decent liquidity allows tactical positioning, though large trades would move the market.`;
      } else {
        analysis += ` Thin liquidity means price discovery is vulnerable to single large trades.`;
      }
      
      if (daysUntilEnd <= 7) {
        analysis += ` With only ${daysUntilEnd} day${daysUntilEnd !== 1 ? 's' : ''} left, uncertainty collapses toward binary resolution. Late information could cause sharp moves, creating both risk and opportunity for nimble traders.`;
      } else if (daysUntilEnd <= 30) {
        analysis += ` The ${daysUntilEnd}-day window means probabilities can still shift as events unfold, but time decay begins to matter for portfolio managers.`;
      } else {
        analysis += ` With ${daysUntilEnd} days until resolution, this is a macro bet on trends rather than near-term events. Patient capital has time to be proven right.`;
      }
      
      setNarrative(analysis);
      setNarrativeLoading(false);
    }, 800);
  };

  // Auto-refresh every 60 seconds
  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get filtered/sorted markets based on active filter
  const getFilteredMarkets = () => {
    if (!markets || markets.length === 0) return [];
    
    let filtered = [...markets];
    
    switch (activeFilter) {
      case 'trending':
        // Trending = combination of recent volume and moderate odds (controversial/active)
        filtered = filtered
          .sort((a, b) => {
            const aVolume = parseFloat(a.volume24hr || 0);
            const bVolume = parseFloat(b.volume24hr || 0);
            const aProb = parseFloat(a.outcomePrices?.[0] || 0.5);
            const bProb = parseFloat(b.outcomePrices?.[0] || 0.5);
            
            // Controversial score: closer to 0.5 = more controversial
            const aControversy = 1 - Math.abs(aProb - 0.5) * 2;
            const bControversy = 1 - Math.abs(bProb - 0.5) * 2;
            
            // Trending score = volume * controversy
            const aTrending = aVolume * (0.7 + aControversy * 0.3);
            const bTrending = bVolume * (0.7 + bControversy * 0.3);
            
            return bTrending - aTrending;
          });
        break;
        
      case 'volume':
        // High volume = pure volume sort
        filtered = filtered
          .sort((a, b) => parseFloat(b.volume24hr || 0) - parseFloat(a.volume24hr || 0));
        break;
        
      case 'social':
        // Social engagement = sort by comment count and engagement
        filtered = filtered
          .sort((a, b) => {
            const aComments = getCommentsForMarket(a.conditionId);
            const bComments = getCommentsForMarket(b.conditionId);
            
            // Calculate engagement score
            const aCount = aComments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
            const bCount = bComments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
            
            // Calculate total likes
            const aLikes = aComments.reduce((acc, c) => {
              const mainLikes = c.likes || 0;
              const replyLikes = (c.replies || []).reduce((racc, r) => racc + (r.likes || 0), 0);
              return acc + mainLikes + replyLikes;
            }, 0);
            const bLikes = bComments.reduce((acc, c) => {
              const mainLikes = c.likes || 0;
              const replyLikes = (c.replies || []).reduce((racc, r) => racc + (r.likes || 0), 0);
              return acc + mainLikes + replyLikes;
            }, 0);
            
            // Engagement score = comments * 10 + likes
            const aEngagement = aCount * 10 + aLikes;
            const bEngagement = bCount * 10 + bLikes;
            
            return bEngagement - aEngagement;
          })
          .filter(m => getCommentsForMarket(m.conditionId).length > 0); // Only show markets with comments
        break;
        
      case 'odds':
        // Odd bets = extreme probabilities (very high or very low)
        filtered = filtered
          .sort((a, b) => {
            const aProb = parseFloat(a.outcomePrices?.[0] || 0.5);
            const bProb = parseFloat(b.outcomePrices?.[0] || 0.5);
            
            // Distance from 50% - higher is more extreme
            const aExtreme = Math.abs(aProb - 0.5);
            const bExtreme = Math.abs(bProb - 0.5);
            
            return bExtreme - aExtreme;
          })
          .filter(m => {
            const prob = parseFloat(m.outcomePrices?.[0] || 0.5);
            return prob < 0.2 || prob > 0.8; // Only show extreme odds
          });
        break;
        
      default:
        break;
    }
    
    return filtered.slice(0, 15);
  };

  const filteredMarkets = getFilteredMarkets();

  // Generate an image for a market
  const generateMarketImage = async (market) => {
    const marketId = market.conditionId;
    
    // Don't regenerate if already exists
    if (generatedImages[marketId]) return;
    
    setImageLoading(prev => ({ ...prev, [marketId]: true }));
    
    // Create a thematic visual representation based on the question
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      const question = market.question.toLowerCase();
      const yesProb = parseFloat(market.outcomePrices?.[0] || 0.5);
      
      // Determine theme and colors based on question content
      let theme = {
        gradient1: '#3b82f6',
        gradient2: '#2563eb',
        emoji: '📊',
        emojis: ['📊', '📈', '💹'],
        bg: '#1e3a8a'
      };
      
      if (question.includes('bitcoin') || question.includes('crypto') || question.includes('btc')) {
        theme = {
          gradient1: '#f59e0b',
          gradient2: '#d97706',
          emoji: '₿',
          emojis: ['₿', '📈', '💰'],
          bg: '#92400e'
        };
      } else if (question.includes('trump') || question.includes('president') || question.includes('election')) {
        theme = {
          gradient1: '#dc2626',
          gradient2: '#991b1b',
          emoji: '🗳️',
          emojis: ['🗳️', '🇺🇸', '🏛️'],
          bg: '#7f1d1d'
        };
      } else if (question.includes('ai') || question.includes('agi') || question.includes('chatgpt')) {
        theme = {
          gradient1: '#8b5cf6',
          gradient2: '#7c3aed',
          emoji: '🤖',
          emojis: ['🤖', '🧠', '💡'],
          bg: '#5b21b6'
        };
      } else if (question.includes('fed') || question.includes('interest rate') || question.includes('rate cut')) {
        theme = {
          gradient1: '#059669',
          gradient2: '#047857',
          emoji: '💵',
          emojis: ['💵', '📉', '🏦'],
          bg: '#065f46'
        };
      } else if (question.includes('s&p') || question.includes('stock') || question.includes('500')) {
        theme = {
          gradient1: '#0891b2',
          gradient2: '#0e7490',
          emoji: '📈',
          emojis: ['📈', '💹', '🏢'],
          bg: '#164e63'
        };
      } else if (question.includes('tesla') || question.includes('spacex') || question.includes('mars')) {
        theme = {
          gradient1: '#e11d48',
          gradient2: '#be123c',
          emoji: '🚀',
          emojis: ['🚀', '⚡', '🌟'],
          bg: '#9f1239'
        };
      } else if (question.includes('apple') || question.includes('vr') || question.includes('ar')) {
        theme = {
          gradient1: '#6366f1',
          gradient2: '#4f46e5',
          emoji: '🍎',
          emojis: ['🍎', '📱', '🥽'],
          bg: '#4338ca'
        };
      } else if (question.includes('unemployment') || question.includes('jobs')) {
        theme = {
          gradient1: '#14b8a6',
          gradient2: '#0d9488',
          emoji: '💼',
          emojis: ['💼', '👔', '📊'],
          bg: '#115e59'
        };
      } else if (question.includes('war') || question.includes('peace') || question.includes('nobel')) {
        theme = {
          gradient1: '#f97316',
          gradient2: '#ea580c',
          emoji: '🕊️',
          emojis: ['🕊️', '🌍', '⚖️'],
          bg: '#9a3412'
        };
      }
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 1200, 600);
      gradient.addColorStop(0, theme.gradient1);
      gradient.addColorStop(1, theme.gradient2);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 600);
      
      // Add texture/pattern with circles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 1200;
        const y = Math.random() * 600;
        const radius = Math.random() * 100 + 50;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Add darker overlay on bottom
      const overlayGradient = ctx.createLinearGradient(0, 0, 0, 600);
      overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      overlayGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
      overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, 1200, 600);
      
      // Add main emoji - large and centered
      ctx.font = '280px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Emoji shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillText(theme.emoji, 608, 308);
      
      // Emoji
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillText(theme.emoji, 600, 300);
      
      // Add supporting emojis smaller
      ctx.font = '80px serif';
      theme.emojis.forEach((emoji, idx) => {
        if (idx > 0) {
          const angle = (idx - 1) * Math.PI;
          const x = 600 + Math.cos(angle) * 350;
          const y = 300 + Math.sin(angle) * 200;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillText(emoji, x, y);
        }
      });
      
      // Add probability bar at bottom
      const barHeight = 60;
      const barY = 600 - barHeight;
      
      // Background bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, barY, 1200, barHeight);
      
      // Probability fill
      const probWidth = 1200 * yesProb;
      const probGradient = ctx.createLinearGradient(0, barY, probWidth, barY);
      
      if (yesProb > 0.6) {
        probGradient.addColorStop(0, '#10b981');
        probGradient.addColorStop(1, '#059669');
      } else if (yesProb < 0.4) {
        probGradient.addColorStop(0, '#ef4444');
        probGradient.addColorStop(1, '#dc2626');
      } else {
        probGradient.addColorStop(0, '#3b82f6');
        probGradient.addColorStop(1, '#2563eb');
      }
      
      ctx.fillStyle = probGradient;
      ctx.fillRect(0, barY, probWidth, barHeight);
      
      // Add probability text
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'white';
      ctx.fillText(`${(yesProb * 100).toFixed(1)}% YES`, 30, barY + 38);
      
      ctx.textAlign = 'right';
      ctx.fillText(`${((1 - yesProb) * 100).toFixed(1)}% NO`, 1170, barY + 38);
      
      const imageUrl = canvas.toDataURL();
      setGeneratedImages(prev => ({ ...prev, [marketId]: imageUrl }));
      setImageLoading(prev => ({ ...prev, [marketId]: false }));
    }, 500);
  };

  // Generate image for top trending market on mount
  useEffect(() => {
    if (filteredMarkets.length > 0 && activeFilter === 'trending') {
      generateMarketImage(filteredMarkets[0]);
    }
  }, [filteredMarkets, activeFilter]);

  const getProbabilityColor = (prob) => {
    if (prob >= 70) return 'text-green-600';
    if (prob >= 50) return 'text-blue-600';
    if (prob >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProbabilityBg = (prob) => {
    if (prob >= 70) return 'bg-green-50 border-green-200';
    if (prob >= 50) return 'bg-blue-50 border-blue-200';
    if (prob >= 30) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* Quartz Crystal Logo */}
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg transform rotate-45 flex items-center justify-center shadow-lg">
                  <div className="w-6 h-6 bg-white/30 backdrop-blur-sm rounded transform -rotate-45"></div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full shadow-md"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Quartz
                </h1>
                <p className="text-sm text-slate-600">Prediction Market Intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>Updated {lastUpdate.toLocaleTimeString()}</span>
              </div>
              <button
                onClick={fetchMarkets}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 shadow-md"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Ad Placeholder - Top Banner */}
        <div className="mb-6 bg-gradient-to-r from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <div className="text-slate-400 font-medium mb-2">ADVERTISEMENT</div>
          <div className="text-slate-500 text-sm">728 x 90 Banner Ad Placement</div>
          <div className="text-xs text-slate-400 mt-1">Premium sponsorship opportunity</div>
        </div>
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Connection Issue</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
          </div>
        )}

        {/* Hero Section - Top Trending/Social Market */}
        {(activeFilter === 'trending' || activeFilter === 'social') && filteredMarkets.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              {activeFilter === 'trending' ? (
                <div className="flex items-center gap-1 text-orange-600">
                  <span className="text-2xl">🔥</span>
                  <span className="font-bold text-lg">TOP TRENDING</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-purple-600">
                  <span className="text-2xl">💬</span>
                  <span className="font-bold text-lg">MOST DISCUSSED</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => generateNarrative(filteredMarkets[0])}
              className="w-full bg-white rounded-xl border-2 border-slate-200 overflow-hidden hover:border-purple-400 hover:shadow-xl transition-all group"
            >
              {/* Image Section */}
              <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                {generatedImages[filteredMarkets[0].conditionId] ? (
                  <img 
                    src={generatedImages[filteredMarkets[0].conditionId]} 
                    alt="Market visualization"
                    className="w-full h-full object-cover"
                  />
                ) : imageLoading[filteredMarkets[0].conditionId] ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-white" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-6xl font-bold mb-2">
                        {(parseFloat(filteredMarkets[0].outcomePrices?.[0] || 0.5) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xl">YES PROBABILITY</div>
                    </div>
                  </div>
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Trending/Social badge */}
                <div className={`absolute top-4 left-4 ${
                  activeFilter === 'social' 
                    ? 'bg-purple-500' 
                    : 'bg-orange-500'
                } text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1`}>
                  <span>{activeFilter === 'social' ? '💬' : '🔥'}</span>
                  <span>{activeFilter === 'social' ? 'MOST DISCUSSED' : 'TRENDING #1'}</span>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 text-left group-hover:text-blue-600 transition-colors">
                  {filteredMarkets[0].question}
                </h2>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {parseFloat(filteredMarkets[0].outcomePrices?.[0] || 0.5) >= 0.5 ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`text-lg font-bold ${
                        parseFloat(filteredMarkets[0].outcomePrices?.[0] || 0.5) >= 0.5 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {(parseFloat(filteredMarkets[0].outcomePrices?.[0] || 0.5) * 100).toFixed(1)}% YES
                      </span>
                    </div>
                    <div className="text-slate-500">•</div>
                    <div className="text-slate-600">
                      <span className="font-semibold">
                        ${(parseFloat(filteredMarkets[0].volume24hr || 0) / 1000000).toFixed(2)}M
                      </span>
                      <span className="text-sm"> volume</span>
                    </div>
                    <div className="text-slate-500">•</div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MessageCircle className="w-4 h-4" />
                      <span className="font-semibold">
                        {getCommentsForMarket(filteredMarkets[0].conditionId).reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}
                      </span>
                      <span className="text-sm">comments</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-purple-600 font-medium">
                    <span>View Analysis</span>
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Markets List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Markets</h2>
              <span className="text-sm text-slate-500">{filteredMarkets.length} shown</span>
            </div>
            
            {/* Filter Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setActiveFilter('trending')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === 'trending'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                🔥 Trending
              </button>
              <button
                onClick={() => setActiveFilter('volume')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === 'volume'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                📊 Volume
              </button>
              <button
                onClick={() => setActiveFilter('social')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === 'social'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                💬 Social
              </button>
              <button
                onClick={() => setActiveFilter('odds')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === 'odds'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                🎲 Odd Bets
              </button>
            </div>
            
            {/* Filter Description */}
            <div className="mb-4 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600">
                {activeFilter === 'trending' && '🔥 Most active controversial markets with high volume'}
                {activeFilter === 'volume' && '📊 Highest 24-hour trading volume markets'}
                {activeFilter === 'social' && '💬 Most discussed markets by comment count and likes'}
                {activeFilter === 'odds' && '🎲 Extreme probabilities - longshots and sure things'}
              </p>
            </div>
            
            {/* Sidebar Ad Placeholder */}
            <div className="mb-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-300 rounded-lg p-6 text-center">
              <div className="text-purple-400 font-medium text-sm mb-2">SPONSORED</div>
              <div className="text-purple-600 text-xs">300 x 250 Medium Rectangle</div>
              <div className="text-xs text-purple-400 mt-1">Ad placement</div>
            </div>
            
            {loading && markets.length === 0 ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-slate-600">Loading live markets...</p>
              </div>
            ) : filteredMarkets.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-slate-600">No markets match this filter</p>
                <button
                  onClick={() => setActiveFilter('trending')}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  View trending markets
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMarkets
                  .slice((activeFilter === 'trending' || activeFilter === 'social') ? 1 : 0) // Skip first item in trending/social mode
                  .map((market) => {
                  const yesProb = parseFloat(market.outcomePrices?.[0] || 0.5) * 100;
                  const isSelected = selectedMarket?.conditionId === market.conditionId;
                  
                  return (
                    <button
                      key={market.conditionId}
                      onClick={() => generateNarrative(market)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-medium text-slate-900 text-sm leading-snug flex-1">
                          {market.question}
                        </h3>
                        {yesProb >= 50 ? (
                          <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${getProbabilityBg(yesProb)}`}>
                          <span className={getProbabilityColor(yesProb)}>
                            {yesProb.toFixed(1)}% YES
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">
                            ${(parseFloat(market.volume24hr || 0) / 1000).toFixed(0)}K vol
                          </span>
                          <div className="flex items-center gap-1 text-slate-400">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="text-xs">
                              {getCommentsForMarket(market.conditionId).reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Analysis Panel */}
          <div className="lg:col-span-2">
            {!selectedMarket && !narrativeLoading && (
              <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
                <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Select a Market
                </h3>
                <p className="text-slate-600">
                  Click on any market to see detailed analysis of the current odds and market dynamics
                </p>
              </div>
            )}

            {narrativeLoading && (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                </div>
                <p className="text-slate-600">Generating market analysis...</p>
              </div>
            )}

            {selectedMarket && !narrativeLoading && narrative && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                {/* Image header if available */}
                {generatedImages[selectedMarket.conditionId] && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={generatedImages[selectedMarket.conditionId]} 
                      alt="Market visualization"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                )}
                
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-start gap-3 mb-4">
                    <Sparkles className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2">{selectedMarket.question}</h2>
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <span>24h Vol: ${(parseFloat(selectedMarket.volume24hr || 0) / 1000).toFixed(0)}K</span>
                        <span>•</span>
                        <span>Liquidity: ${(parseFloat(selectedMarket.liquidity || 0) / 1000).toFixed(0)}K</span>
                        <span>•</span>
                        <span>Ends: {new Date(selectedMarket.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-xs font-medium mb-1">YES</div>
                      <div className="text-2xl font-bold">
                        {(parseFloat(selectedMarket.outcomePrices?.[0] || 0.5) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-xs font-medium mb-1">NO</div>
                      <div className="text-2xl font-bold">
                        {(parseFloat(selectedMarket.outcomePrices?.[1] || 0.5) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">Market Analysis</span>
                  </div>
                  <div className="prose prose-slate max-w-none">
                    {narrative.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  
                  {/* In-Content Ad Placeholder */}
                  <div className="my-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-dashed border-orange-300 rounded-lg p-6 text-center">
                    <div className="text-orange-400 font-medium text-sm mb-2">SPONSORED CONTENT</div>
                    <div className="text-orange-600 text-xs">Native Ad / Sponsored Article Placement</div>
                    <div className="text-xs text-orange-400 mt-1">600 x 200 In-content placement</div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="text-sm text-purple-900">
                      <strong>Powered by Quartz Intelligence:</strong> This analysis combines market data patterns with contextual insights. 
                      For production, this would integrate Claude AI for deeper, real-time analysis of prediction market trends.
                    </div>
                  </div>
                  
                  {/* Comments Section */}
                  <div className="mt-8 border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        <span>Discussion</span>
                        <span className="text-sm font-normal text-slate-500">
                          ({getCommentsForMarket(selectedMarket.conditionId).reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)} comments)
                        </span>
                      </h3>
                      <button
                        onClick={() => setShowComments(!showComments)}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {showComments ? 'Hide' : 'Show'} Comments
                      </button>
                    </div>
                    
                    {showComments && (
                      <div className="space-y-6">
                        {/* New Comment Input */}
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                              U
                            </div>
                            <div className="flex-1">
                              <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your thoughts on this market..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                rows="3"
                              />
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-slate-500">
                                  {newComment.length}/500 characters
                                </span>
                                <button
                                  onClick={() => setNewComment('')}
                                  disabled={!newComment.trim()}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Send className="w-4 h-4" />
                                  <span>Post</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Comment Thread */}
                        <div className="space-y-4">
                          {getCommentsForMarket(selectedMarket.conditionId).map((comment) => (
                            <div key={comment.id} className="bg-white rounded-lg border border-slate-200 p-4">
                              {/* Main Comment */}
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
                                  {comment.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-slate-900">{comment.user}</span>
                                    <span className="text-xs text-slate-500">{comment.timestamp}</span>
                                  </div>
                                  <p className="text-slate-700 text-sm mb-3">{comment.text}</p>
                                  
                                  {/* Comment Actions */}
                                  <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-1 text-slate-500 hover:text-red-500 transition-colors">
                                      <Heart className={`w-4 h-4 ${comment.liked ? 'fill-red-500 text-red-500' : ''}`} />
                                      <span className="text-xs font-medium">{comment.likes}</span>
                                    </button>
                                    <button 
                                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                      className="flex items-center gap-1 text-slate-500 hover:text-purple-600 transition-colors"
                                    >
                                      <CornerDownRight className="w-4 h-4" />
                                      <span className="text-xs font-medium">Reply</span>
                                    </button>
                                  </div>
                                  
                                  {/* Reply Input */}
                                  {replyingTo === comment.id && (
                                    <div className="mt-3 pl-4 border-l-2 border-purple-300">
                                      <div className="flex items-start gap-2">
                                        <input
                                          type="text"
                                          placeholder={`Reply to ${comment.user}...`}
                                          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        <button className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                          <Send className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Replies */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-4 ml-12 space-y-3 border-l-2 border-slate-200 pl-4">
                                  {comment.replies.map((reply) => (
                                    <div key={reply.id} className="flex items-start gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                                        {reply.avatar}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-semibold text-slate-900 text-sm">{reply.user}</span>
                                          <span className="text-xs text-slate-500">{reply.timestamp}</span>
                                        </div>
                                        <p className="text-slate-700 text-sm mb-2">{reply.text}</p>
                                        <button className="flex items-center gap-1 text-slate-500 hover:text-red-500 transition-colors">
                                          <Heart className={`w-3.5 h-3.5 ${reply.liked ? 'fill-red-500 text-red-500' : ''}`} />
                                          <span className="text-xs font-medium">{reply.likes}</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {getCommentsForMarket(selectedMarket.conditionId).length === 0 && (
                            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                              <MessageCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                              <p className="text-slate-600 font-medium">No comments yet</p>
                              <p className="text-slate-500 text-sm mt-1">Be the first to share your thoughts!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

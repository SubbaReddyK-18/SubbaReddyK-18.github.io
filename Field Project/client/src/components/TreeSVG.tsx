<interface TreeSVGProps {
  efficiency: number;
  isVisible: boolean;
}

export default function TreeSVG({ efficiency, isVisible }: TreeSVGProps) {
  const getStage = (): number => {
    if (efficiency <= 20) return 1;
    if (efficiency <= 50) return 2;
    if (efficiency <= 75) return 3;
    if (efficiency <= 95) return 4;
    return 5;
  };

  const stage = getStage();

  // Colors based on efficiency
  const leafColors = [
    { dark: '#1a472a', mid: '#2d5a3f', light: '#3d7a52' },
    { dark: '#1e5631', mid: '#2e7d42', light: '#43a047' },
    { dark: '#2e7d32', mid: '#388e3c', light: '#4caf50' },
    { dark: '#2e7d32', mid: '#43a047', light: '#66bb6a' },
    { dark: '#1b5e20', mid: '#2e7d32', light: '#4caf50' },
  ][stage - 1] || { dark: '#1a472a', mid: '#2d5a3f', light: '#3d7a52' };

  return (
    <svg
      viewBox="0 0 200 260"
      className="w-56 h-72"
      style={{ opacity: isVisible ? 1 : 0.4 }}
    >
      {/* Background - subtle gradient sky */}
      <defs>
        <linearGradient id="treeSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0f4f8" />
          <stop offset="100%" stopColor="#d9e2ec" />
        </linearGradient>
        <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5a8f4f" />
          <stop offset="100%" stopColor="#3d6b35" />
        </linearGradient>
        <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4a3520" />
          <stop offset="50%" stopColor="#6b4423" />
          <stop offset="100%" stopColor="#4a3520" />
        </linearGradient>
        <filter id="treeGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sky background */}
      <rect x="0" y="0" width="200" height="260" fill="url(#treeSky)" rx="12" />

      {/* Ground/grass */}
      <ellipse cx="100" cy="255" rx="95" ry="20" fill="url(#groundGrad)" />

      {/* Stage 1: Sapling (0-20%) */}
      {stage >= 1 && (
        <g className="transition-all duration-500">
          {/* Trunk */}
          <path d="M96 230 L96 195 L104 195 L104 230 Z" fill="url(#trunkGrad)" />
          {/* Small leaves */}
          <ellipse cx="100" cy="185" rx="18" ry="14" fill={leafColors.dark} />
          <ellipse cx="100" cy="180" rx="12" ry="10" fill={leafColors.light} />
        </g>
      )}

      {/* Stage 2: Small Tree (21-50%) */}
      {stage >= 2 && (
        <g className="transition-all duration-500">
          {/* Trunk */}
          <path d="M94 230 L94 170 L106 170 L106 230 Z" fill="url(#trunkGrad)" />
          {/* Branches */}
          <path d="M94 200 Q80 190 70 195" stroke="#5d4037" strokeWidth="3" fill="none" />
          <path d="M106 200 Q120 190 130 195" stroke="#5d4037" strokeWidth="3" fill="none" />
          {/* Foliage */}
          <circle cx="100" cy="155" r="35" fill={leafColors.dark} />
          <circle cx="85" cy="170" r="22" fill={leafColors.mid} />
          <circle cx="115" cy="170" r="22" fill={leafColors.mid} />
          <circle cx="100" cy="145" r="20" fill={leafColors.light} />
        </g>
      )}

      {/* Stage 3: Medium Tree (51-75%) */}
      {stage >= 3 && (
        <g className="transition-all duration-500">
          {/* Trunk */}
          <path d="M92 235 L92 150 L108 150 L108 235 Z" fill="url(#trunkGrad)" />
          {/* More branches */}
          <path d="M92 200 Q70 185 55 195" stroke="#5d4037" strokeWidth="4" fill="none" />
          <path d="M108 200 Q130 185 145 195" stroke="#5d4037" strokeWidth="4" fill="none" />
          <path d="M95 170 Q75 155 60 160" stroke="#5d4037" strokeWidth="3" fill="none" />
          <path d="M105 170 Q125 155 140 160" stroke="#5d4037" strokeWidth="3" fill="none" />
          {/* Dense foliage */}
          <ellipse cx="100" cy="120" rx="55" ry="45" fill={leafColors.dark} />
          <ellipse cx="100" cy="105" rx="45" ry="38" fill={leafColors.mid} />
          <ellipse cx="75" cy="130" r="25" fill={leafColors.dark} />
          <ellipse cx="125" cy="130" r="25" fill={leafColors.dark} />
          <ellipse cx="60" cy="115" r="18" fill={leafColors.mid} />
          <ellipse cx="140" cy="115" r="18" fill={leafColors.mid} />
          <ellipse cx="100" cy="85" r="25" fill={leafColors.light} />
        </g>
      )}

      {/* Stage 4: Full Tree (76-95%) */}
      {stage >= 4 && (
        <g className="transition-all duration-500" filter="url(#treeGlow)">
          {/* Thick trunk */}
          <path d="M90 240 L90 130 L110 130 L110 240 Z" fill="url(#trunkGrad)" />
          {/* Branch details */}
          <path d="M90 200 Q60 180 40 195" stroke="#5d4037" strokeWidth="5" fill="none" />
          <path d="M110 200 Q140 180 160 195" stroke="#5d4037" strokeWidth="5" fill="none" />
          <path d="M92 170 Q65 150 50 160" stroke="#5d4037" strokeWidth="4" fill="none" />
          <path d="M108 170 Q135 150 150 160" stroke="#5d4037" strokeWidth="4" fill="none" />
          {/* Full foliage */}
          <ellipse cx="100" cy="95" rx="70" ry="55" fill={leafColors.dark} />
          <ellipse cx="100" cy="75" rx="55" ry="45" fill={leafColors.mid} />
          <ellipse cx="65" cy="115" r="32" fill={leafColors.dark} />
          <ellipse cx="135" cy="115" r="32" fill={leafColors.dark} />
          <ellipse cx="45" cy="100" r="22" fill={leafColors.mid} />
          <ellipse cx="155" cy="100" r="22" fill={leafColors.mid} />
          <ellipse cx="80" cy="70" r="25" fill={leafColors.light} />
          <ellipse cx="120" cy="70" r="25" fill={leafColors.light} />
          <ellipse cx="100" cy="50" r="28" fill={leafColors.light} />
          {/* Ground shadow */}
          <ellipse cx="100" cy="245" rx="50" ry="8" fill="#000" opacity="0.15" />
        </g>
      )}

      {/* Stage 5: Master Tree (96-100%) */}
      {stage >= 5 && (
        <g className="transition-all duration-500" filter="url(#treeGlow)">
          {/* Master trunk */}
          <path d="M88 245 L88 115 L112 115 L112 245 Z" fill="url(#trunkGrad)" />
          {/* Full branch structure */}
          <path d="M88 210 Q50 185 30 200" stroke="#5d4037" strokeWidth="6" fill="none" />
          <path d="M112 210 Q150 185 170 200" stroke="#5d4037" strokeWidth="6" fill="none" />
          <path d="M90 180 Q60 155 42 165" stroke="#5d4037" strokeWidth="5" fill="none" />
          <path d="M110 180 Q140 155 158 165" stroke="#5d4037" strokeWidth="5" fill="none" />
          <path d="M92 150 Q65 130 50 138" stroke="#5d4037" strokeWidth="4" fill="none" />
          <path d="M108 150 Q135 130 150 138" stroke="#5d4037" strokeWidth="4" fill="none" />
          {/* Lush foliage */}
          <ellipse cx="100" cy="80" rx="80" ry="60" fill={leafColors.dark} />
          <ellipse cx="100" cy="55" rx="60" ry="48" fill={leafColors.mid} />
          <ellipse cx="60" cy="105" r="38" fill={leafColors.dark} />
          <ellipse cx="140" cy="105" r="38" fill={leafColors.dark} />
          <ellipse cx="35" cy="90" r="25" fill={leafColors.mid} />
          <ellipse cx="165" cy="90" r="25" fill={leafColors.mid} />
          <ellipse cx="75" cy="55" r="30" fill={leafColors.light} />
          <ellipse cx="125" cy="55" r="30" fill={leafColors.light} />
          <ellipse cx="100" cy="30" r="32" fill={leafColors.light} />
          {/* Golden star */}
          <polygon
            points="100,5 105,18 118,18 108,27 112,40 100,33 88,40 92,27 82,18 95,18"
            fill="#ffd700"
          >
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
          </polygon>
          {/* Ground shadow */}
          <ellipse cx="100" cy="248" rx="55" ry="10" fill="#000" opacity="0.2" />
        </g>
      )}

      {/* Ground detail */}
      <path d="M30 250 Q100 260 170 250" stroke="#3d6b35" strokeWidth="2" fill="none" opacity="0.5" />
    </svg>
  );
}

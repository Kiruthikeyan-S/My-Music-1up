import React from 'react';

export default function OneUpLogo({ className = 'h-9 w-auto', glow = true }) {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {glow && (
        <div className="absolute inset-0 bg-[#00e600]/30 blur-md rounded-lg pointer-events-none" />
      )}
      <svg
        viewBox="0 0 100 48"
        className="h-full w-auto drop-shadow-md z-10"
        style={{ shapeRendering: 'crispEdges' }}
      >
        {/* Background thick black outline */}
        <path
          d="
            M12,8 h76 v28 h-8 v8 h-68 v-36 z
            M8,14 h4 v20 h-4 z
            M84,14 h6 v16 h-6 z
          "
          fill="#000000"
        />

        {/* Global black backing fill */}
        <rect x="10" y="10" width="78" height="28" fill="#000000" />

        {/* '1' Block */}
        <rect x="12" y="18" width="6" height="6" fill="#00e600" />
        <rect x="18" y="14" width="10" height="24" fill="#00e600" />
        <rect x="18" y="14" width="4" height="4" fill="#ffffff" />

        {/* Black Divider */}
        <rect x="28" y="10" width="4" height="28" fill="#000000" />

        {/* 'U' Block */}
        <rect x="32" y="14" width="22" height="24" fill="#00e600" />
        <rect x="40" y="14" width="6" height="16" fill="#000000" />
        <rect x="32" y="14" width="4" height="4" fill="#ffffff" />
        <rect x="50" y="14" width="4" height="4" fill="#ffffff" />

        {/* Black Divider */}
        <rect x="54" y="10" width="4" height="28" fill="#000000" />

        {/* 'P' Block */}
        <rect x="58" y="14" width="22" height="24" fill="#00e600" />
        <rect x="66" y="20" width="6" height="6" fill="#000000" />
        <rect x="66" y="30" width="14" height="8" fill="#000000" />
        <rect x="58" y="14" width="4" height="4" fill="#ffffff" />

        {/* Extra Black Pixel Outlines */}
        <rect x="12" y="10" width="68" height="4" fill="#000000" />
        <rect x="12" y="38" width="68" height="4" fill="#000000" />
        <rect x="8" y="14" width="4" height="24" fill="#000000" />
        <rect x="80" y="14" width="4" height="20" fill="#000000" />
      </svg>
    </div>
  );
}

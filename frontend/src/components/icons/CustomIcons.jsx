import React from 'react';

export function CapsuleLogoIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="capsuleBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="capsuleOrange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.15" />
        </filter>
      </defs>
      <g transform="rotate(-45 50 50)" filter="url(#shadow)">
        <path d="M 32,50 L 32,32 A 18,18 0 0,1 68,32 L 68,50 Z" fill="url(#capsuleBlue)" />
        <path d="M 68,50 L 68,68 A 18,18 0 0,1 32,68 L 32,50 Z" fill="url(#capsuleOrange)" />
        <path d="M 36,32 A 14,14 0 0,1 64,32" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
        <path d="M 36,36 L 36,64" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.2" />
        <line x1="32" y1="50" x2="68" y2="50" stroke="#0f172a" strokeWidth="2" opacity="0.15" />
      </g>
    </svg>
  );
}

export function AutoRefillsIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="checkGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#checkGreen)" />
      <path d="M 32,50 L 44,62 L 68,38" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NextDeliveryCalendarIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="calHeader" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="calShadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
      </defs>
      <rect x="14" y="24" width="72" height="62" rx="12" fill="url(#calShadow)" stroke="#cbd5e1" strokeWidth="3" />
      <path d="M 14,36 L 14,36 A 12,12 0 0,1 26,24 L 74,24 A 12,12 0 0,1 86,36 L 86,44 L 14,44 Z" fill="url(#calHeader)" />
      <rect x="25" y="52" width="9" height="9" rx="2" fill="#94a3b8" />
      <rect x="39" y="52" width="9" height="9" rx="2" fill="#94a3b8" />
      <rect x="53" y="52" width="9" height="9" rx="2" fill="#94a3b8" />
      <rect x="67" y="52" width="9" height="9" rx="2" fill="#94a3b8" />
      <rect x="25" y="68" width="9" height="9" rx="2" fill="#94a3b8" />
      <rect x="39" y="68" width="9" height="9" rx="2" fill="#94a3b8" />
      <rect x="53" y="68" width="9" height="9" rx="2" fill="#ea580c" />
      <rect x="67" y="68" width="9" height="9" rx="2" fill="#94a3b8" />
      <rect x="28" y="12" width="8" height="20" rx="4" fill="#64748b" />
      <rect x="64" y="12" width="8" height="20" rx="4" fill="#64748b" />
    </svg>
  );
}

export function PriorAuthShieldIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path
        d="M 50,14 C 67,14 82,18 82,28 C 82,56 59,78 50,86 C 41,78 18,56 18,28 C 18,18 33,14 50,14 Z"
        fill="url(#shieldBlue)"
        stroke="#1e40af"
        strokeWidth="2"
      />
      <path d="M 36,49 L 45,58 L 64,36" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CaregiverAlertsBellIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bellOrange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="18" r="8" stroke="url(#bellOrange)" strokeWidth="5" fill="none" />
      <path
        d="M 50,22 C 37,22 30,32 30,46 L 30,64 C 30,70 20,74 20,76 L 80,76 C 80,74 70,70 70,64 L 70,46 C 70,32 63,22 50,22 Z"
        fill="url(#bellOrange)"
      />
      <path d="M 42,76 A 8,8 0 0,0 58,76 Z" fill="#b45309" />
    </svg>
  );
}

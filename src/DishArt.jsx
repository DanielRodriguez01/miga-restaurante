import React from 'react';
import { hexToRgba } from './utils';

const INK = '#2a2119';
const CREAM = '#fff7e7';

function Sparkles({ accent }) {
  return (
    <g fill={accent} opacity="0.85">
      <path d="M157 44c.9 4.8 2.7 6.6 7.5 7.5-4.8.9-6.6 2.7-7.5 7.5-.9-4.8-2.7-6.6-7.5-7.5 4.8-.9 6.6-2.7 7.5-7.5Z" />
      <path d="M38 126c.6 3.3 1.9 4.6 5.2 5.2-3.3.6-4.6 1.9-5.2 5.2-.6-3.3-1.9-4.6-5.2-5.2 3.3-.6 4.6-1.9 5.2-5.2Z" opacity="0.65" />
      <circle cx="42" cy="55" r="2.4" opacity="0.5" />
    </g>
  );
}

function Burger({ accent, double }) {
  return (
    <g>
      <ellipse cx="100" cy="154" rx="58" ry="9" fill={INK} opacity="0.08" />
      <path
        d="M46 88c0-26 22-42 54-42s54 16 54 42c0 4-3 7-7 8-31 6-63 6-94 0-4-1-7-4-7-8Z"
        fill={accent}
        stroke={INK}
        strokeWidth="3"
      />
      <g fill={CREAM} opacity="0.92">
        <ellipse cx="76" cy="66" rx="3.6" ry="2.4" transform="rotate(-18 76 66)" />
        <ellipse cx="91" cy="58" rx="3.6" ry="2.4" transform="rotate(8 91 58)" />
        <ellipse cx="107" cy="56" rx="3.6" ry="2.4" transform="rotate(-6 107 56)" />
        <ellipse cx="122" cy="62" rx="3.6" ry="2.4" transform="rotate(16 122 62)" />
        <ellipse cx="133" cy="72" rx="3.6" ry="2.4" transform="rotate(-12 133 72)" />
        <ellipse cx="68" cy="78" rx="3.6" ry="2.4" transform="rotate(22 68 78)" />
      </g>
      <path
        d="M44 98c10 10 22 4 30 10s18-3 27 3 18-6 27 0 18-1 28-10v9c-35 10-77 10-112 0v-12Z"
        fill="#7fa35a"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M48 110h104l-8 11h-11l-6 8-8-8H75l-6 8-7-8H55l-7-11Z"
        fill="#f0b43c"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <rect x="50" y="120" width="100" height="15" rx="7.5" fill="#6b4028" stroke={INK} strokeWidth="3" />
      {double && (
        <g>
          <rect x="52" y="133" width="96" height="12" rx="6" fill="#59341f" stroke={INK} strokeWidth="2.4" />
          <path d="M54 142h92l-6 8H60l-6-8Z" fill="#f0b43c" stroke={INK} strokeWidth="2" />
        </g>
      )}
      <path
        d={double ? 'M50 148h100c2 7-3 12-10 13H60c-7-1-12-6-10-13Z' : 'M48 133h104c2 8-3 15-11 16H59c-8-1-13-8-11-16Z'}
        fill="#e5a94f"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M62 141h76" stroke={INK} strokeWidth="2" opacity="0.25" />
    </g>
  );
}

function ChickenBurger({ accent }) {
  return (
    <g>
      <ellipse cx="100" cy="156" rx="56" ry="8" fill={INK} opacity="0.08" />
      <path
        d="M48 88c0-25 21-40 52-40s52 15 52 40c0 4-3 7-7 8-29 6-61 6-90 0-4-1-7-4-7-8Z"
        fill={accent}
        stroke={INK}
        strokeWidth="3"
      />
      <g fill={CREAM} opacity="0.9">
        <circle cx="78" cy="66" r="2.2" />
        <circle cx="94" cy="59" r="2.2" />
        <circle cx="111" cy="60" r="2.2" />
        <circle cx="125" cy="70" r="2.2" />
      </g>
      <path
        d="M46 97c8 8 20 3 27 9s16-2 25 3 16-5 25 0 18 0 27-9v10c-34 9-70 9-104 0V97Z"
        fill="#7fa35a"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M52 108c9-5 18 2 26-3 7-4 16 3 24 0 8-3 17 2 25-1 7-3 14 1 21 4 1 9-1 18-8 22-9 5-21 5-39 4-18 0-32-1-40-6-7-4-10-11-9-20Z"
        fill="#dc9c47"
        stroke={INK}
        strokeWidth="3"
      />
      <g fill={INK} opacity="0.35">
        <circle cx="72" cy="120" r="1.6" />
        <circle cx="88" cy="126" r="1.6" />
        <circle cx="104" cy="118" r="1.6" />
        <circle cx="120" cy="127" r="1.6" />
        <circle cx="133" cy="118" r="1.6" />
      </g>
      <path d="M50 136h100c2 7-3 13-10 14H60c-7-1-12-7-10-14Z" fill="#e5a94f" stroke={INK} strokeWidth="3" />
      <g transform="translate(146 118) rotate(16)">
        <path d="M0 0c3-8 9-11 13-7 2 2 1 6-2 9-3 3-8 4-11-2Z" fill="#e9542c" stroke={INK} strokeWidth="2.4" />
      </g>
    </g>
  );
}

function Sandwich({ accent }) {
  return (
    <g>
      <ellipse cx="100" cy="158" rx="58" ry="8" fill={INK} opacity="0.08" />
      <path d="M40 84c18-19 102-19 120 0v10c-40 10-80 10-120 0V84Z" fill={accent} stroke={INK} strokeWidth="3" />
      <g fill={CREAM} opacity="0.85">
        <circle cx="68" cy="79" r="1.8" />
        <circle cx="86" cy="74" r="1.8" />
        <circle cx="106" cy="74" r="1.8" />
        <circle cx="124" cy="79" r="1.8" />
      </g>
      <path d="M42 95c8 7 18 3 25 8s15-2 23 2 15-4 23 0 17 0 25-8v8c-32 8-64 8-96 0v-10Z" fill="#7fa35a" stroke={INK} strokeWidth="3" />
      <path d="M48 108h104c5 0 8 4 8 9s-3 9-8 9H48c-5 0-8-4-8-9s3-9 8-9Z" fill="#c98a45" stroke={INK} strokeWidth="3" />
      <g fill={INK} opacity="0.28">
        <circle cx="62" cy="118" r="1.5" />
        <circle cx="78" cy="122" r="1.5" />
        <circle cx="95" cy="116" r="1.5" />
        <circle cx="113" cy="121" r="1.5" />
        <circle cx="131" cy="117" r="1.5" />
      </g>
      <path d="M42 132c39-10 77-10 116 0v9c-39 10-77 10-116 0v-9Z" fill="#e5a94f" stroke={INK} strokeWidth="3" />
      <path d="M58 139h84" stroke={INK} strokeWidth="2" opacity="0.2" />
    </g>
  );
}

function Wrap({ accent }) {
  return (
    <g transform="rotate(-18 100 105)">
      <ellipse cx="100" cy="152" rx="58" ry="8" fill={INK} opacity="0.07" />
      <rect x="34" y="72" width="132" height="58" rx="29" fill="#e9c88e" stroke={INK} strokeWidth="3" />
      <ellipse cx="100" cy="72" rx="66" ry="12" fill="#f3dcae" stroke={INK} strokeWidth="3" />
      <path d="M62 76c8 12 8 34 0 50M88 74c8 12 8 36 0 52M114 74c8 12 8 36 0 52M140 76c8 12 8 34 0 50" stroke={INK} strokeWidth="2.2" opacity="0.3" />
      <path d="M42 96c14 7 30 4 43 9s26-4 39 2 22 1 32-5" stroke="#7fa35a" strokeWidth="7" strokeLinecap="round" />
      <path d="M48 108c12 6 25 3 36 7s22-4 33 1 20 1 28-3" stroke="#c96a45" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
      <ellipse cx="38" cy="101" rx="11" ry="31" fill={accent} stroke={INK} strokeWidth="3" />
      <ellipse cx="38" cy="101" rx="5" ry="20" fill={CREAM} opacity="0.75" />
      <path d="M52 62c10 5 22 5 32 0" stroke={INK} strokeWidth="2" opacity="0.15" fill="none" />
    </g>
  );
}

function Salad({ accent }) {
  return (
    <g>
      <ellipse cx="100" cy="156" rx="58" ry="8" fill={INK} opacity="0.07" />
      <g stroke={INK} strokeWidth="3">
        <ellipse cx="74" cy="88" rx="24" ry="14" fill="#7fa35a" transform="rotate(-24 74 88)" />
        <ellipse cx="112" cy="82" rx="26" ry="14" fill="#93b06a" transform="rotate(18 112 82)" />
        <ellipse cx="132" cy="101" rx="20" ry="12" fill="#66915a" transform="rotate(38 132 101)" />
        <ellipse cx="58" cy="107" rx="19" ry="11" fill="#8bab62" transform="rotate(-40 58 107)" />
      </g>
      <circle cx="94" cy="104" r="9" fill="#d95c40" stroke={INK} strokeWidth="2.6" />
      <circle cx="120" cy="112" r="7" fill="#d95c40" stroke={INK} strokeWidth="2.6" />
      <circle cx="76" cy="115" r="5" fill="#d95c40" stroke={INK} strokeWidth="2.2" />
      <g fill={CREAM}>
        <ellipse cx="106" cy="92" rx="2.4" ry="1.6" transform="rotate(30 106 92)" />
        <ellipse cx="66" cy="98" rx="2.4" ry="1.6" transform="rotate(-20 66 98)" />
        <ellipse cx="85" cy="92" rx="2.4" ry="1.6" />
      </g>
      <path d="M42 112h116c-5 27-28 44-58 44s-53-17-58-44Z" fill={CREAM} stroke={INK} strokeWidth="3" />
      <path d="M42 112c18 12 98 12 116 0" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      <path d="M66 134c20 10 48 10 68 0" fill="none" stroke={INK} strokeWidth="2" opacity="0.12" />
    </g>
  );
}

function Fries({ accent }) {
  const sticks = [
    [74, 48, -8, '#e8b44a'],
    [86, 40, 3, '#f0c05a'],
    [98, 45, -4, '#e8b44a'],
    [110, 38, 8, '#f0c05a'],
    [121, 47, -3, '#e8b44a'],
    [130, 56, 12, '#f0c05a'],
  ];
  return (
    <g>
      <ellipse cx="100" cy="156" rx="52" ry="8" fill={INK} opacity="0.07" />
      {sticks.map(([x, y, r, c], i) => (
        <rect key={i} x={x} y={y} width="13" height="68" rx="6" fill={c} stroke={INK} strokeWidth="2.4" transform={`rotate(${r} ${x + 6} ${y + 34})`} />
      ))}
      <path d="M66 88h68l-10 66H76L66 88Z" fill={accent} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M66 88h68l-2 13H68l-2-13Z" fill={CREAM} opacity="0.9" />
      <path d="M88 108c5-3 9-3 14 0s9 3 14 0" fill="none" stroke={CREAM} strokeWidth="3.4" strokeLinecap="round" opacity="0.9" />
      <circle cx="100" cy="124" r="7" fill={CREAM} opacity="0.9" />
      <path d="M96 124h8M100 120v8" stroke={accent} strokeWidth="2.2" />
      <g fill={INK} opacity="0.2">
        <circle cx="84" cy="99" r="1.2" />
        <circle cx="114" cy="102" r="1.2" />
      </g>
    </g>
  );
}

function Rings({ accent }) {
  const rings = [
    [72, 84, 26, 17],
    [128, 92, 23, 15],
    [98, 128, 29, 18],
  ];
  return (
    <g>
      <ellipse cx="100" cy="158" rx="55" ry="8" fill={INK} opacity="0.07" />
      {rings.map(([x, y, rx, ry], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="none" stroke="#c98a45" strokeWidth="14" />
          <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="none" stroke={accent} strokeWidth="6" opacity="0.55" />
          <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth="2.6" />
          <ellipse cx={x} cy={y} rx={rx - 7} ry={ry - 7} fill="none" stroke={INK} strokeWidth="1.8" opacity="0.35" />
        </g>
      ))}
      <g fill={CREAM} opacity="0.8">
        <circle cx="60" cy="76" r="1.8" />
        <circle cx="84" cy="97" r="1.8" />
        <circle cx="138" cy="82" r="1.8" />
        <circle cx="122" cy="105" r="1.8" />
        <circle cx="88" cy="136" r="1.8" />
        <circle cx="114" cy="142" r="1.8" />
      </g>
      <g fill="#7fa35a">
        <ellipse cx="70" cy="140" rx="10" ry="5" transform="rotate(-20 70 140)" />
      </g>
    </g>
  );
}

function Nuggets({ accent }) {
  const pieces = [
    [58, 90, -18],
    [104, 78, 12],
    [140, 118, -8],
    [82, 132, 20],
  ];
  return (
    <g>
      <ellipse cx="100" cy="158" rx="54" ry="8" fill={INK} opacity="0.07" />
      {pieces.map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <path
            d={`M${x - 24} ${y}c3-15 16-22 27-18 13-8 28 2 25 16 6 10-3 22-16 21-10 7-27 2-27-10-8-1-12-5-9-9Z`}
            fill={i % 2 ? '#d9a24a' : '#e3b05a'}
            stroke={INK}
            strokeWidth="3"
          />
          <g fill={INK} opacity="0.26">
            <circle cx={x - 8} cy={y - 4} r="1.5" />
            <circle cx={x + 4} cy={y + 3} r="1.5" />
            <circle cx={x - 2} cy={y + 10} r="1.5" />
          </g>
        </g>
      ))}
      <path d="M112 142c10-3 15-9 14-17" stroke={accent} strokeWidth="4" strokeLinecap="round" opacity="0.7" fill="none" />
      <g fill="#7fa35a">
        <ellipse cx="56" cy="130" rx="9" ry="4" transform="rotate(-24 56 130)" />
      </g>
    </g>
  );
}

function Drink({ accent }) {
  return (
    <g>
      <ellipse cx="100" cy="160" rx="42" ry="7" fill={INK} opacity="0.07" />
      <path d="M110 32l-14 34" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <path d="M110 32l-14 34" stroke={CREAM} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M71 68h58l-10 86H81L71 68Z" fill={accent} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M71 68h58l-2 14H73l-2-14Z" fill={CREAM} stroke={INK} strokeWidth="2.6" />
      <path d="M78 96c14 6 30 6 44 0v10c-14 6-30 6-44 0V96Z" fill={CREAM} opacity="0.9" />
      <path d="M82 112c11 5 25 5 36 0" fill="none" stroke={CREAM} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <g fill={CREAM} opacity="0.6">
        <circle cx="94" cy="128" r="3" />
        <circle cx="110" cy="136" r="2.2" />
        <circle cx="88" cy="142" r="1.8" />
      </g>
      <g transform="translate(80 92) rotate(-14)">
        <rect x="0" y="0" width="40" height="13" rx="6.5" fill={CREAM} opacity="0.8" />
      </g>
    </g>
  );
}

function Lemonade({ accent }) {
  return (
    <g>
      <ellipse cx="100" cy="160" rx="40" ry="7" fill={INK} opacity="0.07" />
      <path d="M114 34 98 74" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <path d="M114 34 98 74" stroke="#8fae5a" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M70 72h60l-11 82H81L70 72Z" fill={hexToRgba(accent, 0.24)} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M76 96h48l-6 50H82l-6-50Z" fill={accent} opacity="0.72" />
      <path d="M73 72h54" stroke={CREAM} strokeWidth="2" opacity="0.8" />
      <g fill={CREAM} opacity="0.8">
        <circle cx="90" cy="110" r="2.6" />
        <circle cx="106" cy="118" r="2" />
        <circle cx="96" cy="130" r="1.8" />
        <circle cx="112" cy="136" r="2.4" />
      </g>
      <g transform="translate(124 74) rotate(18)">
        <circle cx="0" cy="0" r="17" fill="#e9d35a" stroke={INK} strokeWidth="2.6" />
        <circle cx="0" cy="0" r="10" fill="#f3e88e" />
        <path d="M-10 0h20M0-10v20M-7-7l14 14M7-7-7 7" stroke="#e9d35a" strokeWidth="1.6" />
      </g>
      <g fill="#6f8a5b" stroke={INK} strokeWidth="1.8">
        <ellipse cx="70" cy="66" rx="9" ry="4.5" transform="rotate(-28 70 66)" />
        <ellipse cx="79" cy="60" rx="8" ry="4" transform="rotate(18 79 60)" />
      </g>
    </g>
  );
}

function Beer({ accent }) {
  return (
    <g>
      <ellipse cx="100" cy="160" rx="44" ry="7" fill={INK} opacity="0.07" />
      <path d="M136 92h10a13 13 0 0 1 0 26h-8" fill="none" stroke={INK} strokeWidth="8" />
      <path d="M136 92h10a13 13 0 0 1 0 26h-8" fill="none" stroke={accent} strokeWidth="4" />
      <path d="M58 82h78v66a8 8 0 0 1-8 8H66a8 8 0 0 1-8-8V82Z" fill={accent} stroke={INK} strokeWidth="3" />
      <path d="M58 82h78v14H58V82Z" fill="#f3e2b4" />
      <g fill={CREAM}>
        <circle cx="70" cy="78" r="13" />
        <circle cx="88" cy="72" r="14" />
        <circle cx="108" cy="73" r="15" />
        <circle cx="126" cy="79" r="12" />
      </g>
      <g fill={CREAM} stroke={INK} strokeWidth="1.5" opacity="0.9">
        <circle cx="70" cy="78" r="13" fill="none" />
        <circle cx="88" cy="72" r="14" fill="none" />
        <circle cx="108" cy="73" r="15" fill="none" />
        <circle cx="126" cy="79" r="12" fill="none" />
      </g>
      <g fill={CREAM} opacity="0.5">
        <circle cx="82" cy="110" r="3" />
        <circle cx="104" cy="118" r="2.2" />
        <circle cx="120" cy="106" r="1.8" />
        <circle cx="92" cy="132" r="2.4" />
      </g>
      <path d="M58 100h78" stroke={CREAM} strokeWidth="2" opacity="0.35" />
    </g>
  );
}

function Water({ accent }) {
  return (
    <g>
      <ellipse cx="100" cy="160" rx="34" ry="6" fill={INK} opacity="0.07" />
      <rect x="90" y="24" width="20" height="12" rx="3" fill={accent} stroke={INK} strokeWidth="2.6" />
      <path d="M87 36h26l4 12v98a8 8 0 0 1-8 8H91a8 8 0 0 1-8-8V48l4-12Z" fill={hexToRgba(accent, 0.2)} stroke={INK} strokeWidth="3" />
      <path d="M85 64h30v30H85V64Z" fill={CREAM} opacity="0.9" />
      <path d="M90 70h20M90 77h20M90 84h12" stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M87 104h26v42a8 8 0 0 1-8 8H95a8 8 0 0 1-8-8v-42Z" fill={hexToRgba(accent, 0.45)} />
      <path d="M84 51h32" stroke={INK} strokeWidth="2" opacity="0.2" />
    </g>
  );
}

function Shake({ accent }) {
  return (
    <g>
      <ellipse cx="100" cy="162" rx="40" ry="7" fill={INK} opacity="0.07" />
      <path d="M116 34 100 76" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M116 34 100 76" stroke="#e9d38d" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M70 82h60l-11 72H81L70 82Z" fill={hexToRgba(accent, 0.35)} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M77 112h46l-6 42H83l-6-42Z" fill={accent} opacity="0.8" />
      <g fill={CREAM} stroke={INK} strokeWidth="1.5">
        <circle cx="76" cy="78" r="18" />
        <circle cx="98" cy="66" r="20" />
        <circle cx="122" cy="76" r="17" />
        <circle cx="86" cy="60" r="12" />
        <circle cx="112" cy="58" r="12" />
      </g>
      <path d="M70 82h60" stroke={INK} strokeWidth="2.6" />
      <circle cx="100" cy="47" r="7" fill="#c94a3c" stroke={INK} strokeWidth="2.4" />
      <path d="M100 40c0-5 3-7 7-8" fill="none" stroke="#6f8a5b" strokeWidth="2.4" strokeLinecap="round" />
      <g fill={CREAM} opacity="0.85">
        <circle cx="92" cy="122" r="2.6" />
        <circle cx="108" cy="132" r="2" />
        <circle cx="96" cy="142" r="1.8" />
      </g>
    </g>
  );
}

function Coffee({ accent }) {
  return (
    <g>
      <ellipse cx="100" cy="158" rx="52" ry="8" fill={INK} opacity="0.07" />
      <path d="M118 92h8a10 10 0 0 1 0 20h-8" fill="none" stroke={INK} strokeWidth="7" />
      <path d="M118 92h8a10 10 0 0 1 0 20h-8" fill="none" stroke={accent} strokeWidth="3.2" />
      <path d="M62 84h58v42a20 20 0 0 1-20 20H82a20 20 0 0 1-20-20V84Z" fill={CREAM} stroke={INK} strokeWidth="3" />
      <ellipse cx="91" cy="84" rx="29" ry="8" fill={accent} stroke={INK} strokeWidth="3" />
      <ellipse cx="91" cy="84" rx="18" ry="4.5" fill={CREAM} opacity="0.35" />
      <ellipse cx="100" cy="150" rx="50" ry="10" fill={CREAM} stroke={INK} strokeWidth="2.6" />
      <path d="M76 68c-5-6 5-9 0-16M91 66c-5-6 5-9 0-16M106 68c-5-6 5-9 0-16" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" opacity="0.35" />
      <g fill={accent} opacity="0.7">
        <circle cx="78" cy="110" r="2" />
        <circle cx="102" cy="118" r="1.6" />
      </g>
    </g>
  );
}

function Cake({ accent }) {
  return (
    <g>
      <ellipse cx="100" cy="156" rx="60" ry="10" fill={INK} opacity="0.07" />
      <path d="M100 44 44 142c-4 7 1 10 8 10h96c7 0 12-3 8-10L100 44Z" fill={hexToRgba(accent, 0.25)} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 66 58 140h84L100 66Z" fill="#f0dcb0" />
      <path d="M100 66 72 116h56L100 66Z" fill="#8a5536" />
      <path d="M100 66 86 92h28L100 66Z" fill="#f3e6c8" />
      <path d="M78 118h44l-8 22H86l-8-22Z" fill="#8a5536" />
      <path d="M72 116h56" stroke={CREAM} strokeWidth="3" opacity="0.7" />
      <circle cx="100" cy="54" r="7" fill="#c94a3c" stroke={INK} strokeWidth="2.4" />
      <path d="M100 47c0-5 3-7 7-8" fill="none" stroke="#6f8a5b" strokeWidth="2.2" strokeLinecap="round" />
      <g fill={accent} opacity="0.6">
        <circle cx="84" cy="132" r="1.8" />
        <circle cx="114" cy="126" r="1.8" />
      </g>
    </g>
  );
}

function Cookie({ accent }) {
  return (
    <g>
      <ellipse cx="100" cy="156" rx="48" ry="8" fill={INK} opacity="0.07" />
      <circle cx="100" cy="102" r="54" fill={hexToRgba(accent, 0.7)} stroke={INK} strokeWidth="3" />
      <circle cx="100" cy="102" r="43" fill="none" stroke={CREAM} strokeWidth="2" opacity="0.45" strokeDasharray="3 6" />
      <g fill="#5a3520" stroke={INK} strokeWidth="1.4">
        <circle cx="78" cy="82" r="6" />
        <circle cx="112" cy="76" r="5" />
        <circle cx="128" cy="104" r="6.5" />
        <circle cx="104" cy="118" r="5.5" />
        <circle cx="76" cy="120" r="5" />
        <circle cx="94" cy="98" r="4" />
        <circle cx="122" cy="134" r="4" />
      </g>
      <g fill={CREAM} opacity="0.7">
        <circle cx="86" cy="70" r="1.4" />
        <circle cx="118" cy="90" r="1.4" />
        <circle cx="90" cy="136" r="1.4" />
      </g>
      <path d="M140 64c.8 4 2.3 5.5 6.3 6.3-4 .8-5.5 2.3-6.3 6.3-.8-4-2.3-5.5-6.3-6.3 4-.8 5.5-2.3 6.3-6.3Z" fill={accent} />
    </g>
  );
}

function Flan({ accent }) {
  return (
    <g>
      <ellipse cx="100" cy="154" rx="62" ry="12" fill={INK} opacity="0.08" />
      <ellipse cx="100" cy="148" rx="58" ry="15" fill={CREAM} stroke={INK} strokeWidth="2.6" />
      <path d="M52 138c0-34 20-58 48-58s48 24 48 58c0 8-20 12-48 12s-48-4-48-12Z" fill="#f0cf7c" stroke={INK} strokeWidth="3" />
      <path d="M52 132c0 9 20 13 48 13s48-4 48-13c-2 4-8 6-14 4-6-2-10 2-16 1-5-1-10 2-16 1-6-1-11-3-17-1-6 2-14 1-16-2-4-3-7-2-7-3Z" fill="#b9712f" stroke={INK} strokeWidth="2" />
      <path d="M84 130c6 4 12 4 18 0s12-4 18 0" fill="none" stroke={CREAM} strokeWidth="6" strokeLinecap="round" />
      <circle cx="118" cy="126" r="6" fill="#c94a3c" stroke={INK} strokeWidth="2" />
      <path d="M44 90c3-3 7-3 10 0M142 102c3-3 7-3 10 0" stroke={accent} strokeWidth="2" opacity="0.4" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Combo({ accent }) {
  return (
    <g>
      <ellipse cx="100" cy="158" rx="66" ry="9" fill={INK} opacity="0.08" />
      <g transform="translate(-16 24) scale(0.68) translate(20 10)">
        <Burger accent={accent} />
      </g>
      <g transform="translate(116 44) scale(0.44) translate(-40 20)">
        <Fries accent="#c98a45" />
      </g>
      <g transform="translate(142 78) scale(0.46) translate(-70 -10)">
        <Drink accent="#b85a3c" />
      </g>
    </g>
  );
}

const RENDERERS = {
  burger: (accent) => <Burger accent={accent} />,
  doubleBurger: (accent) => <Burger accent={accent} double />,
  chicken: (accent) => <ChickenBurger accent={accent} />,
  sandwich: (accent) => <Sandwich accent={accent} />,
  wrap: (accent) => <Wrap accent={accent} />,
  salad: (accent) => <Salad accent={accent} />,
  fries: (accent) => <Fries accent={accent} />,
  rings: (accent) => <Rings accent={accent} />,
  nuggets: (accent) => <Nuggets accent={accent} />,
  drink: (accent) => <Drink accent={accent} />,
  lemonade: (accent) => <Lemonade accent={accent} />,
  beer: (accent) => <Beer accent={accent} />,
  water: (accent) => <Water accent={accent} />,
  shake: (accent) => <Shake accent={accent} />,
  coffee: (accent) => <Coffee accent={accent} />,
  cake: (accent) => <Cake accent={accent} />,
  cookie: (accent) => <Cookie accent={accent} />,
  flan: (accent) => <Flan accent={accent} />,
  combo: (accent) => <Combo accent={accent} />,
};

export default function DishArt({ kind = 'burger', accent = '#d1502a', className = '', label = 'Ilustración de plato' }) {
  const render = RENDERERS[kind] || RENDERERS.burger;
  return (
    <div className={`dish-art ${className}`} style={{ '--dish-accent': accent }} aria-hidden="true">
      <svg viewBox="0 0 200 200" role="img" aria-label={label}>
        <circle cx="100" cy="104" r="78" fill={hexToRgba(accent, 0.14)} />
        <circle cx="100" cy="104" r="78" fill="none" stroke={hexToRgba(accent, 0.3)} strokeWidth="1.4" strokeDasharray="2 7" />
        <circle cx="100" cy="104" r="66" fill="none" stroke={hexToRgba(accent, 0.12)} strokeWidth="1" />
        <Sparkles accent={accent} />
        {render(accent)}
      </svg>
    </div>
  );
}

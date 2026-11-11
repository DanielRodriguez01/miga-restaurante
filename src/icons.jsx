import React from 'react';

const P = {
  bag: (
    <>
      <path d="M5.5 8.5h13l-1 11.2a1.8 1.8 0 0 1-1.8 1.6H8.3a1.8 1.8 0 0 1-1.8-1.6L5.5 8.5Z" />
      <path d="M9 8.5V6.8a3 3 0 0 1 6 0v1.7" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4.5h2l2.2 10.1h9.9l2-7.6H6" />
      <circle cx="9" cy="19.2" r="1.3" />
      <circle cx="17.4" cy="19.2" r="1.3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.2 4.2L19 6.8" />,
  arrowRight: <path d="M4 12h16m-6-6 6 6-6 6" />,
  arrowLeft: <path d="M20 12H4m6-6-6 6 6 6" />,
  arrowDown: <path d="M12 4v16m-6-6 6 6 6-6" />,
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8V12l3 2" />
    </>
  ),
  flame: (
    <path d="M12 3.2c.6 3.3-2.4 4.3-2.4 7a2.4 2.4 0 0 0 4.8 0c2.6 1.4 3.9 3.2 3.9 5.4A6.3 6.3 0 0 1 12 22a6.3 6.3 0 0 1-6.3-6.4c0-4.6 4.2-7.4 6.3-12.4Z" />
  ),
  star: (
    <path
      d="m12 3.5 2.5 5.3 5.8.8-4.2 4 1 5.7-5.1-2.8-5.1 2.8 1-5.7-4.2-4 5.8-.8L12 3.5Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  spark: <path d="M12 2.5c.6 5 2.5 6.9 7.5 7.5-5 .6-6.9 2.5-7.5 7.5-.6-5-2.5-6.9-7.5-7.5 5-.6 6.9-2.5 7.5-7.5Z" />,
  ticket: (
    <>
      <path d="M3.5 7.5h17v3a2 2 0 0 0 0 3.9v3h-17v-3a2 2 0 0 0 0-3.9v-3Z" />
      <path d="M14 8v1.6M14 12v1.6M14 16v1.6" strokeDasharray="1 3" />
    </>
  ),
  receipt: (
    <>
      <path d="M5 3.5h14v17l-2.3-1.5-2.3 1.5-2.4-1.5-2.3 1.5L7.3 19 5 20.5v-17Z" />
      <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" />
    </>
  ),
  table: (
    <>
      <path d="M3.5 9.5h17M12 9.5V20M7.5 20l-1 1.5M16.5 20l1 1.5" />
      <path d="M5 9.5V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  bike: (
    <>
      <circle cx="5.5" cy="17" r="3.3" />
      <circle cx="18.5" cy="17" r="3.3" />
      <path d="m8.5 17 3-7h-2M11.5 10h4l3 7M9.5 7.5h3" />
    </>
  ),
  cash: (
    <>
      <rect x="2.8" y="6.5" width="18.4" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 10v4M18 10v4" />
    </>
  ),
  card: (
    <>
      <rect x="2.8" y="5.5" width="18.4" height="13" rx="2.4" />
      <path d="M3 10h18M6.5 15h3" />
    </>
  ),
  qr: (
    <>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
      <path d="M14.5 14.5h2.5v2.5h-2.5zM20.5 14.5v6h-6M20.5 17.5h-2" />
    </>
  ),
  transfer: <path d="M4 8h14m-4-4 4 4-4 4M20 16H6m4 4-4-4 4-4" />,
  chef: (
    <>
      <path d="M6 12.5a3.5 3.5 0 1 1 .8-6.9A4 4 0 0 1 14.5 4a3.5 3.5 0 1 1 3 8.4V19H6v-6.5Z" />
      <path d="M6 15.5h11.5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 19.5a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 10v4l11 5V5L4 10Z" />
      <path d="M15 8.5a4 4 0 0 1 0 7M7 14.5V20h3v-4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
      <path d="M16 5.2a3 3 0 0 1 0 5.8M17 14.8c2 .5 3.5 2.3 3.5 5.2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),
  logout: (
    <>
      <path d="M10 4.5H5.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5H10" />
      <path d="M9 12h11m-4-4 4 4-4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 7h15M9 7V4.8h6V7M6.5 7l.8 12.2a1.6 1.6 0 0 0 1.6 1.5h6.2a1.6 1.6 0 0 0 1.6-1.5L17.5 7" />
      <path d="M10 11v5.5M14 11v5.5" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17l-1 4Z" />
      <path d="m14 6 4 4" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 4.5 4.5" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  heart: <path d="M12 20s-7.5-4.4-7.5-9.6A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 3C19.5 15.6 12 20 12 20Z" />,
  leaf: (
    <>
      <path d="M20 4c-9 0-15 4-15 10a6 6 0 0 0 6 6c6 0 9-7 9-16Z" />
      <path d="M4 21c2-6 6-9 11-12" />
    </>
  ),
  coffee: (
    <>
      <path d="M4 9h12v5.5A4.5 4.5 0 0 1 11.5 19h-3A4.5 4.5 0 0 1 4 14.5V9Z" />
      <path d="M16 10h1.8a2.7 2.7 0 1 1 0 5.4H16M7 5.5c0-1 1-1 1-2M11 5.5c0-1 1-1 1-2" />
    </>
  ),
  cup: (
    <>
      <path d="M5.5 7h13l-1.3 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L5.5 7Z" />
      <path d="M6.5 11h11M9 3.5l-1 3M15 3.5l-1 3" />
    </>
  ),
  cake: (
    <>
      <path d="M4 20h16M4 20v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7" />
      <path d="M4 15c1.5 1.4 3 1.4 4.5 0s3-1.4 4.5 0 3 1.4 4.5 0 2.3-1 2.5-.6M12 11V8M12 5.5v-.7" />
    </>
  ),
  download: <path d="M12 3v12m-5-5 5 5 5-5M4 18.5v1.5h16v-1.5" />,
  print: (
    <>
      <path d="M7 8V3.5h10V8M7 17H4.8A1.8 1.8 0 0 1 3 15.2v-4.4A1.8 1.8 0 0 1 4.8 9h14.4a1.8 1.8 0 0 1 1.8 1.8v4.4a1.8 1.8 0 0 1-1.8 1.8H17" />
      <rect x="7" y="14" width="10" height="7" rx="1" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5 21 20H3l9-16.5Z" />
      <path d="M12 9.5v4.5M12 17.2v.1" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.7" />
      <path d="m8 12.3 2.7 2.7L16.5 9" />
    </>
  ),
  rotate: <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" />,
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  lock: (
    <>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10M12 14.5v2.2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20.5c0-3.9 3.2-6.3 7.5-6.3s7.5 2.4 7.5 6.3" />
    </>
  ),
  phone: (
    <path d="M7 3.5h3l1.5 4.3-2 1.3a13 13 0 0 0 5.4 5.4l1.3-2 4.3 1.5v3a2 2 0 0 1-2.2 2A16.7 16.7 0 0 1 5 5.7a2 2 0 0 1 2-2.2Z" />
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.7" />
      <path d="M12 11v5M12 8v.1" />
    </>
  ),
  pause: <path d="M9 5v14M15 5v14" />,
  play: <path d="m7 4 13 8-13 8V4Z" />,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  store: (
    <>
      <path d="M4 9.5V20h16V9.5M3 9.5 5 4h14l2 5.5" />
      <path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M9 20v-5h6v5" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 9.5v4l2.5 1.5M9 2.5h6M12 2.5V6" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 6.5h14a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      <path d="M20 11h-4.5a2.2 2.2 0 0 0 0 4.4H20" />
    </>
  ),
  tag: (
    <>
      <path d="m4 4 7.5.2 8.3 8.3a2 2 0 0 1 0 2.8l-5 5a2 2 0 0 1-2.8 0L4 12V4Z" />
      <circle cx="8.3" cy="8.3" r="1.2" />
    </>
  ),
  gift: (
    <>
      <path d="M4 10h16v10H4V10ZM3 6.5h18V10H3V6.5ZM12 6.5V20" />
      <path d="M12 6.5C12 4 10.5 3 9 3.5S8 6.5 12 6.5ZM12 6.5c0-2.5 1.5-3.5 3-3s1 3-3 3Z" />
    </>
  ),
  volume: (
    <>
      <path d="M4 9.5h3l5-4v13l-5-4H4v-5Z" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
};

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.7, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {P[name] || P.spark}
    </svg>
  );
}

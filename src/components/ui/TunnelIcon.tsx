/** The bug's burrow. `data-bug-tunnel` tells the bug where to crawl out from. */
export function TunnelIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 18" width="28" height="18" aria-hidden data-bug-tunnel className={className}>
      <path d="M2 17v-7a12 9 0 0 1 24 0v7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 17v-6a8 6.5 0 0 1 16 0v6z" fill="#07060f" />
      <path d="M9 7.5 7 5.5M14 4.5V2M19 7.5l2-2" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M.75 17h26.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

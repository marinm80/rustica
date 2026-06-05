export function scrollToAnchor(hash: string, offsetPx: number = 0): void {
  const target = document.querySelector(hash);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - offsetPx;
  window.scrollTo({ top, behavior: 'smooth' });
}

export function getNavbarHeight(): number {
  const navbar = document.querySelector<HTMLElement>('.navbar');
  return navbar ? navbar.offsetHeight : 72;
}

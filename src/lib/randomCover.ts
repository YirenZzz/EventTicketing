// lib/randomCover.ts
export function getRandomCoverImage(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/400`;
}

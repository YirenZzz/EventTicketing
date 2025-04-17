// // lib/randomCover.ts
// const sampleCovers = [
//     'https://source.unsplash.com/featured/?concert',
//     'https://source.unsplash.com/featured/?festival',
//     'https://source.unsplash.com/featured/?event',
//     'https://source.unsplash.com/featured/?music',
//     'https://source.unsplash.com/featured/?conference',
//   ];
  
//   export function getRandomCoverImage() {
//     const index = Math.floor(Math.random() * sampleCovers.length);
//     return sampleCovers[index];
//   }

export function getRandomCoverImage(style: string = 'tech'): string {
    // 用风格 + 随机字符串 作为 seed，确保每种风格都有多个不同图
    const seed = `${style}-${Math.random().toString(36).substring(2, 8)}`;
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/200`;
  }
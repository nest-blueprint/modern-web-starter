export function randomAccessToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomIPV6() {
  const ip = [];
  for (let i = 0; i < 8; i++) {
    ip.push(Math.floor(Math.random() * 65536).toString(16));
  }
  return ip.join(':');
}

export function randomString(length: number, chars: string) {
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

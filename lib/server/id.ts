let counter = 0;

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  counter++;
  return `${timestamp}${random}${counter.toString(36)}`;
}

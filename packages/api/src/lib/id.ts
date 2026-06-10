let counter = 0n;
const epoch = 1700000000000n;

export function generateId(): string {
  const timestamp = BigInt(Date.now()) - epoch;
  const random = BigInt(Math.floor(Math.random() * 1000000));
  counter++;
  const id = (timestamp << 24n) | (random << 8n) | (counter & 0xFFn);
  return id.toString(36);
}

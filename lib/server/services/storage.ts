export class StorageProvider {
  private r2: R2Bucket;

  constructor(r2: R2Bucket) {
    this.r2 = r2;
  }

  async upload(key: string, data: ArrayBuffer | ReadableStream, contentType: string): Promise<string> {
    await this.r2.put(key, data, {
      httpMetadata: { contentType },
    });
    return key;
  }

  async get(key: string): Promise<R2ObjectBody | null> {
    return await this.r2.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.r2.delete(key);
  }

  async list(prefix: string): Promise<R2Object[]> {
    const result = await this.r2.list({ prefix });
    return result.objects;
  }

  getPublicUrl(key: string): string {
    return key;
  }
}

export function createStorageProvider(env: Env): StorageProvider {
  return new StorageProvider(env.R2);
}

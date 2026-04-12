import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 32);

export function generateApiKey(): string {
  return `ak_${nanoid()}`;
}

export function generateId(): string {
  return nanoid();
}

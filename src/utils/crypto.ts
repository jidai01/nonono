import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { ExportData } from '../types';

async function deriveKey(passphrase: string, salt: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    passphrase + salt
  );
}

function generateIv(): string {
  const chars = '0123456789abcdef';
  let iv = '';
  for (let i = 0; i < 32; i++) {
    iv += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return iv;
}

function xorEncrypt(data: string, key: string): string {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function encryptData(data: ExportData, passphrase: string): Promise<string> {
  const salt = generateIv();
  const key = await deriveKey(passphrase, salt);
  const jsonData = JSON.stringify(data);

  const encoded = new TextEncoder().encode(jsonData);
  const keyBytes = new TextEncoder().encode(key);

  const encrypted = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i++) {
    encrypted[i] = encoded[i] ^ keyBytes[i % keyBytes.length];
  }

  const base64 = arrayBufferToBase64(encrypted.buffer);
  return `${salt}:${base64}`;
}

export async function decryptData(encryptedData: string, passphrase: string): Promise<ExportData | null> {
  try {
    const [salt, base64] = encryptedData.split(':');
    if (!salt || !base64) return null;

    const key = await deriveKey(passphrase, salt);

    const binary = atob(base64);
    const encrypted = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      encrypted[i] = binary.charCodeAt(i);
    }

    const keyBytes = new TextEncoder().encode(key);
    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
    }

    const jsonData = new TextDecoder().decode(decrypted);
    return JSON.parse(jsonData);
  } catch {
    return null;
  }
}

export async function exportToFile(data: ExportData, passphrase: string, uri: string): Promise<boolean> {
  try {
    const encrypted = await encryptData(data, passphrase);
    await FileSystem.writeAsStringAsync(uri, encrypted);
    return true;
  } catch {
    return false;
  }
}

export async function importFromFile(uri: string, passphrase: string): Promise<ExportData | null> {
  try {
    const encrypted = await FileSystem.readAsStringAsync(uri);
    return await decryptData(encrypted, passphrase);
  } catch {
    return null;
  }
}

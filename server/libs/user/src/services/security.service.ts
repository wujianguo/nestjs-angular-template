import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createCipheriv, createDecipheriv, createHmac, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { AdminAuthConfig } from '../dto/auth-config.dto';

@Injectable()
export class SecurityService {
  public readonly tokenSize = 32;
  public readonly codeSize = 6;
  private readonly config: AdminAuthConfig;
  constructor(private configService: ConfigService) {
    this.config = this.configService.get<AdminAuthConfig>('auth');
  }

  async bcryptHash(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  async bcryptCompare(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }

  hmac(message: string, key = ''): string {
    const hmac = createHmac('sha256', this.config.securityKey + key);
    hmac.update(message, 'utf-8');
    return hmac.digest('hex');
  }

  verifyHmac(message: string, content: string): boolean {
    return this.hmac(message) === content;
  }

  randomBytes(): Buffer {
    return randomBytes(16);
  }

  randomString(characters: string, length: number): string {
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  randomCode(length = 6): string {
    const characters = '0123456789';
    return this.randomString(characters, length);
  }

  randomToken(length = 32): string {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    return this.randomString(characters, length);
  }

  async encrypt(content: string, key: string, iv: Buffer): Promise<string> {
    const key2 = (await promisify(scrypt)(this.config.securityKey + key, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key2, iv);
    return Buffer.concat([cipher.update(content), cipher.final()]).toString('hex');
  }

  async decrypt(content: string, key: string, iv: Buffer): Promise<string> {
    const key2 = (await promisify(scrypt)(this.config.securityKey + key, 'salt', 32)) as Buffer;
    const decipher = createDecipheriv('aes-256-ctr', key2, iv);
    return Buffer.concat([decipher.update(content, 'hex'), decipher.final()]).toString();
  }
}

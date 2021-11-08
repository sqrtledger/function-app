import * as Crypto from 'crypto';
import { any } from 'joi';

export class CredentialsService {
  protected decrypt(key: string, str: string): string {
    const ivBuffer: Buffer = Buffer.from(str, 'base64').slice(0, 16);

    const keyBuffer: Buffer = Crypto.createHash('sha256').update(key).digest();

    const strBuffer: Buffer = Buffer.from(str);

    const decipher = Crypto.createDecipheriv(
      'aes-256-ctr',
      keyBuffer,
      ivBuffer
    );

    const decipherUpdateBuffer: string = decipher.update(strBuffer.slice(16)) as any;

    const decipherFinalBuffer: string = decipher.final() as any;

    return (decipherUpdateBuffer + decipherFinalBuffer) as any;
  }

  protected encrypt(key: string, str: string): string {
    const ivBuffer: Buffer = Crypto.randomBytes(16);

    const keyBuffer: Buffer = Crypto.createHash('sha256').update(key).digest();

    const strBuffer: Buffer = Buffer.from(str);

    const cipher = Crypto.createCipheriv('aes-256-ctr', keyBuffer, ivBuffer);

    const cipherUpdateBuffer: Buffer = cipher.update(strBuffer);

    const cipherFinalBuffer: Buffer = cipher.final();

    return Buffer.concat([
      ivBuffer,
      cipherUpdateBuffer,
      cipherFinalBuffer,
    ]).toString('base64');
  }

  public async generate(): Promise<{ clientId: string; clientSecret: string }> {
    return {
      clientId: this.decrypt('hello', this.encrypt('hello', 'world')),
      clientSecret: this.encrypt('hello', 'world'),
    };
  }
}

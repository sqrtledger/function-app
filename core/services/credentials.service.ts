import * as Crypto from 'crypto';

export class CredentialsService {
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
      clientId: null,
      clientSecret: this.encrypt('hello', 'world'),
    };
  }
}

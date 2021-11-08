import * as Crypto from 'crypto';
import * as Uuid from 'uuid';

export class CredentialsService {
  constructor(protected secret: string) {}

  protected decryptAes256Ctr(key: string, str: string): string {
    const ivBuffer: Buffer = Buffer.from(str, 'base64').slice(0, 16);

    const keyBuffer: Buffer = Crypto.createHash('sha256').update(key).digest();

    const strBuffer: Buffer = Buffer.from(str, 'base64');

    const decipher = Crypto.createDecipheriv(
      'aes-256-ctr',
      keyBuffer,
      ivBuffer
    );

    const decipherUpdateBuffer: Buffer = decipher.update(strBuffer.slice(16));

    const decipherFinalBuffer: Buffer = decipher.final();

    return Buffer.concat([
      decipherUpdateBuffer,
      decipherFinalBuffer,
    ]).toString();
  }

  protected encryptAes256ctr(key: string, str: string): string {
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

  protected hmac256(key: string, str: string): string {
    return Crypto.createHmac('sha256', key)
      .update(str)
      .digest()
      .toString('base64');
  }

  public async generate(): Promise<{ clientId: string; clientSecret: string }> {
    const clientId: string = Uuid.v4();

    return {
      clientId: clientId,
      clientSecret: this.hmac256(this.secret, clientId),
    };
  }

  public async validate(
    clientId: string,
    clientSecret: string
  ): Promise<boolean> {
    const hmac256: string = this.hmac256(this.secret, clientId);

    if (hmac256 === clientSecret) {
      return false;
    }
    return true;
  }

  public async validateAuthorizationHeader(
    value: string | null
  ): Promise<boolean> {
    if (!value) {
      return false;
    }

    const valueSplitted: Array<string> = value.split(' ');

    if (
      valueSplitted.length !== 2 ||
      valueSplitted[0].toLowerCase() !== 'basic'
    ) {
      return false;
    }

    const credentials: string = Buffer.from(
      valueSplitted[1],
      'base64'
    ).toString();

    const credentialsSplitted: Array<string> = credentials.split(':');

    if (credentialsSplitted.length !== 2) {
      return false;
    }

    const clientId: string = credentialsSplitted[0];

    const clientSecret: string = credentialsSplitted[1];

    return this.validate(clientId, clientSecret);
  }
}

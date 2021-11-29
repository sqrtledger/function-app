import JwtDecode from 'jwt-decode';

export class AuthorizationHelper {
  public static decode(value: string): any {
    if (!value) {
      return null;
    }

    return JwtDecode(value[1]);
  }

  public static decodeFromHeader(value: string): { sub: string } {
    if (!value) {
      return null;
    }

    const valueSplitted: Array<string> = value.split(' ');

    if (
      valueSplitted.length !== 2 ||
      valueSplitted[0].toLowerCase() !== 'bearer'
    ) {
      return null;
    }

    return this.decode(valueSplitted[1]);
  }

  public static getSub(value: string): string | null {
    if (!value) {
      return null;
    }

    const obj = this.decode(value);

    return obj.sub;
  }

  public static getSubFromHeader(value: string): string | null {
    if (!value) {
      return null;
    }

    const obj = this.decodeFromHeader(value);

    return obj.sub;
  }
}

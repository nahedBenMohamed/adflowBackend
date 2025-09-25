import { decode } from 'iconv-lite';

export const formatState = (...params: unknown[]): string => params?.join(':');

export const parseState = <T>(state: string, parser: (value: string) => T): T[] =>
  state.split(':').map((part) => parser(part));

export const splitByFirstSpace = (input: string): [string, string] => {
  const parts = input.split(/\s/, 2);

  return parts.length === 1 ? [parts[0], ''] : [parts[0], input.substring(parts[0].length).trim()];
};

export const capitalizeFirst = (str: string): string => {
  return str.length === 0 ? str : str.charAt(0).toUpperCase() + str.slice(1);
};

export class StringUtil {
  static decode(str: string, from: BufferEncoding, to: BufferEncoding): string {
    return Buffer.from(str, from).toString(to);
  }

  /**
   * Decode MIME "encoded-word" format
   * @param encodedStr encoded string
   * @returns decoded string
   */
  static decodeMimeWord(encodedStr: string): string {
    const match = encodedStr.match(/=\?([^?]+)\?([BQ])\?([^?]*)\?=/i);
    if (!match) return encodedStr;

    const charset = match[1].toLowerCase();
    const encoding = match[2].toUpperCase();
    const text = match[3];

    let buffer: Buffer;
    if (encoding === 'B') {
      buffer = Buffer.from(text, 'base64');
    } else if (encoding === 'Q') {
      // Replace underscore with space and decode quoted-printable
      buffer = Buffer.from(
        text.replace(/_/g, ' ').replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))),
        'binary',
      );
    } else {
      return encodedStr; // Unsupported encoding
    }

    return decode(buffer, charset);
  }

  /**
   * Decode RFC 5987 format
   * @param encodedStr encoded string
   * @returns decoded string
   */
  static decodeRFC5987(encodedStr: string): string {
    const parts = encodedStr.split("''");

    return parts.length === 2 ? decodeURIComponent(parts[1].replace(/%20/g, ' ')) : encodedStr;
  }
}

import * as bcrypt from 'bcrypt';
import { generate } from 'generate-password';

const rounds = 10;

interface GenerateOptions {
  /**
   * Length of the generated password.
   * @default 10
   */
  length?: number;
  /**
   * Should the password include numbers
   * @default false
   */
  numbers?: boolean;
  /**
   * Should the password include symbols, or symbols to include
   * @default false
   */
  symbols?: boolean | string;
  /**
   * Should the password include lowercase characters
   * @default true
   */
  lowercase?: boolean;
  /**
   * Should the password include uppercase characters
   * @default true
   */
  uppercase?: boolean;
  /**
   * Should exclude visually similar characters like 'i' and 'I'
   * @default false
   */
  excludeSimilarCharacters?: boolean;
  /**
   * List of characters to be excluded from the password
   * @default ""
   */
  exclude?: string;
  /**
   * Password should include at least one character from each pool
   * @default false
   */
  strict?: boolean;
}
export class PasswordUtil {
  static generate(options?: GenerateOptions): string {
    return generate(options);
  }

  static generateSecure(
    options: GenerateOptions = {
      length: 12,
      numbers: true,
      symbols: false,
      lowercase: true,
      uppercase: true,
      excludeSimilarCharacters: true,
    },
  ): string {
    return generate(options);
  }

  static hash(plainPassword: string): string {
    return bcrypt.hashSync(plainPassword, rounds);
  }

  static verify(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}

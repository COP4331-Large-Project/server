import bcrypt from 'bcrypt';

const ROUNDS = 10;

class PasswordHasher {
  private static ROUNDS = 10;
  static async hash(plaintext: string) {
    return bcrypt.hash(plaintext, ROUNDS);
  }

  static async validateHash(plaintext: string, hash: string) {
    return bcrypt.compare(plaintext, hash);
  }
}

export default PasswordHasher;

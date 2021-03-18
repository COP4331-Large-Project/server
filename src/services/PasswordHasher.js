import bcrypt from 'bcrypt';

const ROUNDS = 10;

const PasswordHasher = {
  hash: async (plaintext) => bcrypt.hash(plaintext, ROUNDS),
  validateHash: async (plaintext, hash) => bcrypt.compare(plaintext, hash),
};

export default PasswordHasher;

import jwt from 'jsonwebtoken';

const createToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET);

const authenticate = (token) => jwt.verify(token, process.env.JWT_SECRET);
export default { createToken, authenticate };

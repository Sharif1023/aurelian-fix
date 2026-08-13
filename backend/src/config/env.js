import 'dotenv/config';

const required = ['DB_HOST','DB_USER','DB_NAME','JWT_SECRET'];
for (const key of required) if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
if ((process.env.JWT_SECRET || '').length < 32) throw new Error('JWT_SECRET must be at least 32 characters long.');

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME
  },
  jwtSecret: process.env.JWT_SECRET,
  cookieSecure: String(process.env.COOKIE_SECURE).toLowerCase() === 'true',
  uploadDir: process.env.UPLOAD_DIR || 'src/uploads'
};

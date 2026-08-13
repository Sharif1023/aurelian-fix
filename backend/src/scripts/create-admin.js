import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

const [username,email,password]=process.argv.slice(2);
if(!username||!email||!password){console.error('Usage: npm run create-admin -- <username> <email> <password>');process.exit(1);}
if(password.length<10){console.error('Password must be at least 10 characters.');process.exit(1);}
const hash=await bcrypt.hash(password,12);
await pool.query(`INSERT INTO admins (username,email,password_hash,role,is_active) VALUES (?,?,?,'super_admin',1) ON DUPLICATE KEY UPDATE email=VALUES(email),password_hash=VALUES(password_hash),is_active=1`,[username,email.toLowerCase(),hash]);
console.log(`Admin ready: ${username} (${email})`);await pool.end();

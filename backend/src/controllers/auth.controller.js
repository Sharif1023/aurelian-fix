import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { HttpError } from '../utils/http.js';
import { clearAdminCookie, setAdminCookie, signAdmin } from '../middleware/auth.js';

export async function login(req,res){
  const login=String(req.body?.login||'').trim(); const password=String(req.body?.password||'');
  if(!login||!password) throw new HttpError(400,'Username/email and password are required.');
  const [rows]=await pool.query('SELECT * FROM admins WHERE (username=? OR email=?) AND is_active=1 LIMIT 1',[login,login.toLowerCase()]);
  const admin=rows[0]; if(!admin||!(await bcrypt.compare(password,admin.password_hash))) throw new HttpError(401,'Invalid admin credentials.');
  await pool.query('UPDATE admins SET last_login_at=NOW() WHERE id=?',[admin.id]);
  setAdminCookie(res,signAdmin(admin));
  res.json({id:String(admin.id),username:admin.username,email:admin.email,role:admin.role});
}
export async function me(req,res){
  const [rows]=await pool.query('SELECT id,username,email,role,is_active,last_login_at,created_at FROM admins WHERE id=? AND is_active=1 LIMIT 1',[req.admin.sub]);
  if(!rows[0]) throw new HttpError(401,'Admin account is unavailable.');
  res.json({...rows[0],id:String(rows[0].id)});
}
export async function logout(_req,res){clearAdminCookie(res);res.status(204).end();}

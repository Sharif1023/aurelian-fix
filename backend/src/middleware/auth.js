import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http.js';

const COOKIE = 'sharuu_admin';
export function signAdmin(admin) { return jwt.sign({ sub: String(admin.id), email: admin.email, username: admin.username, role: admin.role }, env.jwtSecret, { expiresIn: '12h' }); }
export function setAdminCookie(res, token) { res.cookie(COOKIE, token, { httpOnly: true, secure: env.cookieSecure, sameSite: 'lax', maxAge: 12*60*60*1000, path: '/' }); }
export function clearAdminCookie(res) { res.clearCookie(COOKIE, { httpOnly: true, secure: env.cookieSecure, sameSite: 'lax', path: '/' }); }
export function requireAdmin(req,_res,next) { try { const token=req.cookies?.[COOKIE]; if(!token) throw new HttpError(401,'Admin login is required.'); req.admin=jwt.verify(token,env.jwtSecret); next(); } catch(error) { next(error instanceof HttpError?error:new HttpError(401,'Admin session expired.')); } }

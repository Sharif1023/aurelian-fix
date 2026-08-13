import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http.js';

const COOKIE='sharuu_customer';
export function signCustomer(customer){return jwt.sign({sub:String(customer.id),email:customer.email,type:'customer'},env.jwtSecret,{expiresIn:'30d'});}
export function setCustomerCookie(res,token){res.cookie(COOKIE,token,{httpOnly:true,secure:env.cookieSecure,sameSite:'lax',maxAge:30*24*60*60*1000,path:'/'});}
export function clearCustomerCookie(res){res.clearCookie(COOKIE,{httpOnly:true,secure:env.cookieSecure,sameSite:'lax',path:'/'});}
export function requireCustomer(req,_res,next){try{const token=req.cookies?.[COOKIE];if(!token)throw new HttpError(401,'Customer login is required.');const payload=jwt.verify(token,env.jwtSecret);if(payload.type!=='customer')throw new Error('Invalid token type');req.customer=payload;next();}catch(error){next(error instanceof HttpError?error:new HttpError(401,'Customer session expired.'));}}

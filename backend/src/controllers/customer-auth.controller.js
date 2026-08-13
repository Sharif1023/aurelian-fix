import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { HttpError } from '../utils/http.js';
import { clearCustomerCookie,setCustomerCookie,signCustomer } from '../middleware/customer-auth.js';

const publicCustomer=(c)=>({id:String(c.id),name:c.name,email:c.email,phone:c.phone||'',city:c.city||''});
export async function register(req,res){
  const name=String(req.body?.name||'').trim(),email=String(req.body?.email||'').trim().toLowerCase(),password=String(req.body?.password||'');
  if(!name||!email||!password)throw new HttpError(400,'Name, email and password are required.');
  if(password.length<8)throw new HttpError(400,'Password must be at least 8 characters.');
  const [rows]=await pool.query('SELECT * FROM customers WHERE email=? LIMIT 1',[email]);
  const hash=await bcrypt.hash(password,12); let customer;
  if(rows[0]){if(rows[0].password_hash)throw new HttpError(409,'An account with this email already exists.');await pool.query('UPDATE customers SET name=?,password_hash=? WHERE id=?',[name,hash,rows[0].id]);const [next]=await pool.query('SELECT * FROM customers WHERE id=?',[rows[0].id]);customer=next[0];}
  else{const [r]=await pool.query("INSERT INTO customers (name,email,phone,password_hash) VALUES (?,?,'',?)",[name,email,hash]);const [next]=await pool.query('SELECT * FROM customers WHERE id=?',[r.insertId]);customer=next[0];}
  setCustomerCookie(res,signCustomer(customer));res.status(201).json(publicCustomer(customer));
}
export async function login(req,res){const email=String(req.body?.email||'').trim().toLowerCase(),password=String(req.body?.password||'');if(!email||!password)throw new HttpError(400,'Email and password are required.');const [rows]=await pool.query('SELECT * FROM customers WHERE email=? LIMIT 1',[email]);const customer=rows[0];if(!customer?.password_hash||!(await bcrypt.compare(password,customer.password_hash)))throw new HttpError(401,'Invalid email or password.');setCustomerCookie(res,signCustomer(customer));res.json(publicCustomer(customer));}
export async function me(req,res){const [rows]=await pool.query('SELECT * FROM customers WHERE id=? LIMIT 1',[req.customer.sub]);if(!rows[0])throw new HttpError(401,'Customer account not found.');res.json(publicCustomer(rows[0]));}
export async function logout(_req,res){clearCustomerCookie(res);res.status(204).end();}

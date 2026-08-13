import { pool } from '../config/db.js';
import { HttpError } from '../utils/http.js';
import { couponDto } from '../services/serializers.js';
import { validateCoupon } from '../services/order.service.js';
function normalizeDate(value){if(!value)return null;return String(value).replace('T',' ').slice(0,19);}
function payload(b={}){return {code:String(b.code||'').trim().toUpperCase(),discount_percent:Number(b.discountPercent??b.discount_percent??0),is_active:b.isActive??b.is_active??true,min_subtotal:Number(b.minSubtotal??b.min_subtotal??0),max_discount:b.maxDiscount??b.max_discount??null,starts_at:normalizeDate(b.startsAt??b.starts_at),expires_at:normalizeDate(b.expiresAt??b.expires_at)}}
function valid(p){if(!p.code)throw new HttpError(400,'Coupon code is required.');if(p.discount_percent<=0||p.discount_percent>100)throw new HttpError(400,'Discount percent must be between 0 and 100.');if(p.min_subtotal<0)throw new HttpError(400,'Minimum subtotal cannot be negative.');}
export async function validate(req,res){res.json(await validateCoupon(req.body?.code,req.body?.subtotal));}
export async function list(_req,res){const [rows]=await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');res.json(rows.map(couponDto));}
export async function create(req,res){const p=payload(req.body);valid(p);const [r]=await pool.query('INSERT INTO coupons (code,discount_percent,is_active,min_subtotal,max_discount,starts_at,expires_at) VALUES (?,?,?,?,?,?,?)',Object.values(p));const [rows]=await pool.query('SELECT * FROM coupons WHERE id=?',[r.insertId]);res.status(201).json(couponDto(rows[0]));}
export async function update(req,res){const [rows]=await pool.query('SELECT * FROM coupons WHERE id=?',[req.params.id]);if(!rows[0])throw new HttpError(404,'Coupon not found.');const current=couponDto(rows[0]);const p=payload({...current,...req.body});valid(p);await pool.query('UPDATE coupons SET code=?,discount_percent=?,is_active=?,min_subtotal=?,max_discount=?,starts_at=?,expires_at=? WHERE id=?',[...Object.values(p),req.params.id]);const [next]=await pool.query('SELECT * FROM coupons WHERE id=?',[req.params.id]);res.json(couponDto(next[0]));}
export async function remove(req,res){const [r]=await pool.query('DELETE FROM coupons WHERE id=?',[req.params.id]);if(!r.affectedRows)throw new HttpError(404,'Coupon not found.');res.status(204).end();}

import { pool } from '../config/db.js';
import { HttpError } from '../utils/http.js';
import { pageDto } from '../services/serializers.js';
function payload(b={}){return {slug:String(b.slug||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'-'),title:String(b.title||'').trim(),excerpt:b.excerpt||'',body:b.body||'',seo_title:b.seoTitle??b.seo_title??'',seo_description:b.seoDescription??b.seo_description??'',is_published:b.isPublished??b.is_published??true}}
function valid(p){if(!p.slug||!p.title)throw new HttpError(400,'Page slug and title are required.');}
export async function publicList(_req,res){const [rows]=await pool.query('SELECT * FROM pages WHERE is_published=1 ORDER BY title');res.json(rows.map(pageDto));}
export async function publicOne(req,res){const [rows]=await pool.query('SELECT * FROM pages WHERE slug=? AND is_published=1 LIMIT 1',[req.params.slug]);if(!rows[0])throw new HttpError(404,'Page not found.');res.json(pageDto(rows[0]));}
export async function adminList(_req,res){const [rows]=await pool.query('SELECT * FROM pages ORDER BY updated_at DESC');res.json(rows.map(pageDto));}
export async function create(req,res){const p=payload(req.body);valid(p);const [r]=await pool.query('INSERT INTO pages (slug,title,excerpt,body,seo_title,seo_description,is_published) VALUES (?,?,?,?,?,?,?)',Object.values(p));const [rows]=await pool.query('SELECT * FROM pages WHERE id=?',[r.insertId]);res.status(201).json(pageDto(rows[0]));}
export async function update(req,res){const [rows]=await pool.query('SELECT * FROM pages WHERE id=?',[req.params.id]);if(!rows[0])throw new HttpError(404,'Page not found.');const p=payload({...pageDto(rows[0]),...req.body});valid(p);await pool.query('UPDATE pages SET slug=?,title=?,excerpt=?,body=?,seo_title=?,seo_description=?,is_published=? WHERE id=?',[...Object.values(p),req.params.id]);const [next]=await pool.query('SELECT * FROM pages WHERE id=?',[req.params.id]);res.json(pageDto(next[0]));}
export async function remove(req,res){const [r]=await pool.query('DELETE FROM pages WHERE id=?',[req.params.id]);if(!r.affectedRows)throw new HttpError(404,'Page not found.');res.status(204).end();}

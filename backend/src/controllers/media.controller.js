import fs from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http.js';

export async function list(_req,res){const [rows]=await pool.query('SELECT * FROM media_files ORDER BY created_at DESC');res.json(rows.map(r=>({id:String(r.id),fileName:r.file_name,url:r.url,mimeType:r.mime_type,fileSize:Number(r.file_size),createdAt:r.created_at})));}
export async function uploaded(req,res){if(!req.file)throw new HttpError(400,'Image file is required.');const url=`/uploads/${req.file.filename}`;const [r]=await pool.query('INSERT INTO media_files (file_name,stored_name,mime_type,file_size,url) VALUES (?,?,?,?,?)',[req.file.originalname,req.file.filename,req.file.mimetype,req.file.size,url]);res.status(201).json({id:String(r.insertId),fileName:req.file.originalname,url,mimeType:req.file.mimetype,fileSize:req.file.size});}
export async function remove(req,res){const [rows]=await pool.query('SELECT * FROM media_files WHERE id=?',[req.params.id]);if(!rows[0])throw new HttpError(404,'Media file not found.');await pool.query('DELETE FROM media_files WHERE id=?',[req.params.id]);const full=path.resolve(env.uploadDir,rows[0].stored_name);await fs.unlink(full).catch(()=>{});res.status(204).end();}

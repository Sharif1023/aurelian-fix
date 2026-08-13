import { pool } from '../config/db.js';
import { HttpError } from '../utils/http.js';
import { createOrder, getOrder, listOrders, trackOrder, updateStatus } from '../services/order.service.js';

export async function create(req,res){res.status(201).json(await createOrder(req.body));}
export async function track(req,res){res.json(await trackOrder(req.body?.orderNumber,req.body?.identifier));}
export async function adminList(_req,res){res.json(await listOrders());}
export async function adminOne(req,res){const order=await getOrder(req.params.id);if(!order)throw new HttpError(404,'Order not found.');res.json(order);}
export async function status(req,res){res.json(await updateStatus(req.params.id,req.body?.status));}
export async function remove(req,res){const [r]=await pool.query('DELETE FROM orders WHERE id=?',[req.params.id]);if(!r.affectedRows)throw new HttpError(404,'Order not found.');res.status(204).end();}

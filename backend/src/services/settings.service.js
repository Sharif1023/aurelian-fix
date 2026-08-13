import { pool } from '../config/db.js';
import { parseJson } from '../utils/json.js';

export async function getSetting(key, db=pool) {
  const [rows]=await db.query('SELECT setting_value FROM settings WHERE setting_key=? LIMIT 1',[key]);
  return rows[0] ? parseJson(rows[0].setting_value,{}) : {};
}
export async function setSetting(key,value,db=pool) {
  await db.query('INSERT INTO settings (setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)',[key,JSON.stringify(value)]);
  return value;
}

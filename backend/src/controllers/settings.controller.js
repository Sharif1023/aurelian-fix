import { getSetting,setSetting } from '../services/settings.service.js';
export async function getStore(_req,res){res.json(await getSetting('store_settings'));}
export async function getHome(_req,res){res.json(await getSetting('home_settings'));}
export async function putStore(req,res){res.json(await setSetting('store_settings',req.body||{}));}
export async function putHome(req,res){res.json(await setSetting('home_settings',req.body||{}));}

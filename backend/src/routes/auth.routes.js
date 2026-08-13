import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../utils/http.js';
import { requireAdmin } from '../middleware/auth.js';
import * as auth from '../controllers/auth.controller.js';
const router=Router();
const loginLimiter=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:'draft-8',legacyHeaders:false,message:{message:'Too many login attempts. Try again later.'}});
router.post('/login',loginLimiter,asyncHandler(auth.login));router.get('/me',requireAdmin,asyncHandler(auth.me));router.post('/logout',asyncHandler(auth.logout));
export default router;

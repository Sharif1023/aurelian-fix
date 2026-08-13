import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../utils/http.js';
import { requireCustomer } from '../middleware/customer-auth.js';
import * as auth from '../controllers/customer-auth.controller.js';
const router=Router();const limiter=rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:'draft-8',legacyHeaders:false,message:{message:'Too many authentication attempts. Try again later.'}});
router.post('/register',limiter,asyncHandler(auth.register));router.post('/login',limiter,asyncHandler(auth.login));router.get('/me',requireCustomer,asyncHandler(auth.me));router.post('/logout',asyncHandler(auth.logout));export default router;

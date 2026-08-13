import {
  Router,
} from 'express';

import {
  requireAdmin,
} from '../middleware/auth.js';

import {
  asyncHandler,
} from '../utils/http.js';

import {
  getAdminAccount,
  updateAdminAccount,
} from '../services/adminAccount.service.js';


const router =
  Router();


/* =========================================
   PROTECTED
========================================= */

router.use(
  requireAdmin,
);


/* =========================================
   GET ADMIN ACCOUNT
========================================= */

router.get(
  '/',
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const account =
        await getAdminAccount(
          req.admin.sub,
        );


      res.json(
        account,
      );
    },
  ),
);


/* =========================================
   UPDATE ADMIN ACCOUNT
========================================= */

router.put(
  '/',
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const account =
        await updateAdminAccount(
          req.admin.sub,
          req.body,
        );


      res.json({
        success: true,
        account,
      });
    },
  ),
);


export default router;
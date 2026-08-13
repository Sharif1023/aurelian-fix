import bcrypt from 'bcryptjs';

import { pool } from '../config/db.js';
import { HttpError } from '../utils/http.js';

import {
  clearAdminCookie,
  setAdminCookie,
  signAdmin,
} from '../middleware/auth.js';


function normalizeLoginSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}


/* =========================================
   CHECK LOGIN URL
========================================= */

export async function checkLoginUrl(
  req,
  res,
) {
  const loginSlug =
    normalizeLoginSlug(
      req.params?.loginSlug,
    );


  if (!loginSlug) {
    throw new HttpError(
      404,
      'Admin login page not found.',
    );
  }


  const [rows] =
    await pool.query(
      `
        SELECT id
        FROM admins
        WHERE login_slug = ?
          AND is_active = 1
        LIMIT 1
      `,
      [
        loginSlug,
      ],
    );


  if (!rows[0]) {
    throw new HttpError(
      404,
      'Admin login page not found.',
    );
  }


  res.json({
    valid: true,
  });
}


/* =========================================
   LOGIN
========================================= */

export async function login(
  req,
  res,
) {
  const loginValue =
    String(
      req.body?.login ||
        '',
    ).trim();


  const password =
    String(
      req.body?.password ||
        '',
    );


  const loginSlug =
    normalizeLoginSlug(
      req.body?.loginSlug,
    );


  if (
    !loginValue ||
    !password ||
    !loginSlug
  ) {
    throw new HttpError(
      400,
      'Login, password and admin login URL are required.',
    );
  }


  const [rows] =
    await pool.query(
      `
        SELECT *
        FROM admins
        WHERE (
          username = ?
          OR email = ?
        )
        AND is_active = 1
        LIMIT 1
      `,
      [
        loginValue,
        loginValue.toLowerCase(),
      ],
    );


  const admin =
    rows[0];


  if (!admin) {
    throw new HttpError(
      401,
      'Invalid admin credentials.',
    );
  }


  /* =====================================
     CHECK LOGIN URL
  ===================================== */

  if (
    String(
      admin.login_slug ||
        '',
    ) !== loginSlug
  ) {
    throw new HttpError(
      401,
      'Invalid admin login URL.',
    );
  }


  /* =====================================
     CHECK PASSWORD
  ===================================== */

  const passwordValid =
    await bcrypt.compare(
      password,
      admin.password_hash,
    );


  if (!passwordValid) {
    throw new HttpError(
      401,
      'Invalid admin credentials.',
    );
  }


  /* =====================================
     LAST LOGIN
  ===================================== */

  await pool.query(
    `
      UPDATE admins
      SET last_login_at = NOW()
      WHERE id = ?
    `,
    [
      admin.id,
    ],
  );


  /* =====================================
     LOGIN COOKIE
  ===================================== */

  setAdminCookie(
    res,
    signAdmin(
      admin,
    ),
  );


  /* =====================================
     RESPONSE
  ===================================== */

  res.json({
    id:
      String(
        admin.id,
      ),

    username:
      admin.username,

    email:
      admin.email,

    loginSlug:
      admin.login_slug,

    role:
      admin.role,
  });
}


/* =========================================
   CURRENT ADMIN
========================================= */

export async function me(
  req,
  res,
) {
  const [rows] =
    await pool.query(
      `
        SELECT
          id,
          username,
          email,
          login_slug AS loginSlug,
          role,
          is_active AS isActive,
          last_login_at AS lastLoginAt,
          created_at AS createdAt
        FROM admins
        WHERE id = ?
          AND is_active = 1
        LIMIT 1
      `,
      [
        req.admin.sub,
      ],
    );


  if (!rows[0]) {
    throw new HttpError(
      401,
      'Admin account is unavailable.',
    );
  }


  res.json({
    ...rows[0],

    id:
      String(
        rows[0].id,
      ),
  });
}


/* =========================================
   LOGOUT
========================================= */

export async function logout(
  _req,
  res,
) {
  clearAdminCookie(
    res,
  );

  res
    .status(204)
    .end();
}
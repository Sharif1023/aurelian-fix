import bcrypt from 'bcryptjs';

import { pool } from '../config/db.js';
import { HttpError } from '../utils/http.js';


function normalizeLoginSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}


function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}


function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value,
  );
}


/* =========================================
   GET CURRENT ADMIN ACCOUNT
========================================= */

export async function getAdminAccount(
  adminId,
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
        adminId,
      ],
    );


  const admin =
    rows[0];


  if (!admin) {
    throw new HttpError(
      404,
      'Admin account not found.',
    );
  }


  return {
    ...admin,

    id:
      String(
        admin.id,
      ),
  };
}


/* =========================================
   UPDATE ADMIN ACCOUNT
========================================= */

export async function updateAdminAccount(
  adminId,
  payload = {},
) {
  const currentPassword =
    String(
      payload.currentPassword ||
        '',
    );


  const newPassword =
    String(
      payload.newPassword ||
        '',
    );


  /* =====================================
     CURRENT PASSWORD REQUIRED
  ===================================== */

  if (!currentPassword) {
    throw new HttpError(
      400,
      'Current password is required.',
    );
  }


  /* =====================================
     FIND CURRENT ADMIN
  ===================================== */

  const [rows] =
    await pool.query(
      `
        SELECT
          id,
          username,
          email,
          password_hash,
          login_slug,
          role,
          is_active
        FROM admins
        WHERE id = ?
          AND is_active = 1
        LIMIT 1
      `,
      [
        adminId,
      ],
    );


  const admin =
    rows[0];


  if (!admin) {
    throw new HttpError(
      404,
      'Admin account not found.',
    );
  }


  /* =====================================
     VERIFY CURRENT PASSWORD
  ===================================== */

  const passwordMatches =
    await bcrypt.compare(
      currentPassword,
      admin.password_hash,
    );


  if (!passwordMatches) {
    throw new HttpError(
      401,
      'Current password is incorrect.',
    );
  }


  /* =====================================
     EMAIL
  ===================================== */

  const email =
    normalizeEmail(
      payload.email ||
        admin.email,
    );


  if (
    !validEmail(
      email,
    )
  ) {
    throw new HttpError(
      400,
      'Enter a valid login email.',
    );
  }


  /* =====================================
     LOGIN URL SLUG
  ===================================== */

  const loginSlug =
    normalizeLoginSlug(
      payload.loginSlug ||
        admin.login_slug ||
        'admin-login',
    );


  if (
    loginSlug.length <
      3 ||
    loginSlug.length >
      120
  ) {
    throw new HttpError(
      400,
      'Login URL must be between 3 and 120 characters.',
    );
  }


  /* =====================================
     EMAIL DUPLICATE CHECK
  ===================================== */

  const [emailRows] =
    await pool.query(
      `
        SELECT id
        FROM admins
        WHERE email = ?
          AND id <> ?
        LIMIT 1
      `,
      [
        email,
        adminId,
      ],
    );


  if (
    emailRows.length >
    0
  ) {
    throw new HttpError(
      409,
      'This login email is already in use.',
    );
  }


  /* =====================================
     LOGIN URL DUPLICATE CHECK
  ===================================== */

  const [slugRows] =
    await pool.query(
      `
        SELECT id
        FROM admins
        WHERE login_slug = ?
          AND id <> ?
        LIMIT 1
      `,
      [
        loginSlug,
        adminId,
      ],
    );


  if (
    slugRows.length >
    0
  ) {
    throw new HttpError(
      409,
      'This login URL is already in use.',
    );
  }


  /* =====================================
     NEW PASSWORD
  ===================================== */

  let passwordHash =
    admin.password_hash;


  if (newPassword) {
    if (
      newPassword.length <
      10
    ) {
      throw new HttpError(
        400,
        'New password must be at least 10 characters.',
      );
    }


    passwordHash =
      await bcrypt.hash(
        newPassword,
        12,
      );
  }


  /* =====================================
     UPDATE DATABASE
  ===================================== */

  await pool.query(
    `
      UPDATE admins
      SET
        email = ?,
        login_slug = ?,
        password_hash = ?
      WHERE id = ?
    `,
    [
      email,
      loginSlug,
      passwordHash,
      adminId,
    ],
  );


  return {
    id:
      String(
        admin.id,
      ),

    username:
      admin.username,

    email,

    loginSlug,

    role:
      admin.role,
  };
}
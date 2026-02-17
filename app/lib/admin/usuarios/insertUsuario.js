'use server';

import { isIP } from 'node:net';

import { pool } from '../../../../config/conectPRICINGDB';

function normalizeString(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  const email = value.trim();
  if (!email) return false;
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const insertUsuario = async (payload) => {
  const resInsert = {};

  const nombre = normalizeString(payload?.nombre);
  const apellidos = normalizeString(payload?.apellidos);
  const correo = normalizeString(payload?.correo);
  const ip = normalizeString(payload?.ip);

  if (!nombre) {
    resInsert.state = 400;
    resInsert.message = 'Nombre es requerido.';
    return JSON.parse(JSON.stringify(resInsert));
  }
  if (!apellidos) {
    resInsert.state = 400;
    resInsert.message = 'Apellidos es requerido.';
    return JSON.parse(JSON.stringify(resInsert));
  }
  if (!isValidEmail(correo)) {
    resInsert.state = 400;
    resInsert.message = 'Correo inválido.';
    return JSON.parse(JSON.stringify(resInsert));
  }
  if (isIP(ip) === 0) {
    resInsert.state = 400;
    resInsert.message = 'IP inválida.';
    return JSON.parse(JSON.stringify(resInsert));
  }

  try {
    try {
      const [rows] = await pool.query('CALL insertUsuario(?,?,?,?)', [nombre, apellidos, correo, ip]);
      const insertedId = rows?.[0]?.[0]?.idusuarios ?? null;

      resInsert.state = 200;
      resInsert.data = { idusuarios: insertedId };
      return JSON.parse(JSON.stringify(resInsert));
    } catch (e) {
      const [result] = await pool.query('INSERT INTO usuarios (nombre, apellidos, correo, ip) VALUES (?,?,?,?)', [
        nombre,
        apellidos,
        correo,
        ip,
      ]);

      resInsert.state = 200;
      resInsert.data = { idusuarios: result?.insertId ?? null };
      return JSON.parse(JSON.stringify(resInsert));
    }
  } catch (e) {
    console.error(e);
    resInsert.state = 500;
    resInsert.message = e?.sqlMessage || e?.message || 'Error insertando usuario.';
    resInsert.code = e?.code;
    return JSON.parse(JSON.stringify(resInsert));
  }
};

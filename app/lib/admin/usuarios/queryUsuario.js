'use server';

import { pool } from '../../../../config/conectPRICINGDB';

export const queryUsuario = async (req) => {

    const resUser = {};
    const sqlString = `CALL queryUsuario(?)`;

    try {

        const [rows] = await pool.query(sqlString, [req]);
        console.log(rows);
        resUser.state = 200;
        resUser.data = rows[0][0];
        return JSON.parse(JSON.stringify(resUser));

    } catch (e) {
        console.error(e);
        return JSON.parse(JSON.stringify(e));
    };
};
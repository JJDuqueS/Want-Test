'use server';

import { pool } from '../../../../config/conectPRICINGDB';

export const queryListarUsuarios = async () => {

    const listadousuarios = {};
    const sqlString = `CALL queryListUsuarios()`;

    try {

        const [rows] = await pool.query(sqlString);

        listadousuarios.state = 200;
        listadousuarios.data = rows[0];
        return JSON.parse(JSON.stringify(listadousuarios));

    } catch (e) {
        console.error(e);
        return JSON.parse(JSON.stringify(e));
    };
};
'use server';

import { pool } from '../../../../config/conectPRICINGDB';

export const queryListarCiudad = async () => {

    const listadoCiudad = {};
    const sqlString = `CALL queryListCiudad()`;

    try {

        const [rows] = await pool.query(sqlString);

        listadoCiudad.state = 200;
        listadoCiudad.data = rows[0];
        return JSON.parse(JSON.stringify(listadoCiudad));

    } catch (e) {
        console.error(e);
        return JSON.parse(JSON.stringify(e));
    };
};
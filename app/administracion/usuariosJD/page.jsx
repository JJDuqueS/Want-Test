import Link from 'next/link';

import UsuariosJDClient from './usuariosJDClient';
import { queryListarCiudad } from '../../lib/admin/usuarios/queryListarCiudad';
import { queryListarUsuarios } from '../../lib/admin/usuarios/queryListarUsuarios';

export const dynamic = 'force-dynamic';

export default async function UsuariosJDPage() {
  const [listRes, ciudadesRes] = await Promise.all([queryListarUsuarios(), queryListarCiudad()]);

  const usuarios = listRes?.state === 200 ? listRes.data : [];
  const ciudades = ciudadesRes?.state === 200 ? ciudadesRes.data : [];

  const listError =
    listRes?.state === 200 ? null : listRes?.message || listRes?.sqlMessage || 'Error consultando usuarios.';
  const ciudadesError =
    ciudadesRes?.state === 200 ? null : ciudadesRes?.message || ciudadesRes?.sqlMessage || 'Error consultando ciudades.';

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <Link href="/" className="text-sm text-gray-600 underline underline-offset-2">
              ← Inicio
            </Link>
            <h1 className="text-3xl font-bold">Administración · Usuarios</h1>
            <p className="text-sm text-gray-600">
              Fase 1: Grid de usuarios + Modal de usuario (ver / insertar).
            </p>
          </div>
        </header>

        {listError ? <p className="text-sm text-red-700">{listError}</p> : null}
        {ciudadesError ? <p className="text-sm text-red-700">{ciudadesError}</p> : null}

        <UsuariosJDClient initialUsuarios={usuarios} initialCiudades={ciudades} />
      </div>
    </main>
  );
}

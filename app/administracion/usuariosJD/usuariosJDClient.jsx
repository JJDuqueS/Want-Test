'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { FaEye, FaPlus, FaTimes } from 'react-icons/fa';

import { queryUsuario } from '../../lib/admin/usuarios/queryUsuario';
import { queryListarUsuarios } from '../../lib/admin/usuarios/queryListarUsuarios';
import { insertUsuario } from '../../lib/admin/usuarios/insertUsuario';
import { queryCountryByIp } from '../../lib/admin/geo/queryCountryByIp';

function parseId(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function normalizeErrorMessage(errorLike, fallback) {
  if (!errorLike) return fallback;
  if (typeof errorLike === 'string') return errorLike;
  return errorLike.message || errorLike.sqlMessage || fallback;
}

const emptyUsuario = {
  idusuarios: '',
  nombre: '',
  apellidos: '',
  correo: '',
  ip: '',
  ciudad: '',
  region: '',
};

export default function UsuariosJDClient({ initialUsuarios, initialCiudades }) {
  const latestGeoRequestIpRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('view'); // 'view' | 'insert'
  const [usuario, setUsuario] = useState(emptyUsuario);
  const [modalError, setModalError] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isPending, startTransition] = useTransition();

  const ciudades = useMemo(() => {
    const list = Array.isArray(initialCiudades) ? initialCiudades : [];
    return list
      .map((c) => ({
        ciudad: c.ciudad ?? '',
        ip: c.ip ?? '',
      }))
      .filter((c) => c.ciudad && c.ip);
  }, [initialCiudades]);

  const [usuarios, setUsuarios] = useState(() => (Array.isArray(initialUsuarios) ? initialUsuarios : []));

  async function fetchAndApplyRegionByIp(ipValue) {
    const requestedIp = ipValue ? String(ipValue) : '';
    if (!requestedIp) return;

    latestGeoRequestIpRef.current = requestedIp;

    try {
      const geoRes = await queryCountryByIp(requestedIp);
      if (latestGeoRequestIpRef.current !== requestedIp) return;

      if (geoRes?.state === 200 && geoRes?.data?.country) {
        setUsuario((prev) =>
          String(prev.ip) === requestedIp ? { ...prev, region: geoRes.data.country } : prev,
        );
        return;
      }

      if (geoRes?.state && geoRes?.state !== 200) {
        setGeoError(normalizeErrorMessage(geoRes, 'No se pudo obtener la region.'));
      }
    } catch (err) {
      if (latestGeoRequestIpRef.current !== requestedIp) return;
      setGeoError(normalizeErrorMessage(err, 'Error consultando la region.'));
    }
  }

  async function refreshUsuariosList() {
    try {
      const listRes = await queryListarUsuarios();
      if (listRes?.state === 200 && Array.isArray(listRes.data)) {
        setUsuarios(listRes.data);
        return true;
      }
    } catch {
      // ignore, queryListarUsuarios() ya tiene catch
    }
    return false;
  }

  function validateInsertForm(currentUsuario) {
    const nombre = currentUsuario?.nombre?.trim();
    const apellidos = currentUsuario?.apellidos?.trim();
    const correo = currentUsuario?.correo?.trim();
    const ip = currentUsuario?.ip?.trim();

    if (!nombre) return 'Nombre es requerido.';
    if (!apellidos) return 'Apellidos es requerido.';
    if (!correo) return 'Correo es requerido.';
    if (!correo.includes('@')) return 'Correo inválido.';
    if (!ip) return 'Debe seleccionar una ciudad.';

    return null;
  }

  function handleGuardar() {
    if (mode !== 'insert') return;

    setModalError(null);
    setGeoError(null);
    setSuccessMessage(null);

    const validationError = validateInsertForm(usuario);
    if (validationError) {
      setModalError(validationError);
      return;
    }

    const payload = {
      nombre: usuario.nombre?.trim(),
      apellidos: usuario.apellidos?.trim(),
      correo: usuario.correo?.trim(),
      ip: usuario.ip?.trim(),
    };

    const optimisticRow = {
      idusuarios: null,
      nombre: payload.nombre,
      apellidos: payload.apellidos,
      correo: payload.correo,
      ip: payload.ip,
      ciudad: usuario.ciudad ?? '',
    };

    startTransition(async () => {
      try {
        const insertRes = await insertUsuario(payload);
        if (insertRes?.state !== 200) {
          setModalError(normalizeErrorMessage(insertRes, 'No se pudo insertar el usuario.'));
          return;
        }

        const insertedId = insertRes?.data?.idusuarios ?? null;

        const refreshed = await refreshUsuariosList();
        if (!refreshed && insertedId) {
          setUsuarios((prev) => [{ ...optimisticRow, idusuarios: insertedId }, ...prev]);
        }

        closeModal();
        setSuccessMessage(
          `Usuario insertado${insertedId ? ` (id=${insertedId})` : ''}.${refreshed ? '' : ' (Si no ves el cambio, recarga la página.)'}`,
        );
      } catch (e) {
        setModalError(normalizeErrorMessage(e, 'Error insertando el usuario.'));
      }
    });
  }

  function closeModal() {
    latestGeoRequestIpRef.current = null;
    setIsOpen(false);
    setModalError(null);
    setGeoError(null);
    setUsuario(emptyUsuario);
  }

  function openInsert() {
    latestGeoRequestIpRef.current = null;
    setMode('insert');
    setUsuario(emptyUsuario);
    setModalError(null);
    setGeoError(null);
    setSuccessMessage(null);
    setIsOpen(true);
  }

  function openView(userId) {
    const id = parseId(userId);
    latestGeoRequestIpRef.current = null;
    setMode('view');
    setUsuario(emptyUsuario);
    setModalError(null);
    setGeoError(null);
    setIsOpen(true);

    if (!id) {
      setModalError('ID de usuario inválido.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await queryUsuario(id);
        if (res?.state !== 200 || !res?.data) {
          setModalError(normalizeErrorMessage(res, `No se pudo consultar el usuario con id=${id}.`));
          return;
        }
        const nextUsuario = { ...emptyUsuario, ...res.data, region: '' };
        setUsuario(nextUsuario);

        if (nextUsuario.ip) {
          await fetchAndApplyRegionByIp(nextUsuario.ip);
        }
      } catch (e) {
        setModalError(normalizeErrorMessage(e, 'Error consultando el usuario.'));
      }
    });
  }

  const canSave = mode === 'insert';

  return (
    <section className="rounded-lg border bg-white p-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Grid de usuarios</h2>
          <p className="text-sm text-gray-600">{usuarios.length} usuario(s)</p>
        </div>
        <button
          type="button"
          onClick={openInsert}
          className="inline-flex items-center justify-center gap-2 rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
        >
          <FaPlus aria-hidden="true" />
          Insertar
        </button>
      </div>

      {successMessage ? (
        <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          {successMessage}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="whitespace-nowrap px-3 py-2">ID</th>
              <th className="whitespace-nowrap px-3 py-2">Nombre</th>
              <th className="whitespace-nowrap px-3 py-2">Apellido</th>
              <th className="whitespace-nowrap px-3 py-2">Correo</th>
              <th className="whitespace-nowrap px-3 py-2">Ciudad</th>
              <th className="whitespace-nowrap px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.idusuarios} className="border-b last:border-b-0">
                <td className="whitespace-nowrap px-3 py-2">{u.idusuarios}</td>
                <td className="whitespace-nowrap px-3 py-2">{u.nombre}</td>
                <td className="whitespace-nowrap px-3 py-2">{u.apellidos}</td>
                <td className="whitespace-nowrap px-3 py-2">{u.correo}</td>
                <td className="whitespace-nowrap px-3 py-2">{u.ciudad}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <button
                    type="button"
                    onClick={() => openView(u.idusuarios)}
                    className="inline-flex items-center gap-2 font-semibold text-blue-700 underline underline-offset-2"
                  >
                    <FaEye aria-hidden="true" />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-gray-600" colSpan={6}>
                  Sin datos para mostrar.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Modal usuario"
        >
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Modal usuario</p>
                <h3 className="text-lg font-semibold">{mode === 'insert' ? 'Insertar usuario' : 'Ver usuario'}</h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded p-2 text-gray-600 hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <FaTimes aria-hidden="true" />
              </button>
            </div>

              <div className="space-y-4 p-4">
                {modalError ? <p className="text-sm text-red-700">{modalError}</p> : null}
                {geoError ? <p className="text-sm text-amber-800">{geoError}</p> : null}
                {isPending ? <p className="text-sm text-gray-600">Procesando…</p> : null}

                <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-medium">Nombre</span>
                  <input
                    value={usuario.nombre ?? ''}
                    onChange={(e) => setUsuario((prev) => ({ ...prev, nombre: e.target.value }))}
                    className="w-full rounded border px-3 py-2"
                    disabled={mode === 'view'}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Apellidos</span>
                  <input
                    value={usuario.apellidos ?? ''}
                    onChange={(e) => setUsuario((prev) => ({ ...prev, apellidos: e.target.value }))}
                    className="w-full rounded border px-3 py-2"
                    disabled={mode === 'view'}
                  />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-medium">Correo</span>
                  <input
                    type="email"
                    value={usuario.correo ?? ''}
                    onChange={(e) => setUsuario((prev) => ({ ...prev, correo: e.target.value }))}
                    className="w-full rounded border px-3 py-2"
                    disabled={mode === 'view'}
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium">Ciudad</span>
                  <select
                    value={usuario.ip ?? ''}
                    onChange={(e) => {
                      const ip = e.target.value;
                      const ciudad = ciudades.find((c) => c.ip === ip)?.ciudad ?? '';
                      setGeoError(null);
                      setUsuario((prev) => ({ ...prev, ip, ciudad, region: '' }));

                      if (ip) {
                        const selectedIp = String(ip);
                        startTransition(async () => {
                          await fetchAndApplyRegionByIp(selectedIp);
                        });
                      }
                    }}
                    className="w-full rounded border px-3 py-2"
                    disabled={mode === 'view'}
                  >
                    <option value="">Seleccione…</option>
                    {ciudades.map((c) => (
                      <option key={c.ip} value={c.ip}>
                        {c.ciudad}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium">Región</span>
                  <input
                    value={usuario.region ?? ''}
                    readOnly
                    className="w-full rounded border bg-gray-50 px-3 py-2 text-gray-700"
                    placeholder="(Obtenida por IP)"
                  />
                </label>

                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-medium">IP</span>
                  <input
                    value={usuario.ip ?? ''}
                    readOnly
                    className="w-full rounded border bg-gray-50 px-3 py-2 text-gray-700"
                    placeholder="(Seleccionada por ciudad)"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t p-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded border px-4 py-2 font-semibold text-gray-800 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!canSave || isPending}
                onClick={handleGuardar}
                className={[
                  'rounded px-4 py-2 font-semibold text-white',
                  canSave && !isPending ? 'bg-red-500 hover:bg-red-600' : 'cursor-not-allowed bg-gray-300',
                ].join(' ')}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

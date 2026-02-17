# Want-Test (Proyecto de prueba)

Aplicación de **Next.js 14** (App Router) con **MySQL** para un flujo simple de **administración de usuarios**:

- Listar usuarios (grid)
- Ver detalle de un usuario (modal)
- Insertar usuario (modal)
- Consultar región/país por IP usando `country.is`

La pantalla principal de la prueba está en: `http(s)://localhost:3000/administracion/usuariosJD`

Documento de referencia de la prueba: `doc/Fase_1_prueba_tecnica.docx`.

## Requisitos

- Node.js **18.17+** (recomendado Node 20)
- MySQL 8+ (o compatible) con acceso de red desde tu máquina

## Configuración

### 1) Instalar dependencias

```bash
npm install
```

### 2) Variables de entorno

Crea un archivo `.env.local` en la raíz del repo:

```bash
DB_USER_MYSQL=
DB_PASS_MYSQL=
DB_HOST_MYSQL=
DB_NAME_MYSQL=
DB_PORT_MYSQL=3306

# (Opcional) Servicio Geo por IP. Por defecto usa https://api.country.is
URL_HOST_GEO=https://api.country.is
```

### 3) Base de datos (mínimo necesario)

El proyecto consulta **procedimientos almacenados** para listar/consultar usuarios y ciudades:

- `queryListUsuarios()`
- `queryListCiudad()`
- `queryUsuario(id)`
- (Opcional) `insertUsuario(nombre, apellidos, correo, ip)`

En `app/database/` tienes los scripts de referencia para estos procedimientos.

Tablas mínimas esperadas (referencia):

```sql
CREATE TABLE region (
  ip VARCHAR(45) PRIMARY KEY,
  ciudad VARCHAR(100) NOT NULL
);

CREATE TABLE usuarios (
  idusuarios INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  ip VARCHAR(45) NOT NULL
);
```

Carga al menos una fila en `region` para que el selector de ciudades tenga opciones:

```sql
INSERT INTO region (ip, ciudad) VALUES ('8.8.8.8', 'Ciudad demo');
```

Nota: el alta de usuarios se hace con la IP asociada a una ciudad en `region`.

## Ejecutar en local

### Modo desarrollo

```bash
npm run dev
```

Este proyecto ejecuta `next dev --experimental-https`, por lo que abre en **HTTPS**. Si ves un warning de certificado, es normal (dev). Si en tu entorno falla el HTTPS, quita el flag `--experimental-https` del script `dev` en `package.json` y vuelve a intentar.

### Navegar

- Home: `http(s)://localhost:3000/`
- Usuarios (prueba): `http(s)://localhost:3000/administracion/usuariosJD`

## Build / Producción

Build:

```bash
npm run build
```

Opción A (servidor estándar de Next):

```bash
npm run start
```

Opción B (servidor custom incluido en `server.js`):

```bash
# PowerShell
$env:NODE_ENV="production"; node server.js
```

## Docker (opcional)

```bash
docker build -t want-test .
docker run --rm -p 3000:3000 --env-file .env.local want-test
```

## Notas

- El script `npm test` no está configurado para este proyecto (referencia a `react-scripts`).
- La consulta de región por IP usa `country.is`; si el servicio no responde, el formulario sigue funcionando, solo que la región puede quedar vacía.

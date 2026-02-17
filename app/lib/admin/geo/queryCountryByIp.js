'use server';

import { isIP } from 'node:net';

const DEFAULT_BASE_URL = 'https://api.country.is';
const DEFAULT_TIMEOUT_MS = 5000;

function buildBaseUrl() {
  const explicitBaseUrl = process.env.COUNTRY_IS_BASE_URL?.trim();
  if (explicitBaseUrl) {
    try {
      return new URL(explicitBaseUrl);
    } catch {
      return new URL(DEFAULT_BASE_URL);
    }
  }

  const host = process.env.URL_HOST_GEO?.trim();
  const port = process.env.URL_PORT_GEO?.trim();
  const path = process.env.URL_PATH_GEO?.trim();

  if (!host) return new URL(DEFAULT_BASE_URL);

  let baseUrl;
  try {
    baseUrl = new URL(/^https?:\/\//i.test(host) ? host : `https://${host}`);
  } catch {
    return new URL(DEFAULT_BASE_URL);
  }

  if (port) baseUrl.port = port;
  if (path) baseUrl.pathname = path.startsWith('/') ? path : `/${path}`;

  return baseUrl;
}

function joinPath(prefix, suffix) {
  const cleanPrefix = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
  const cleanSuffix = suffix.startsWith('/') ? suffix.slice(1) : suffix;
  if (!cleanPrefix) return `/${cleanSuffix}`;
  if (!cleanSuffix) return cleanPrefix;
  return `${cleanPrefix}/${cleanSuffix}`;
}

export const queryCountryByIp = async (ip) => {
  const resGeo = {};

  if (typeof ip !== 'string' || isIP(ip) === 0) {
    resGeo.state = 400;
    resGeo.message = 'IP inválida.';
    return JSON.parse(JSON.stringify(resGeo));
  }

  const baseUrl = buildBaseUrl();
  const url = new URL(baseUrl);
  url.pathname = joinPath(url.pathname, encodeURIComponent(ip));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      resGeo.state = response.status;
      resGeo.message = `Error consultando Country.is (HTTP ${response.status}).`;
      return JSON.parse(JSON.stringify(resGeo));
    }

    const data = await response.json();

    resGeo.state = 200;
    resGeo.data = {
      ip: data?.ip ?? ip,
      country: data?.country ?? null,
    };

    return JSON.parse(JSON.stringify(resGeo));
  } catch (e) {
    console.error(e);
    resGeo.state = 500;
    resGeo.message = e?.name === 'AbortError' ? 'Timeout consultando Country.is.' : 'Error consultando Country.is.';
    return JSON.parse(JSON.stringify(resGeo));
  } finally {
    clearTimeout(timeout);
  }
};


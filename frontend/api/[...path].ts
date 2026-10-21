import { resolveEnvironmentConfig } from '../environment.js';

declare const process: {
  env: Record<string, string | undefined>;
};

type ProxyRequest = AsyncIterable<Uint8Array> & {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
};

type ProxyResponse = {
  statusCode: number;
  setHeader(name: string, value: number | string | string[]): void;
  end(data?: string | Uint8Array): void;
};

const hopByHopHeaders = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'expect',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade'
]);

function sendJson(response: ProxyResponse, statusCode: number, error: string) {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify({ error }));
}

async function readBody(request: ProxyRequest): Promise<ArrayBuffer> {
  const chunks: Uint8Array[] = [];
  let size = 0;

  for await (const chunk of request) {
    chunks.push(chunk);
    size += chunk.byteLength;
  }

  const body = new ArrayBuffer(size);
  const bodyView = new Uint8Array(body);
  let offset = 0;
  for (const chunk of chunks) {
    bodyView.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body;
}

export default async function handler(request: ProxyRequest, response: ProxyResponse) {
  let backendUrl: URL;
  let incomingUrl: URL;
  try {
    const config = resolveEnvironmentConfig(process.env, 'production');
    backendUrl = new URL(config.backendUrl);
    incomingUrl = new URL(request.url ?? '/', backendUrl);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'A configuração do ambiente é inválida.';
    sendJson(response, 503, message);
    return;
  }

  const apiPath = incomingUrl.pathname.replace(/^\/api(?=\/|$)/, '');
  if (!/^\/(?:auth|daytron)(?:\/|$)/.test(apiPath)) {
    sendJson(response, 404, 'Rota da API não encontrada.');
    return;
  }

  backendUrl.pathname = `${backendUrl.pathname.replace(/\/+$/, '')}${apiPath}`;
  backendUrl.search = incomingUrl.search;

  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (!value || hopByHopHeaders.has(name.toLowerCase())) continue;
    headers.set(name, Array.isArray(value) ? value.join(name.toLowerCase() === 'cookie' ? '; ' : ', ') : value);
  }

  const method = request.method ?? 'GET';
  try {
    const body = method === 'GET' || method === 'HEAD' ? undefined : await readBody(request);
    const upstream = await fetch(backendUrl, { method, headers, body });

    for (const [name, value] of upstream.headers) {
      if (name.toLowerCase() === 'set-cookie' || hopByHopHeaders.has(name.toLowerCase())) continue;
      response.setHeader(name, value);
    }

    const setCookies = typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : [upstream.headers.get('set-cookie')].filter((value): value is string => Boolean(value));
    if (setCookies.length > 0) response.setHeader('set-cookie', setCookies);

    response.statusCode = upstream.status;
    response.end(new Uint8Array(await upstream.arrayBuffer()));
  } catch {
    console.error('A solicitação ao serviço de API falhou.');
    sendJson(response, 502, 'Não foi possível conectar à API.');
  }
}

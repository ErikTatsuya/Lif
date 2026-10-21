export type AppEnvironment = 'development' | 'production';

export type EnvironmentConfig = {
  environment: AppEnvironment;
  backendUrl: string;
  frontendUrl: string;
};

type EnvironmentVariables = Record<string, string | undefined>;

function normalizeUrl(value: string | undefined, variable: string): string {
  const configuredUrl = value?.trim();
  if (!configuredUrl) {
    throw new Error(`A variável ${variable} não foi definida no arquivo .env.`);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(configuredUrl);
  } catch {
    throw new Error(`A variável ${variable} contém uma URL inválida.`);
  }

  if (
    (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') ||
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    throw new Error(`${variable} deve ser uma URL HTTP ou HTTPS válida, sem credenciais, query ou fragmento.`);
  }

  return parsedUrl.toString().replace(/\/+$/, '');
}

export function resolveEnvironmentConfig(
  variables: EnvironmentVariables,
  fallbackEnvironment: string
): EnvironmentConfig {
  const environment = variables.NODE_ENV?.trim() || fallbackEnvironment;
  if (environment !== 'development' && environment !== 'production') {
    throw new Error(`NODE_ENV inválido: "${environment}". Use "development" ou "production".`);
  }

  const suffix = environment === 'development' ? 'DEVELOPMENT' : 'PRODUCTION';
  const backendVariable = `BACKEND_${suffix}_URL`;
  const frontendVariable = `FRONTEND_${suffix}_URL`;

  const backendUrl = normalizeUrl(variables[backendVariable], backendVariable);
  const frontendUrl = normalizeUrl(variables[frontendVariable], frontendVariable);
  const parsedFrontendUrl = new URL(frontendUrl);

  if (parsedFrontendUrl.pathname !== '/' || parsedFrontendUrl.search || parsedFrontendUrl.hash) {
    throw new Error(`${frontendVariable} deve conter somente a origem do frontend.`);
  }

  return {
    environment,
    backendUrl,
    frontendUrl: parsedFrontendUrl.origin
  };
}

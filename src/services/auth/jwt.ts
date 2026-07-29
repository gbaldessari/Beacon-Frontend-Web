type JwtPayload = {
  sub?: unknown;
};

/**
 * Decodifica una sección base64url de JWT en navegadores.
 */
const decodeBase64Url = (value: string): string => {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddedValue = normalizedValue.padEnd(Math.ceil(normalizedValue.length / 4) * 4, '=');

  return atob(paddedValue);
};

/**
 * Extrae el identificador de usuario (`sub`) del access token almacenado.
 */
export const getUserIdFromAccessToken = (token: string | null | undefined): string | null => {
  if (!token) {
    return null;
  }

  const payloadPart = token.split('.')[1];

  if (!payloadPart) {
    return null;
  }

  try {
    const decodedPayload = JSON.parse(decodeBase64Url(payloadPart)) as JwtPayload;

    return typeof decodedPayload.sub === 'string' && decodedPayload.sub.trim().length > 0
      ? decodedPayload.sub
      : null;
  } catch {
    return null;
  }
};
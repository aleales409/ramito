// src/lib/vercelSync.ts
// No external HTTP library needed; using native fetch

/**
 * Actualiza la variable de entorno LICENSE_WEB_ACTIVE en el proyecto Vercel.
 * @param active - true si la licencia web está activa, false en caso contrario.
 */
export async function updateVercelLicense(active: boolean) {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID; // opcional

  if (!token || !projectId) {
    throw new Error('Credenciales de Vercel no configuradas');
  }

  const url = `https://api.vercel.com/v9/projects/${projectId}/env`;
  const payload = {
    key: 'LICENSE_WEB_ACTIVE',
    value: active ? 'true' : 'false',
    target: ['production', 'preview'],
    type: 'encrypted',
  };

  // Si se proporciona teamId, el endpoint requiere el query param teamId
  const finalUrl = teamId ? `${url}?teamId=${teamId}` : url;

  await fetch(finalUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

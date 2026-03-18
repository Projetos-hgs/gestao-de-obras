/**
 * Cliente de API centralizado para o Gestor de Obras.
 * Todas as chamadas passam pelo proxy /api configurado no Vite.
 */

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// -------- Projetos --------
export const api = {
  projects: {
    list: () => request<any[]>('/api/projects'),
    get: (id: string) => request<any>(`/api/projects/${id}`),
    create: (data: any) => request<any>('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/api/projects/${id}`, { method: 'DELETE' }),
    updateTap: (id: string, data: any) => request<any>(`/api/projects/${id}/tap`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  schedule: {
    list: (projectId: string) => request<any[]>(`/api/projects/${projectId}/schedule`),
    create: (projectId: string, data: any) => request<any>(`/api/projects/${projectId}/schedule`, { method: 'POST', body: JSON.stringify(data) }),
    update: (itemId: string, data: any) => request<any>(`/api/schedule/${itemId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (itemId: string) => request<void>(`/api/schedule/${itemId}`, { method: 'DELETE' }),
  },
  rdos: {
    list: (projectId: string) => request<any[]>(`/api/projects/${projectId}/rdos`),
    create: (projectId: string, data: any) => request<any>(`/api/projects/${projectId}/rdos`, { method: 'POST', body: JSON.stringify(data) }),
    update: (rdoId: string, data: any) => request<any>(`/api/rdos/${rdoId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (rdoId: string) => request<void>(`/api/rdos/${rdoId}`, { method: 'DELETE' }),
  },
  team: {
    list: (projectId: string) => request<any[]>(`/api/projects/${projectId}/team`),
    create: (projectId: string, data: any) => request<any>(`/api/projects/${projectId}/team`, { method: 'POST', body: JSON.stringify(data) }),
    update: (memberId: string, data: any) => request<any>(`/api/team/${memberId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (memberId: string) => request<void>(`/api/team/${memberId}`, { method: 'DELETE' }),
  },
  materials: {
    list: (projectId: string) => request<any[]>(`/api/projects/${projectId}/materials`),
    create: (projectId: string, data: any) => request<any>(`/api/projects/${projectId}/materials`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/api/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/api/materials/${id}`, { method: 'DELETE' }),
  },
  financial: {
    list: (projectId: string) => request<any[]>(`/api/projects/${projectId}/financial`),
    create: (projectId: string, data: any) => request<any>(`/api/projects/${projectId}/financial`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/api/financial/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/api/financial/${id}`, { method: 'DELETE' }),
  },
  contracts: {
    list: (projectId: string) => request<any[]>(`/api/projects/${projectId}/contracts`),
    create: (projectId: string, data: any) => request<any>(`/api/projects/${projectId}/contracts`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/api/contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/api/contracts/${id}`, { method: 'DELETE' }),
  },
  companies: {
    list: () => request<any[]>('/api/companies'),
    create: (data: any) => request<any>('/api/companies', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/api/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/api/companies/${id}`, { method: 'DELETE' }),
  },
  legalDocs: {
    list: (projectId: string) => request<any[]>(`/api/projects/${projectId}/legal-docs`),
    create: (projectId: string, data: any) => request<any>(`/api/projects/${projectId}/legal-docs`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/api/legal-docs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/api/legal-docs/${id}`, { method: 'DELETE' }),
  },
  technicalProjects: {
    list: (projectId: string) => request<any[]>(`/api/projects/${projectId}/technical-projects`),
    create: (projectId: string, data: any) => request<any>(`/api/projects/${projectId}/technical-projects`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/api/technical-projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/api/technical-projects/${id}`, { method: 'DELETE' }),
  },
  risks: {
    list: (projectId: string) => request<any[]>(`/api/projects/${projectId}/risks`),
    create: (projectId: string, data: any) => request<any>(`/api/projects/${projectId}/risks`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/api/risks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/api/risks/${id}`, { method: 'DELETE' }),
  },
  nonConformities: {
    list: (projectId: string) => request<any[]>(`/api/projects/${projectId}/non-conformities`),
    create: (projectId: string, data: any) => request<any>(`/api/projects/${projectId}/non-conformities`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/api/non-conformities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/api/non-conformities/${id}`, { method: 'DELETE' }),
  },
  alerts: {
    list: () => request<any[]>('/api/alerts'),
    create: (data: any) => request<any>('/api/alerts', { method: 'POST', body: JSON.stringify(data) }),
    resolve: (id: string) => request<any>(`/api/alerts/${id}/resolve`, { method: 'PUT' }),
  },
};

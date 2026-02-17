import { Project } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const projectsApi = {
  // Fetch all projects
  fetchAll: async (): Promise<Project[]> => {
    const response = await fetch(`${API_URL}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  // Fetch single project details
  fetchById: async (id: string): Promise<Project> => {
    const response = await fetch(`${API_URL}/projects/${id}`);
    if (!response.ok) throw new Error('Failed to fetch project details');
    return response.json();
  },

  // Check/sync project status
  checkStatus: async (id: string): Promise<Project> => {
    const response = await fetch(`${API_URL}/projects/${id}/check`);
    if (!response.ok) throw new Error('Failed to check project status');
    return response.json();
  },

  // Create new project
  create: async (data: Partial<Project>): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create project: ${response.status} ${errorText}`);
      }
    } catch (error) {
      throw error;
    }
  },

  // Update project
  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },

  // Delete project
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete project');
  },
};

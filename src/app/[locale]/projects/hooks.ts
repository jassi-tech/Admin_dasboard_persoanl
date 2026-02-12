import { useState, useEffect } from 'react';
import { App } from 'antd';
import { Project } from './types';
import { projectsApi } from './api';

export const useProjects = () => {
  const { message } = App.useApp();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const fetchProjects = async () => {
    try {
      const result = await projectsApi.fetchAll();
      setProjects(result);
      setLastSyncTime(new Date());
    } catch (error) {

      message.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Auto-sync every 7 minutes
    const autoSyncInterval = setInterval(() => {
      message.info('Auto-syncing project data...', 2);
      fetchProjects();
    }, 420000);

    return () => clearInterval(autoSyncInterval);
  }, []);

  return { projects, loading, lastSyncTime, fetchProjects };
};

export const useProjectDetails = (projectId: string | null) => {
  const { message } = App.useApp();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const fetchDetails = async (id: string) => {
    setLoading(true);
    try {
      const result = await projectsApi.fetchById(id);
      setProject(result);
    } catch (error) {

      message.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (id: string, onSuccess?: () => void) => {
    setChecking(true);
    try {
      const result = await projectsApi.checkStatus(id);
      setProject(result);
      if (onSuccess) onSuccess();
      message.success('Project synced successfully!');
    } catch (error) {

      message.error('Failed to sync project data');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchDetails(projectId);

      // Auto-sync current project every 7 minutes
      const projectSyncInterval = setInterval(() => {
        checkStatus(projectId);
      }, 420000);

      return () => clearInterval(projectSyncInterval);
    }
  }, [projectId]);

  return { project, loading, checking, fetchDetails, checkStatus };
};

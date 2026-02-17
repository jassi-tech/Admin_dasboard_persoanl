"use client";

import React, { useState } from 'react';
import { Row, Col, Typography, Button, Tag, Space, Breadcrumb, Radio, Select, Tooltip, Modal, Form, Input, App } from 'antd';
import { 
  ReloadOutlined,
  LinkOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import MainLayout from '@/components/layout/MainLayout';
import AdminCard from '@/components/common/AdminCard';
import AdminTable from '@/components/common/AdminTable';
import { ProjectCard } from '@/components/common/ProjectCard';
import { ProjectDetailsContent } from '@/components/common/ProjectDetailsContent';
import { CredentialsSection } from '@/components/common/CredentialsSection';
import { useProjects, useProjectDetails } from './hooks';
import { projectsApi } from './api';
import { Project, ViewType, StatusFilter } from './types';
import { ProjectHeader } from './components/ProjectHeader';
import { ProjectModals } from './components/ProjectModals';
import styles from './projects.module.scss';

const { Title, Text, Link: AntdLink } = Typography;

const ProjectsPage = () => {
  const { message } = App.useApp();
  const t = useTranslations('Projects');
  
  // Use custom hooks
  const { projects, loading, lastSyncTime, fetchProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { project: selectedProject, checking, checkStatus } = useProjectDetails(selectedProjectId);
  
  // UI State
  const [isMounted, setIsMounted] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('card');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  
  // Modal States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [secureModalVisible, setSecureModalVisible] = useState(false);
  const [isDetailsUnlocked, setIsDetailsUnlocked] = useState(false);
  
  // Form & Submission
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingFromDetail, setIsDeletingFromDetail] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleViewProject = (id: string) => {
    setSelectedProjectId(id);
    setIsDetailsUnlocked(false);
  };

  const handleBackToList = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setSelectedProjectId(null);
  };

  const handleSync = async () => {
    if (selectedProject) {
      await checkStatus(selectedProject.id, fetchProjects);
    }
  };

  const handleAddProject = async (values: any) => {
    setSubmitting(true);
    try {
      await projectsApi.create(values);
      message.success(t('modal.success'));
      setIsModalVisible(false);
      form.resetFields();
      fetchProjects();
    } catch (error: any) {
      message.error(`Failed to add website: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProject = async (updates: Partial<Project>) => {
    if (!selectedProjectId) return;
    
    setSubmitting(true);
    try {
      await projectsApi.update(selectedProjectId, updates);
      message.success('Project updated successfully');
      fetchProjects(); // Refresh list
      // Refresh details - useProjectDetails handles this if selectedProject changes
    } catch (error: any) {
      message.error(`Failed to update project: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string, isDetailView: boolean = false) => {
    setProjectToDelete({ id, name });
    setIsDeletingFromDetail(isDetailView);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    setSubmitting(true);
    try {
      await projectsApi.delete(projectToDelete.id);
      message.success(t('delete_confirm.success'));
      if (isDeletingFromDetail) {
        setSelectedProjectId(null);
      }
      setDeleteModalVisible(false);
      setProjectToDelete(null);
      fetchProjects();
    } catch (error) {
      message.error('Failed to delete website');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMounted) return null;

  const filteredProjects = projects.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const tableColumns = [
    {
      title: t('columns.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Project) => (
        <Space orientation="vertical" size={0}>
          <AntdLink href={record.url} target="_blank" style={{ fontSize: '12px' }}>
            {record.url}
          </AntdLink>
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: t('status.country'),
      dataIndex: 'country',
      key: 'country',
      render: (text: string) => <Tag>{text}</Tag>
    },
    {
      title: t('status.deployments'),
      dataIndex: 'deployments',
      key: 'deployments',
      render: (text: number) => <Tag color="blue">{text}</Tag>
    },
    {
      title: t('columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Project) => (
        <Tag color={record.isLive ? 'success' : 'error'}>
          {status}
        </Tag>
      )
    },
    {
      title: t('columns.actions'),
      key: 'actions',
      render: (_: any, record: Project) => (
        <Space>
          <Button 
            type="primary" 
            ghost 
            onClick={() => handleViewProject(record.id)}
          >
            {t('details_btn')}
          </Button>
          <Button 
            danger 
            onClick={() => handleDelete(record.id, record.name, false)}
          >
            {t('delete_btn')}
          </Button>
        </Space>
      )
    }
  ];

  // Render Project List View
  if (!selectedProjectId || !selectedProject) {
    return (
      <MainLayout>
        {loading ? (
          <div className={styles.loadingContainer}>Loading...</div>
        ) : projects.length === 0 ? (
          <div className={styles.loadingContainer}>
            <Title level={4}>No projects found</Title>
            <Button type="primary" onClick={() => setIsModalVisible(true)}>
              {t('add_project')}
            </Button>
          </div>
        ) : (
          <div className={styles.projectsContainer}>
            <ProjectHeader 
              t={t}
              viewType={viewType}
              setViewType={setViewType}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              setIsModalVisible={setIsModalVisible}
            />

            {viewType === 'card' ? (
              <Row gutter={[24, 24]} align="stretch">
                {filteredProjects.map((project) => (
                  <Col xs={24} sm={12} xl={8} key={project.id}>
                    <ProjectCard
                      project={project}
                      onView={handleViewProject}
                      onDelete={(id, name) => handleDelete(id, name, false)}
                      t={t}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <AdminCard>
                <AdminTable 
                  dataSource={filteredProjects} 
                  columns={tableColumns} 
                  rowKey="id"
                />
              </AdminCard>
            )}

            <ProjectModals 
              t={t}
              isAddModalVisible={isModalVisible}
              setIsAddModalVisible={setIsModalVisible}
              form={form}
              submitting={submitting}
              onAddProject={handleAddProject}
              deleteModalVisible={deleteModalVisible}
              setDeleteModalVisible={setDeleteModalVisible}
              confirmDelete={confirmDelete}
              projectToDelete={projectToDelete}
              secureModalVisible={secureModalVisible}
              setSecureModalVisible={setSecureModalVisible}
              onSecuritySuccess={() => {
                setSecureModalVisible(false);
                setIsDetailsUnlocked(true);
              }}
              selectedProject={null} // Not needed for add/delete
            />
          </div>
        )}
      </MainLayout>
    );
  }

  // Render Project Details View
  return (
    <MainLayout>
      <div className={styles.projectsContainer}>
        <Breadcrumb 
          className={styles.breadcrumbSpacing}
          items={[
            {
              title: (
                <AntdLink onClick={handleBackToList}>
                  <ArrowLeftOutlined /> {t('title')}
                </AntdLink>
              )
            },
            { title: selectedProject.name }
          ]}
        />

        <div className={styles.urlLinkSpacing}>
          <AntdLink href={selectedProject.url} target="_blank" className={styles.urlLinkText}>
            <LinkOutlined /> {selectedProject.url}
          </AntdLink>
        </div>

        <div className={styles.detailHeader}>
          <div>
            <Title level={2} className={styles.title}>{selectedProject.name}</Title>
            {lastSyncTime && (
              <Text type="secondary" className={styles.syncInfoText}>
                Last synced: {lastSyncTime.toLocaleTimeString()} • Auto-sync: Every 7 min
              </Text>
            )}
          </div>
          <Space>
            <Button 
              danger 
              onClick={() => handleDelete(selectedProject.id, selectedProject.name, true)}
            >
              {t('delete_btn')}
            </Button>
            <Button 
              type="primary" 
              icon={<ReloadOutlined spin={checking} />} 
              onClick={handleSync}
              loading={checking}
            >
              {t('status.check_now')}
            </Button>
          </Space>
        </div>
        
        <ProjectDetailsContent 
          project={selectedProject} 
          t={t} 
          onUpdate={handleUpdateProject}
          updating={submitting}
        />

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <CredentialsSection
              project={selectedProject}
              isUnlocked={isDetailsUnlocked}
              onUnlock={() => setSecureModalVisible(true)}
              onLock={() => setIsDetailsUnlocked(false)}
            />
          </Col>
        </Row>

        <ProjectModals 
          t={t}
          isAddModalVisible={false}
          setIsAddModalVisible={() => {}}
          form={form}
          submitting={submitting}
          onAddProject={() => {}}
          deleteModalVisible={deleteModalVisible}
          setDeleteModalVisible={setDeleteModalVisible}
          confirmDelete={confirmDelete}
          projectToDelete={projectToDelete}
          secureModalVisible={secureModalVisible}
          setSecureModalVisible={setSecureModalVisible}
          onSecuritySuccess={() => {
            setSecureModalVisible(false);
            setIsDetailsUnlocked(true);
          }}
          selectedProject={selectedProject}
        />
      </div>
    </MainLayout>
  );
};

export default ProjectsPage;

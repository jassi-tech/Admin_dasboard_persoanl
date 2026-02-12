"use client";

import React, { useState } from 'react';
import { Row, Col, Typography, Button, Tag, Space, Breadcrumb, Radio, Select, Tooltip, Modal, Form, Input, App } from 'antd';
import { 
  ReloadOutlined,
  LinkOutlined,
  ArrowLeftOutlined,
  AppstoreOutlined,
  TableOutlined,
  EyeOutlined,
  PlusOutlined,
  DeleteOutlined,
  GlobalOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import MainLayout from '@/components/layout/MainLayout';
import AdminCard from '@/components/common/AdminCard';
import AdminTable from '@/components/common/AdminTable';
import DeleteSecurityModal from '@/components/common/DeleteSecurityModal';
import SecurityGateModal from '@/components/common/SecurityGateModal';
import { ProjectCard } from '@/components/common/ProjectCard';
import { ProjectDetailsContent } from '@/components/common/ProjectDetailsContent';
import { CredentialsSection } from '@/components/common/CredentialsSection';
import { useProjects, useProjectDetails } from './hooks';
import { projectsApi } from './api';
import { Project, ViewType, StatusFilter } from './types';
import styles from './projects.module.scss';

const { Title, Text, Link: AntdLink } = Typography;
const { Option } = Select;

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

  const handleBackToList = () => {
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
        <Space direction="vertical" size={0}>
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
      render: (text: string) => <Tag icon={<GlobalOutlined />}>{text}</Tag>
    },
    {
      title: t('status.deployments'),
      dataIndex: 'deployments',
      key: 'deployments',
      render: (text: number) => <Tag color="blue" icon={<CloudUploadOutlined />}>{text}</Tag>
    },
    {
      title: t('columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Project) => (
        <Tag color={record.isLive ? 'green' : 'red'}>
          {record.isLive ? t('status.live') : t('status.issue')} ({status})
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
            icon={<EyeOutlined />} 
            onClick={() => handleViewProject(record.id)}
          >
            {t('details_btn')}
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id, record.name, false)}
          />
        </Space>
      )
    }
  ];

  // Render Project List View
  if (!selectedProject) {
    return (
      <MainLayout>
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center' }} className={styles.projectsContainer}>
            <Title level={4}>No projects found</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
              {t('add_project')}
            </Button>
          </div>
        ) : (
          <div className={styles.projectsContainer}>
            <div className={styles.headerActions}>
              <Title level={2} className={styles.title}>{t('title')}</Title>
              
              <Space size="middle">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setIsModalVisible(true)}
                >
                  {t('add_project')}
                </Button>

                <Select 
                  defaultValue="all" 
                  style={{ width: 150 }} 
                  onChange={(value) => setStatusFilter(value as StatusFilter)}
                >
                  <Option value="all">{t('filters.all')}</Option>
                  <Option value="stable">{t('filters.stable')}</Option>
                  <Option value="issue">{t('filters.issue')}</Option>
                </Select>

                <Radio.Group 
                  value={viewType} 
                  onChange={(e) => setViewType(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="card">
                    <Tooltip title={t('view.card')}>
                      <AppstoreOutlined />
                    </Tooltip>
                  </Radio.Button>
                  <Radio.Button value="table">
                    <Tooltip title={t('view.table')}>
                      <TableOutlined />
                    </Tooltip>
                  </Radio.Button>
                </Radio.Group>
              </Space>
            </div>

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

            {/* Add Project Modal */}
            <Modal
              title={t('modal.title')}
              open={isModalVisible}
              onCancel={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}
              footer={null}
            >
              <Form form={form} layout="vertical" onFinish={handleAddProject}>
                <Form.Item
                  label={t('modal.name')}
                  name="name"
                  rules={[{ required: true, message: 'Please enter website name' }]}
                >
                  <Input placeholder="e.g. My Awesome Website" />
                </Form.Item>
                <Form.Item
                  label={t('modal.url')}
                  name="url"
                  rules={[
                    { required: true, message: 'Please enter website URL' },
                    { type: 'url', message: 'Please enter a valid URL' }
                  ]}
                >
                  <Input placeholder="https://example.com" />
                </Form.Item>
                <Form.Item
                  label={t('status.country')}
                  name="country"
                  rules={[{ required: true, message: 'Please enter hosting country' }]}
                >
                  <Input placeholder="e.g. United States, India" />
                </Form.Item>
                <Form.Item className={styles.modalFooter}>
                  <Space>
                    <Button onClick={() => setIsModalVisible(false)}>
                      {t('modal.cancel')}
                    </Button>
                    <Button type="primary" htmlType="submit" loading={submitting}>
                      {t('modal.submit')}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* Delete Modal */}
            <DeleteSecurityModal
              open={deleteModalVisible}
              onCancel={() => setDeleteModalVisible(false)}
              onConfirm={confirmDelete}
              itemName={projectToDelete?.name || ''}
              loading={submitting}
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
          style={{ marginBottom: '16px' }}
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

        <div style={{ marginBottom: '16px' }}>
          <AntdLink href={selectedProject.url} target="_blank" style={{ fontSize: '1rem' }}>
            <LinkOutlined /> {selectedProject.url}
          </AntdLink>
        </div>

        <div className={styles.detailHeader}>
          <div>
            <Title level={2} className={styles.title}>{selectedProject.name}</Title>
            {lastSyncTime && (
              <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                Last synced: {lastSyncTime.toLocaleTimeString()} • Auto-sync: Every 7 min
              </Text>
            )}
          </div>
          <Space>
            <Button 
              danger 
              icon={<DeleteOutlined />} 
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
        
        <ProjectDetailsContent project={selectedProject} t={t} />

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

        {/* Delete Modal */}
        <DeleteSecurityModal
          open={deleteModalVisible}
          onCancel={() => setDeleteModalVisible(false)}
          onConfirm={confirmDelete}
          itemName={projectToDelete?.name || ''}
          loading={submitting}
        />

        {/* Security Gate Modal */}
        <SecurityGateModal
          open={secureModalVisible}
          onCancel={() => setSecureModalVisible(false)}
          onSuccess={() => {
            setSecureModalVisible(false);
            setIsDetailsUnlocked(true);
          }}
          title="Admin Access Required"
          description={`Please enter your 6-digit security OTP to view sensitive credentials for ${selectedProject.name}.`}
          actionText="Unlock Details"
        />
      </div>
    </MainLayout>
  );
};

export default ProjectsPage;

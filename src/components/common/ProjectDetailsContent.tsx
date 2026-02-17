import React, { useState } from 'react';
import { Row, Col, Typography, Tag, Space, Select } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  BarChartOutlined,
  GlobalOutlined,
  CloudUploadOutlined,
  HistoryOutlined,
  ProjectOutlined,
  BellOutlined,
  FileTextOutlined,
  RocketOutlined,
  CodeOutlined
} from '@ant-design/icons';
import AdminCard from '@/components/common/AdminCard';
import { Project, ProjectStage } from '@/app/[locale]/projects/types';
import styles from '@/app/[locale]/projects/projects.module.scss';

const { Title, Text } = Typography;
const { Option } = Select;

interface ProjectDetailsContentProps {
  project: Project;
  t: any;
  onUpdate?: (updates: Partial<Project>) => void;
  updating?: boolean;
}

export const ProjectDetailsContent: React.FC<ProjectDetailsContentProps> = ({ 
  project, 
  t, 
  onUpdate,
  updating 
}) => {
  const handleStageChange = (value: ProjectStage) => {
    if (onUpdate) onUpdate({ stage: value });
  };

  const handleStatusChange = (value: string) => {
    if (onUpdate) onUpdate({ status: value });
  };

  return (
    <Row gutter={[16, 16]}>
      {/* Status Section */}
      <Col xs={24} lg={12}>
        <AdminCard title={t('status.title')}>
          <div className={styles.statusSection}>
            <div className={styles.editableStatusRow}>
              {project.isLive ? (
                <CheckCircleOutlined className={styles.mainIcon} style={{ color: '#52c41a' }} />
              ) : (
                <CloseCircleOutlined className={styles.mainIcon} style={{ color: '#ff4d4f' }} />
              )}
              
              <div className={styles.statusSelectionGroup}>
                <div className={styles.selectLabel}>{t('columns.status')}</div>
                <Select 
                  value={project.status} 
                  onChange={handleStatusChange}
                  loading={updating}
                  style={{ width: '100%', maxWidth: '200px' }}
                  className={styles.statusSelect}
                >
                  <Option value="Stable">{t('filters.stable')}</Option>
                  <Option value="Needs Attention">{t('filters.issue')}</Option>
                  <Option value="Degraded">Degraded</Option>
                </Select>
              </div>

              <div className={styles.statusSelectionGroup}>
                <div className={styles.selectLabel}>Project Stage</div>
                <Select 
                  value={project.stage || 'Production'} 
                  onChange={handleStageChange}
                  loading={updating}
                  style={{ width: '100%', maxWidth: '200px' }}
                  className={styles.stageSelect}
                >
                  <Option value="Demo">
                    <Space><CodeOutlined /> Demo</Space>
                  </Option>
                  <Option value="Production">
                    <Space><RocketOutlined /> Production</Space>
                  </Option>
                </Select>
              </div>
            </div>
            
            <div className={styles.analysisBox}>
              <Space>
                <BarChartOutlined style={{ fontSize: '18px' }} />
                <span>
                  <strong>{t('status.analysis')}:</strong> {project.analysis}
                </span>
              </Space>
            </div>

            <div className={styles.statsDisplay}>
              <Row gutter={[16, 24]}>
                <Col span={12}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>{t('status.country')}</span>
                    <span className={styles.statValue}>
                      <GlobalOutlined className={styles.statIcon} /> {project.country}
                    </span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>{t('status.deployments')}</span>
                    <span className={styles.statValue}>
                      <CloudUploadOutlined className={styles.statIcon} /> {project.deployments}
                    </span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>{t('status.last_checked')}</span>
                    <span className={styles.statValue}>
                      <HistoryOutlined className={styles.statIcon} /> 
                      {new Date(project.lastChecked).toLocaleTimeString()}
                    </span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>{t('status.response_time')}</span>
                    <span className={styles.statValue}>{project.responseTime}</span>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </AdminCard>
      </Col>
      
      {/* Deliverables Section */}
      <Col xs={24} lg={12}>
        <AdminCard title={t('features.title')}>
          <div className={styles.deliverablesGrid}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className={styles.deliverableCard}>
                  <span className={styles.delivLabel}>{t('features.pages')}</span>
                  <div className={styles.delivValue}>
                    <ProjectOutlined className={styles.delivIcon} />
                    {project.features.pages}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.deliverableCard}>
                  <span className={styles.delivLabel}>{t('features.logs')}</span>
                  <div className={styles.delivValue}>
                    <HistoryOutlined className={styles.delivIcon} />
                    {project.features.logs}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.deliverableCard}>
                  <span className={styles.delivLabel}>{t('features.alerts')}</span>
                  <div className={styles.delivValue} 
                    style={{ color: project.features.alerts > 0 ? '#ff4d4f' : 'inherit' }}
                  >
                    <BellOutlined className={styles.delivIcon} />
                    {project.features.alerts}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.deliverableCard}>
                  <span className={styles.delivLabel}>{t('features.reports')}</span>
                  <div className={styles.delivValue}>
                    <FileTextOutlined className={styles.delivIcon} />
                    {project.features.reports}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </AdminCard>
      </Col>
    </Row>
  );
};

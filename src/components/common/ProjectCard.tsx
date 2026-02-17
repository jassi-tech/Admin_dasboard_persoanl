import React from 'react';
import { Card, Tag, Typography, Button, Tooltip, Space } from 'antd';
import { 
  LinkOutlined, 
  GlobalOutlined, 
  CloudUploadOutlined,
  EyeOutlined,
  DeleteOutlined 
} from '@ant-design/icons';
import { Project } from '@/app/[locale]/projects/types';
import styles from '@/app/[locale]/projects/projects.module.scss';

const { Title, Text, Link: AntdLink } = Typography;

interface ProjectCardProps {
  project: Project;
  onView: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  t: any;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onView, 
  onDelete,
  t 
}) => {
  // Determine status class
  const getStatusClass = () => {
    if (!project.isLive) return styles.statusIssue;
    if (project.status.toLowerCase() === 'stable') return styles.statusStable;
    return styles.statusLive;
  };

  return (
    <Card 
      hoverable 
      className={`${styles.projectCard} ${getStatusClass()}`}
    >
      <div className={styles.cardContent}>
        <div className={styles.urlLink}>
          <AntdLink href={project.url} target="_blank">
            <LinkOutlined /> {project.url}
          </AntdLink>
        </div>

        <div className={styles.cardTitleRow}>
          <Title 
            level={4} 
            className={styles.cardTitle}
            onClick={() => onView(project.id)}
          >
            {project.name}
          </Title>
          <Tag color={project.isLive ? 'success' : 'error'} className={styles.statusTag}>
            {project.isLive ? t('status.live') : t('status.issue')}
          </Tag>
        </div>
        
        <div className={styles.tagContainer}>
          <Tooltip title={t('status.country')}>
            <div className={styles.countryTag}>
              <GlobalOutlined /> {project.country}
            </div>
          </Tooltip>
          <Tooltip title={t('status.deployments')}>
            <div className={styles.deploymentTag}>
              <CloudUploadOutlined /> {project.deployments}
            </div>
          </Tooltip>
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.statusInfo}>
            <Text className={styles.statusLabel}>
              {t('columns.status')}
            </Text>
            <div className={styles.statusValue}>{project.status}</div>
          </div>
          <Space size="small">
            <Tooltip title={t('details_btn')}>
              <Button 
                type="text" 
                shape="circle"
                icon={<EyeOutlined style={{ fontSize: '20px', color: '#1890ff' }} />} 
                onClick={() => onView(project.id)} 
              />
            </Tooltip>
            <Tooltip title={t('delete_btn')}>
              <Button 
                type="text" 
                shape="circle"
                danger 
                icon={<DeleteOutlined style={{ fontSize: '20px' }} />} 
                onClick={() => onDelete(project.id, project.name)} 
              />
            </Tooltip>
          </Space>
        </div>
      </div>
    </Card>
  );
};

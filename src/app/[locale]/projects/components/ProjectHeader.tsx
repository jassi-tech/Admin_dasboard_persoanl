import React from 'react';
import { Typography, Space, Button, Select, Radio, Tooltip } from 'antd';
import { 
  PlusOutlined, 
  AppstoreOutlined, 
  TableOutlined 
} from '@ant-design/icons';
import { ViewType, StatusFilter } from '../types';
import styles from '../projects.module.scss';

const { Title } = Typography;
const { Option } = Select;

interface ProjectHeaderProps {
  t: any;
  viewType: ViewType;
  setViewType: (view: ViewType) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  setIsModalVisible: (visible: boolean) => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  t,
  viewType,
  setViewType,
  statusFilter,
  setStatusFilter,
  setIsModalVisible
}) => {
  return (
    <div className={styles.headerActions}>
      <Title level={2} className={styles.title}>{t('title')}</Title>
      
      <Space size="middle" className={styles.headerSpace}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalVisible(true)}
          size="large"
          style={{ borderRadius: '10px' }}
        >
          {t('add_project')}
        </Button>

        <Select 
          value={statusFilter} 
          style={{ width: 160 }} 
          onChange={(value) => setStatusFilter(value as StatusFilter)}
          size="large"
        >
          <Option value="all">{t('filters.all')}</Option>
          <Option value="stable">{t('filters.stable')}</Option>
          <Option value="issue">{t('filters.issue')}</Option>
        </Select>

        <Radio.Group 
          value={viewType} 
          onChange={(e) => setViewType(e.target.value)}
          buttonStyle="solid"
          size="large"
        >
          <Radio.Button value="card" style={{ borderRadius: '10px 0 0 10px' }}>
            <Tooltip title={t('view.card')}>
              <AppstoreOutlined />
            </Tooltip>
          </Radio.Button>
          <Radio.Button value="table" style={{ borderRadius: '0 10px 10px 0' }}>
            <Tooltip title={t('view.table')}>
              <TableOutlined />
            </Tooltip>
          </Radio.Button>
        </Radio.Group>
      </Space>
    </div>
  );
};

"use client";

import React from 'react';
import { Row, Col, Statistic, Typography } from 'antd';
import dynamic from 'next/dynamic';
import { 
  UserOutlined, 
  DollarCircleOutlined, 
  ShoppingCartOutlined, 
  TeamOutlined 
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import MainLayout from '@/components/layout/MainLayout';
import AdminCard from '@/components/common/AdminCard';
import AdminTable from '@/components/common/AdminTable';
import styles from './dashboard.module.scss';

const UserMap = dynamic(() => import('@/components/common/UserMap'), { 
  ssr: false,
  loading: () => <div className={styles.mapPlaceholder} />
});

import { getUserProfile } from '@/utils/profile';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const t = useTranslations('Dashboard');
  const [state, setState] = React.useState<{ data: any; loading: boolean; isMounted: boolean }>({ data: null, loading: true, isMounted: false });
  const [userName, setUserName] = React.useState('Admin');

  React.useEffect(() => {
    setState(prev => ({ ...prev, isMounted: true }));
    const profile = getUserProfile();
    setUserName(profile.name);

    (async () => {
      try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`).then(r => r.json());
        setState({ data: result, loading: false, isMounted: true });
      } catch (error) {
        
        setState(prev => ({ ...prev, loading: false }));
      }
    })();
  }, []);

  const { data, loading, isMounted } = state;
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Last Login', dataIndex: 'lastLogin', key: 'lastLogin' },
  ];

  const statCards = [
    { key: 'users', title: t('stats.users'), value: data?.stats.users, icon: <UserOutlined /> },
    { key: 'revenue', title: t('stats.revenue'), value: data?.stats.revenue, icon: <DollarCircleOutlined />, precision: 2, suffix: '$' },
    { key: 'orders', title: t('stats.orders'), value: data?.stats.orders, icon: <ShoppingCartOutlined /> },
    { key: 'active', title: t('stats.active'), value: data?.stats.active, icon: <TeamOutlined /> },
  ];

  if (!isMounted) return null;

  return (
    <MainLayout>
      {loading ? (
        <div className={styles.loadingWrapper}>Loading...</div>
      ) : !data ? (
        <div className={styles.errorWrapper}>Error loading dashboard data</div>
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            <Title level={2} className={styles.dashboardHeader}>Welcome back, {userName} 👋</Title>
            <Text type="secondary" className={styles.dashboardSubHeader}>Here's what's happening with your store today.</Text>
          </div>
          
          <Row gutter={[16, 16]}>
            {statCards.map((card) => (
              <Col xs={24} sm={12} lg={6} key={card.key}>
                <AdminCard>
                  <Statistic 
                    title={card.title}
                    value={card.value}
                    prefix={card.icon}
                    precision={card.precision}
                    suffix={card.suffix}
                  />
                </AdminCard>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]} className={styles.mapRow}>
            <Col xs={24} lg={16}>
              <AdminCard title={t('map.title')}>
                <UserMap />
              </AdminCard>
            </Col>
            <Col xs={24} lg={8}>
              <AdminCard title="Recent Activity">
                <AdminTable 
                  dataSource={data?.recentActivity || []} 
                  columns={columns} 
                  pagination={false} 
                  size="small"
                />
              </AdminCard>
            </Col>
          </Row>
        </>
      )}
    </MainLayout>
  );
};

export default DashboardPage;

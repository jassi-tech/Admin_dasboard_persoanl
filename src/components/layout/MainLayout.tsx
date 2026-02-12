"use client";

import React from 'react';
import { Layout, Button, Select } from 'antd';
import Sidebar from './Sidebar';
import { useRouter, usePathname } from '@/navigation';
import { useLocale } from 'next-intl';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Space, Typography } from 'antd';
import styles from './MainLayout.module.scss';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

import { getUserProfile } from '@/utils/profile';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [user, setUser] = React.useState({ name: 'Admin User', email: '' });

  const handleLanguageChange = (value: string) => {
    router.replace(pathname, { locale: value });
  };

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    // Initial load from local
    const profile = getUserProfile();
    setUser(profile);

    // Fetch fresh profile from backend
    (async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                credentials: 'include' // Include auth cookie
            });
            if (res.ok) {
                const backendUser = await res.json();
                if (backendUser && backendUser.email) {
                    const { saveUserProfile } = require('@/utils/profile');
                    const updated = saveUserProfile({
                        id: backendUser.id,
                        name: backendUser.name,
                        email: backendUser.email,
                        role: backendUser.role,
                        // Preserve bio/avatar if not in backend response yet
                    });
                    setUser(updated || backendUser);
                }
            }
        } catch (error) {
            console.warn('Failed to sync profile', error);
        }
    })();

    // Listen for updates
    const handleProfileUpdate = () => {
      const updated = getUserProfile();
      setUser(updated);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  if (!isMounted) return null;

  return (
    <Layout className={styles.mainLayout}>
      <Sidebar />
      <Layout>
        <Header className={styles.header}>
          <div>
            <Text strong className={styles.headerTitle}>Admin Dashboard</Text>
          </div>
          <div className={styles.headerActions}>
            <Select 
              defaultValue={locale} 
              className={styles.langSelector} 
              onChange={handleLanguageChange}
              options={[
                { value: 'en', label: '🇬🇧 English' },
                { value: 'hi', label: '🇮🇳 हिन्दी' },
              ]}
            />
            <Space size="middle">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                <Text strong>{user.name}</Text>
                <Text type="secondary" style={{ fontSize: '11px' }}>Administrator</Text>
              </div>
              <Avatar icon={<UserOutlined />} className={styles.userAvatar} />
            </Space>
          </div>
        </Header>
        <Content className={styles.content}>
          {children}
        </Content>
        <Footer className={styles.footer}>
          Admin Dashboard ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

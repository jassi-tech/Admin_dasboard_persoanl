"use client";

import React from 'react';
import { Layout, Button, Select, Grid, Drawer, Avatar, Space, Typography } from 'antd';
import Sidebar, { SidebarContent } from './Sidebar';
import { useRouter, usePathname } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { UserOutlined, MenuOutlined } from '@ant-design/icons';
import styles from './MainLayout.module.scss';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

import { getUserProfile } from '@/utils/profile';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const tSidebar = useTranslations('Sidebar');
  const screens = useBreakpoint();
  
  const [user, setUser] = React.useState({ name: 'Admin User', email: '' });
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  const isMobile = !screens.lg;

  const handleLanguageChange = (value: string) => {
    router.replace(pathname, { locale: value });
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST' });
    } catch (error) {}
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.href = `/${locale}/login`;
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      handleLogout();
    } else {
      setDrawerVisible(false);
    }
  };

  React.useEffect(() => {
    setIsMounted(true);
    const profile = getUserProfile();
    setUser(profile);

    (async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                credentials: 'include'
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
                    });
                    setUser(updated || backendUser);
                }
            }
        } catch (error) {
            console.warn('Failed to sync profile', error);
        }
    })();

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
      {!isMobile && <Sidebar />}
      
      <Drawer
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={260}
        styles={{ body: { padding: 0 }, header: { display: 'none' } }}
        className={styles.mobileDrawer}
      >
        <div style={{ height: '100%', background: '#001529' }}>
          <SidebarContent 
            collapsed={false}
            t={tSidebar}
            locale={locale}
            pathname={pathname}
            onMenuClick={handleMenuClick}
          />
        </div>
      </Drawer>

      <Layout className={styles.siteLayout}>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            {isMobile && (
              <Button 
                type="text" 
                icon={<MenuOutlined />} 
                onClick={() => setDrawerVisible(true)}
                className={styles.mobileMenuBtn}
              />
            )}
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
                <Text strong className={styles.userNameText}>{user.name}</Text>
                <Text type="secondary" style={{ fontSize: '11px' }}>Administrator</Text>
              </div>
              <Avatar icon={<UserOutlined />} className={styles.userAvatar} />
            </Space>
          </div>
        </Header>
        <Content className={styles.content}>
          <div className={styles.innerContent}>
            {children}
          </div>
        </Content>
        <Footer className={styles.footer}>
          Admin Dashboard ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

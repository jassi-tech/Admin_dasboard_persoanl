"use client";

import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import styles from './Sidebar.module.scss';

const { Sider } = Layout;

export const SidebarContent = ({ collapsed, t, locale, pathname, onMenuClick }: any) => {
  const topMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">{t('dashboard')}</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link href="/users">{t('users')}</Link>,
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: <Link href="/projects">{t('projects')}</Link>,
    },
  ];

  const bottomMenuItems = [
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings">{t('settings')}</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('logout'),
      danger: true,
    },
  ];

  return (
    <div className={styles.sidebarWrapper}>
      <div className={`${styles.sidebarLogo} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.logoIcon}>A</div>
        <span className={styles.logoText}>ADMIN PANEL</span>
      </div>
      
      <Menu 
        theme="dark" 
        selectedKeys={[pathname]} 
        mode="inline" 
        items={topMenuItems}
        className={styles.topMenu}
      />
      
      <Menu 
        theme="dark" 
        selectable={false}
        mode="inline" 
        items={bottomMenuItems} 
        onClick={onMenuClick}
        className={styles.bottomMenu}
      />
    </div>
  );
};

const Sidebar = () => {
  const t = useTranslations('Sidebar');
  const locale = useLocale();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST' });
    } catch (error) {

    }
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.href = `/${locale}/login`;
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      handleLogout();
    }
  };

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={(value) => setCollapsed(value)}
      breakpoint="lg"
      theme="dark"
      width={260}
      className={styles.sidebarSider}
    >
      <SidebarContent 
        collapsed={collapsed}
        t={t}
        locale={locale}
        pathname={pathname}
        onMenuClick={handleMenuClick}
      />
    </Sider>
  );
};

export default Sidebar;

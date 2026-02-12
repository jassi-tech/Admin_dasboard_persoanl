"use client";

import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Form, Input, Button, App, Tabs, Avatar, Tag, Divider, Descriptions, Switch } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  BellOutlined, 
  GlobalOutlined, 
  MailOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  CameraOutlined
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import MainLayout from '@/components/layout/MainLayout';
import AdminCard from '@/components/common/AdminCard';
import { getUserProfile, saveUserProfile } from '@/utils/profile';
import styles from './settings.module.scss';

const { Title, Text } = Typography;

const SettingsPage = () => {
    const { message } = App.useApp();
    const t = useTranslations('Settings'); // Make sure translations exist or fallback
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ id?: string; email: string; name: string; bio?: string } | null>(null);

    useEffect(() => {
        setIsMounted(true);
        const profile = getUserProfile();
        setCurrentUser(profile);
    }, []);

    if (!isMounted) return null;

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            if (values.name || values.bio) {
                // Update Backend if we have an ID
                if (currentUser?.id) {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${currentUser.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: values.name,
                            // Bio might not be in backend schema yet, but we send it
                            bio: values.bio
                        })
                    });
                }

                // Update Local State & Broadcast
                const updated = saveUserProfile({
                    name: values.name,
                    bio: values.bio
                });
                
                if (updated) {
                    setCurrentUser(updated);
                    message.success('Profile updated successfully!');
                } else {
                    message.error('Failed to save profile locally');
                }
            } else {
                 message.success('Settings updated successfully!');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            message.error('Failed to update profile on server');
        } finally {
            setLoading(false);
        }
    };

    const onPasswordChange = async (values: any) => {
        const { currentPassword, newPassword, confirmPassword } = values;

        if (newPassword !== confirmPassword) {
            message.error('New password and confirm password do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include auth cookie
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                message.success('Password updated successfully! Please login again.');
                
                // If server indicates re-login is required, redirect to login
                if (data.requiresRelogin) {
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);
                }
            } else {
                message.error(data.message || 'Failed to update password');
            }
        } catch (error) {
            console.error('Failed to change password:', error);
            message.error('Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const items = [
        {
            key: '1',
            label: (
                <span>
                    <UserOutlined />
                    User Profile
                </span>
            ),
            children: (
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={8}>
                        <AdminCard>
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <Avatar 
                                        size={120} 
                                        icon={<UserOutlined />} 
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || 'Admin'}`}
                                        style={{ backgroundColor: '#1890ff', marginBottom: '16px' }} 
                                    />
                                    <Button 
                                        type="primary" 
                                        shape="circle" 
                                        icon={<CameraOutlined />} 
                                        size="small"
                                        style={{ position: 'absolute', bottom: 16, right: 0 }}
                                    />
                                </div>
                                <Title level={3} style={{ marginBottom: 4 }}>{currentUser?.name || "Admin User"}</Title>
                                <Text type="secondary">{currentUser?.email || "admin@example.com"}</Text>
                                <div style={{ marginTop: 16 }}>
                                    <Tag color="blue">Administrator</Tag>
                                    <Tag color="green">Verified</Tag>
                                </div>
                            </div>
                            <Divider />
                            <Descriptions column={1} size="small" bordered>
                                <Descriptions.Item label="Member Since">Jan 2024</Descriptions.Item>
                                <Descriptions.Item label="Last Login">Today, 10:42 AM</Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Tag color="success">Active</Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </AdminCard>
                    </Col>
                    <Col xs={24} md={16}>
                        <AdminCard title="Edit Profile">
                            <Form
                                layout="vertical"
                                onFinish={onFinish}
                                initialValues={{ 
                                    name: currentUser?.name || 'Admin User', 
                                    email: currentUser?.email || 'admin@example.com',
                                    bio: 'System Administrator'
                                }}
                            >
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Full Name" name="name">
                                            <Input prefix={<UserOutlined />} placeholder="Enter your name" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Email" name="email">
                                            <Input prefix={<MailOutlined />} disabled />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item label="Bio" name="bio">
                                            <Input.TextArea rows={4} placeholder="Tell us about yourself" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Save Changes
                                </Button>
                            </Form>
                        </AdminCard>
                    </Col>
                </Row>
            ),
        },
        {
            key: '2',
            label: (
                <span>
                    <LockOutlined />
                    Security
                </span>
            ),
            children: (
                <Row gutter={[24, 24]}>
                    <Col span={24}>
                        <AdminCard title="Security Settings">
                           <Form layout="vertical" onFinish={onPasswordChange}>
                                <Form.Item label="Current Password" name="currentPassword" rules={[{ required: true }]}>
                                    <Input.Password prefix={<LockOutlined />} />
                                </Form.Item>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="New Password" name="newPassword" rules={[{ required: true }]}>
                                            <Input.Password prefix={<SafetyOutlined />} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true }]}>
                                            <Input.Password prefix={<SafetyOutlined />} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Update Password
                                </Button>
                            </Form>
                        </AdminCard>
                    </Col>
                </Row>
            ),
        },
        {
            key: '3',
            label: (
                <span>
                    <BellOutlined />
                    Notifications
                </span>
            ),
            children: (
                <AdminCard title="Notification Preferences">
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span>Email Notifications</span>
                            <Switch defaultChecked />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span>Push Notifications</span>
                            <Switch defaultChecked />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span>Monthly Reports</span>
                            <Switch />
                        </div>
                    </div>
                </AdminCard>
            ),
        }
    ];

    return (
        <MainLayout>
            <div className={styles.settingsWrapper}>
                <div style={{ marginBottom: 24 }}>
                    <Title level={2}>Account Settings</Title>
                    <Text type="secondary">Manage your profile, security, and notification preferences.</Text>
                </div>
                
                <Tabs defaultActiveKey="1" items={items} size="large" />

                <div style={{ marginTop: 40 }}>
                     <AdminCard className={styles.dangerCard} style={{ borderColor: '#ff4d4f' }}>
                        <Title level={4} className={styles.dangerTitle} style={{ color: '#ff4d4f' }}>Danger Zone</Title>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                            Irreversible actions. Please be certain.
                        </Text>
                        <Button danger icon={<DeleteOutlined />}>Delete Account</Button>
                    </AdminCard>
                </div>
            </div>
        </MainLayout>
    );
};

export default SettingsPage;

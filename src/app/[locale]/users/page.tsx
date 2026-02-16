"use client";

import React, { useState } from 'react';
import { Row, Col, Typography, Table, Tag, Button, Space, Modal, Form, Input, Select, App, Avatar } from 'antd';
import { useTranslations } from 'next-intl';
import MainLayout from '@/components/layout/MainLayout';
import AdminCard from '@/components/common/AdminCard';
import { UserAddOutlined, EditOutlined, DeleteOutlined, LockOutlined, FilterOutlined, ProjectOutlined } from '@ant-design/icons';
import MFASetupModal from '@/components/mfa/MFASetupModal';
import styles from './users.module.scss';

const { Title, Text } = Typography;

const UsersPage = () => {
    const { message, modal } = App.useApp();
    const t = useTranslations('Users');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [form] = Form.useForm();
    const [isMFAModalOpen, setIsMFAModalOpen] = useState(false);
    const [pendingUserData, setPendingUserData] = useState<any>(null);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
            const data = await response.json();
            setUsers(data);
        } catch (error) {

            message.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`);
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error('Failed to fetch projects');
        }
    };

    React.useEffect(() => {
        setIsMounted(true);
        Promise.all([fetchUsers(), fetchProjects()]);
    }, []);

    if (!isMounted) return null;

    const dataSource = users;

    const handleDelete = async (key: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${key}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                message.success('User deleted successfully');
                fetchUsers();
            } else {
                const data = await response.json();
                message.error(data.message || 'Failed to delete user');
            }
        } catch (error) {

            message.error('Connection error');
        }
    };

    const columns = [
        { 
            title: 'Name', 
            dataIndex: 'name', 
            key: 'name',
            render: (text: string, record: any) => (
                <Space>
                    <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record.email}`} />
                    <Text strong>{text}</Text>
                </Space>
            )
        },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { 
            title: 'Role', 
            dataIndex: 'role', 
            key: 'role',
            filters: [
                { text: 'Superadmin', value: 'Superadmin' },
                { text: 'Admin', value: 'Admin' },
                { text: 'Tester', value: 'Tester' },
                { text: 'Demo', value: 'Demo' },
            ],
            onFilter: (value: any, record: any) => record.role === value,
            render: (role: string) => (
                <Tag color={role === 'Superadmin' ? 'red' : role === 'Admin' ? 'gold' : role === 'Tester' ? 'orange' : role === 'Demo' ? 'purple' : 'blue'}>
                    {role}
                </Tag>
            )
        },
        {
            title: 'Project',
            dataIndex: 'projectId',
            key: 'project',
            render: (projectId: string) => {
                const project = projects.find(p => p.id === projectId);
                return (
                    <Tag icon={<ProjectOutlined />} color="cyan">
                        {project ? project.name : 'Test'}
                    </Tag>
                );
            }
        },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'Active' ? 'success' : 'error'} variant="filled">
                    {status}
                </Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => showModal(record)} 
                    />
                    <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        disabled={record.role === 'Superadmin'}
                        onClick={() => {
                            modal.confirm({
                                title: 'Are you sure you want to delete this user?',
                                content: `User: ${record.name}`,
                                onOk: () => handleDelete(record.id),
                            });
                        }} 
                    />
                </Space>
            ),
        },
    ];

    const showModal = (user?: any) => {
        if (user) {
            setEditingUser(user);
            form.setFieldsValue(user);
        } else {
            setEditingUser(null);
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingUser(null);
        form.resetFields();
    };

    const onFinish = async (values: any) => {
        try {
            if (editingUser && !editingUser.id) {
                message.error('User ID is missing. Please refresh and try again.');
                return;
            }

            // If creating a new Superadmin, trigger MFA setup first
            if (!editingUser && values.role === 'Superadmin') {
                setPendingUserData(values);
                setIsMFAModalOpen(true);
                return;
            }

            // Normal user creation/update flow
            await createOrUpdateUser(values);
        } catch (error) {
            message.error('Connection error');
        }
    };

    const createOrUpdateUser = async (values: any, mfaSecret?: string) => {
        try {
            const url = editingUser ? `${process.env.NEXT_PUBLIC_API_URL}/users/${editingUser.id}` : `${process.env.NEXT_PUBLIC_API_URL}/users`;
            const method = editingUser ? 'PUT' : 'POST';

            const payload = { ...values };
            if (mfaSecret) {
                payload.mfaSecret = mfaSecret;
                payload.mfaEnabled = true;
            }

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (response.ok) {
                message.success(editingUser ? 'User updated successfully!' : 'User added successfully!');
                setIsModalVisible(false);
                setEditingUser(null);
                form.resetFields();
                fetchUsers();
            } else {
                message.error(data.message || (editingUser ? 'Failed to update user' : 'Failed to add user'));
            }
        } catch (error) {
            message.error('Connection error');
        }
    };

    const handleMFAComplete = async (mfaSecret: string) => {
        setIsMFAModalOpen(false);
        if (pendingUserData) {
            await createOrUpdateUser(pendingUserData, mfaSecret);
            setPendingUserData(null);
        }
    };

    const handleMFACancel = () => {
        setIsMFAModalOpen(false);
        setPendingUserData(null);
        message.info('Superadmin creation cancelled. MFA setup is required for Superadmin accounts.');
    };

    return (
        <MainLayout>
            <div className={styles.usersHeader}>
                <Title level={2} className={styles.title}>{t('title')}</Title>
                <Button type="primary" icon={<UserAddOutlined />} onClick={() => showModal()}>
                    {t('add_user')}
                </Button>
            </div>

            <AdminCard>
                <Table 
                    dataSource={dataSource} 
                    columns={columns} 
                    pagination={{ pageSize: 10 }} 
                    rowKey="id" 
                />
            </AdminCard>

            <Modal 
                title={editingUser ? 'Edit User' : t('add_user')} 
                open={isModalVisible} 
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item label="Name" name="name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Role" name="role" rules={[{ required: true }]}>
                        <Select options={[
                            { value: 'Superadmin', label: 'Superadmin' },
                            { value: 'Admin', label: 'Admin' },
                            { value: 'Tester', label: 'Tester' },
                            { value: 'Demo', label: 'Demo' },
                        ]} />
                    </Form.Item>
                    <Form.Item 
                        label="Password" 
                        name="password" 
                        rules={[{ required: !editingUser, min: 6 }]}
                        help={editingUser ? "Leave blank to keep current password" : ""}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder={editingUser ? "New password (optional)" : "Enter password"} />
                    </Form.Item>
                    <Form.Item label="Project" name="projectId">
                        <Select 
                            placeholder="Select project (Optional)"
                            options={[
                                { value: '', label: 'Test' },
                                ...projects.map(p => ({ value: p.id, label: p.name }))
                            ]} 
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space className={styles.modalFooter}>
                            <Button onClick={handleCancel}>Cancel</Button>
                            <Button type="primary" htmlType="submit">Submit</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <MFASetupModal
                open={isMFAModalOpen}
                onCancel={handleMFACancel}
                onComplete={handleMFAComplete}
                userEmail={pendingUserData?.email || ''}
            />
        </MainLayout>
    );
};

export default UsersPage;

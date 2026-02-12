"use client";

import React, { useState } from 'react';
import { Row, Col, Typography, Table, Tag, Button, Space, Modal, Form, Input, Select, App } from 'antd';
import { useTranslations } from 'next-intl';
import MainLayout from '@/components/layout/MainLayout';
import AdminCard from '@/components/common/AdminCard';
import { UserAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './users.module.scss';

const { Title } = Typography;

const UsersPage = () => {
    const { message, modal } = App.useApp();
    const t = useTranslations('Users');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [form] = Form.useForm();

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

    React.useEffect(() => {
        setIsMounted(true);
        fetchUsers();
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
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { 
            title: 'Role', 
            dataIndex: 'role', 
            key: 'role',
            render: (role: string) => (
                <Tag color={role === 'Admin' ? 'gold' : role === 'Editor' ? 'blue' : 'green'}>
                    {role}
                </Tag>
            )
        },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'Active' ? 'success' : 'error'}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button type="text" icon={<EditOutlined />} />
                    <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => {
                            modal.confirm({
                                title: 'Are you sure you want to delete this user?',
                                content: `User: ${record.name}`,
                                onOk: () => handleDelete(record.key),
                            });
                        }} 
                    />
                </Space>
            ),
        },
    ];

    const showModal = () => setIsModalVisible(true);
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const onFinish = async (values: any) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            const data = await response.json();
            if (response.ok) {
                message.success('User added successfully!');
                setIsModalVisible(false);
                form.resetFields();
                fetchUsers();
            } else {
                message.error(data.message || 'Failed to add user');
            }
        } catch (error) {

            message.error('Connection error');
        }
    };

    return (
        <MainLayout>
            <div className={styles.usersHeader}>
                <Title level={2} className={styles.title}>{t('title')}</Title>
                <Button type="primary" icon={<UserAddOutlined />} onClick={showModal}>
                    {t('add_user')}
                </Button>
            </div>

            <AdminCard>
                <Table dataSource={dataSource} columns={columns} pagination={{ pageSize: 10 }} />
            </AdminCard>

            <Modal 
                title={t('add_user')} 
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
                            { value: 'Admin', label: 'Admin' },
                            { value: 'Editor', label: 'Editor' },
                            { value: 'User', label: 'User' },
                        ]} />
                    </Form.Item>
                    <Form.Item>
                        <Space className={styles.modalFooter}>
                            <Button onClick={handleCancel}>Cancel</Button>
                            <Button type="primary" htmlType="submit">Submit</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </MainLayout>
    );
};

export default UsersPage;

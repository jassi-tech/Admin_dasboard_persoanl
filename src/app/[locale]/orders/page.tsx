"use client";

import React from 'react';
import { Typography, Tag, Space, Breadcrumb } from 'antd';
import { ShoppingCartOutlined, HomeOutlined } from '@ant-design/icons';
import MainLayout from '@/components/layout/MainLayout';
import AdminCard from '@/components/common/AdminCard';
import AdminTable from '@/components/common/AdminTable';
import { Link } from '@/navigation';

const { Title } = Typography;

const OrdersPage = () => {
    const dataSource = [
        { key: '1', id: '#ee27db5', product: '4th generation', date: '2/13/2023', total: '$378.21', status: 'CANCELLED', payment: 'bitcoin' },
        { key: '2', id: '#b5e7923', product: 'Automated', date: '7/9/2023', total: '$704.93', status: 'PROCESSING', payment: 'paypal' },
        { key: '3', id: '#a9cfffc', product: 'Business-focused', date: '5/30/2023', total: '$588.38', status: 'CANCELLED', payment: 'gift_card' },
        { key: '4', id: '#787837e', product: 'Compatible', date: '8/28/2022', total: '$272.62', status: 'SHIPPED', payment: 'paypal' },
        { key: '5', id: '#96b735e', product: 'Compatible', date: '12/1/2022', total: '$264.06', status: 'CANCELLED', payment: 'gift_card' },
        { key: '6', id: '#8dcd190', product: 'Customer-focused', date: '4/20/2023', total: '$537.06', status: 'SHIPPED', payment: 'paypal' },
        { key: '7', id: '#2d66dda', product: 'Customer-focused', date: '4/30/2023', total: '$425.40', status: 'SHIPPED', payment: 'paypal' },
        { key: '8', id: '#bd3e232', product: 'Devolved', date: '12/20/2022', total: '$315.56', status: 'PROCESSING', payment: 'credit_card' },
        { key: '9', id: '#57d1482', product: 'Distributed', date: '2/12/2023', total: '$297.03', status: 'CANCELLED', payment: 'gift_card' },
        { key: '10', id: '#0abda29', product: 'Distributed', date: '1/2/2023', total: '$587.39', status: 'PROCESSING', payment: 'debit_card' },
    ];

    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            render: (text: string) => <span style={{ color: '#636e72', fontWeight: 500 }}>{text}</span>
        },
        {
            title: 'Product',
            dataIndex: 'product',
            key: 'product',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'default';
                if (status === 'SHIPPED') color = '#52c41a';
                if (status === 'PROCESSING') color = '#1890ff';
                if (status === 'CANCELLED') color = '#f5222d';
                
                return (
                    <Tag color={color} style={{ borderRadius: '4px', fontWeight: 'bold', fontSize: '11px', padding: '0 8px' }}>
                        {status}
                    </Tag>
                );
            }
        },
        {
            title: 'Payment method',
            dataIndex: 'payment',
            key: 'payment',
            render: (text: string) => text.replace('_', ' ')
        },
    ];

    return (
        <MainLayout>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Orders</Title>
                <Breadcrumb 
                    items={[
                        { title: <Link href="/dashboard"><HomeOutlined /> Dashboard</Link> },
                        { title: 'Orders' }
                    ]} 
                />
            </div>

            <AdminCard title="Orders">
                <AdminTable 
                    dataSource={dataSource} 
                    columns={columns} 
                    pagination={{ pageSize: 10 }}
                />
            </AdminCard>
        </MainLayout>
    );
};

export default OrdersPage;

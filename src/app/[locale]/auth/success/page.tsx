"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Button, Space } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useRouter } from '@/navigation';
import { getUserProfile } from '@/utils/profile';
import styles from './success.module.scss';

const { Title, Text } = Typography;

const SuccessLoginPage = () => {
    const router = useRouter();
    const [name, setName] = useState('Admin');
    const [isMounted, setIsMounted] = useState(false);
    const [refining, setRefining] = useState(false);
    const [refined, setRefined] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const profile = getUserProfile();
        if (profile && profile.name) {
            setName(profile.name);
        }
    }, []);

    const handleRefineLocation = () => {
        if (!navigator.geolocation) return;
        setRefining(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/update`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ lat: latitude, lon: longitude })
                    });
                    setRefined(true);
                } catch (error) {
                    console.error('Failed to update location', error);
                } finally {
                    setRefining(false);
                }
            },
            (error) => {
                console.warn('Geolocation denied or failed', error);
                setRefining(false);
            }
        );
    };

    const handleEnter = () => {
        router.push('/dashboard');
    };

    if (!isMounted) return null;

    return (
        <div className={styles.successWrapper}>
            <div className={styles.successCard}>
                <div className={styles.iconWrapper}>
                    <CheckCircleOutlined />
                </div>
                
                <Space orientation="vertical" size={0} style={{ width: '100%', marginBottom: 32 }}>
                    <Title level={2} className={styles.title}>Login Successful</Title>
                    <Text className={styles.subtitle}>Welcome back, {name}! Your session is now secure.</Text>
                </Space>

                <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                    {!refined ? (
                        <div style={{ background: '#f5f7fa', padding: '20px', borderRadius: '16px', border: '1px dashed #dcdde1' }}>
                            <Text style={{ color: '#2f3640', fontSize: '14px', display: 'block', marginBottom: '16px', fontWeight: 500 }}>
                                To ensure your account security, please verify your login location before entering the dashboard.
                            </Text>
                            <Button 
                                type="primary" 
                                ghost 
                                loading={refining} 
                                onClick={handleRefineLocation}
                                size="large"
                            >
                                {refining ? 'Verifying Location...' : '📍 Refine & Verify Location'}
                            </Button>
                        </div>
                    ) : (
                        <div style={{ background: '#e1f5fe', padding: '16px', borderRadius: '16px', color: '#0288d1', fontSize: '14px', fontWeight: 500 }}>
                            <CheckCircleOutlined style={{ marginRight: 8 }} />
                            Location verified! You can now proceed.
                        </div>
                    )}

                    <Button 
                        type="primary" 
                        block 
                        className={styles.enterButton}
                        onClick={handleEnter}
                        size="large"
                        disabled={!refined}
                    >
                        Enter Dashboard
                    </Button>
                </Space>
            </div>
        </div>
    );
};

export default SuccessLoginPage;

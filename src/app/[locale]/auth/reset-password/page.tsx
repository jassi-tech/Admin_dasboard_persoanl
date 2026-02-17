"use client";

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, App } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminCard from '@/components/common/AdminCard';
import styles from '../../login/login.module.scss';

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      message.error('Invalid reset link. Missing token.');
    }
  }, [token, message]);

  const onFinish = async (values: any) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: values.password
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        message.success(data.message);
      } else {
        message.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      message.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.loginWrapper}>
        <AdminCard className={styles.loginCard} style={{ textAlign: 'center' }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Title level={2}>Password Reset!</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            Your password has been successfully updated. You can now log in with your new password.
          </Text>
          <Button type="primary" block onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </AdminCard>
      </div>
    );
  }

  return (
    <div className={styles.loginWrapper}>
      <AdminCard className={styles.loginCard}>
        <Title level={2} className={styles.loginHeader}>Reset Password</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24, textAlign: 'center' }}>
          Enter your new password below to secure your account.
        </Text>
        
        <Form name="reset-password" onFinish={onFinish} size="large" layout="vertical">
          <Form.Item 
            name="password" 
            label="New Password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
          </Form.Item>
          
          <Form.Item 
            name="confirm" 
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your new password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} disabled={!token}>
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </AdminCard>
    </div>
  );
};

export default ResetPasswordPage;

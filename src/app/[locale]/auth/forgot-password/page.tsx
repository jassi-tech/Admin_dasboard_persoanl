"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Typography, App, Row, Col } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from '@/navigation';
import AdminCard from '@/components/common/AdminCard';
import styles from '../../login/login.module.scss';

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [debugLink, setDebugLink] = useState('');

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setEmailSent(true);
        if (data.debug_link) {
          setDebugLink(data.debug_link);
        }
        message.success(data.message);
      } else {
        message.error(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      message.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <AdminCard className={styles.loginCard}>
        <div style={{ marginBottom: 24 }}>
           <Button 
             type="link" 
             icon={<ArrowLeftOutlined />} 
             onClick={() => router.push('/login')}
             style={{ padding: 0 }}
           >
             Back to Login
           </Button>
        </div>

        <Title level={2} className={styles.loginHeader}>Forgot Password</Title>
        
        {!emailSent ? (
          <>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24, textAlign: 'center' }}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
            <Form name="forgot-password" onFinish={onFinish} size="large" layout="vertical">
              <Form.Item 
                name="email" 
                rules={[
                  { required: true, message: 'Please input your Email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Admin Email" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  Send Reset Link
                </Button>
              </Form.Item>
            </Form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <MailOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={4}>Check your email</Title>
            <Text type="secondary">
              If an account exists for that email, we've sent instructions to reset your password.
            </Text>
            
            {debugLink && (
              <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                <Text strong>Testing Reset Link:</Text>
                <br />
                <a href={debugLink}>{debugLink}</a>
              </div>
            )}
            
            <Button 
              type="primary" 
              block 
              onClick={() => router.push('/login')} 
              style={{ marginTop: 24 }}
            >
              Return to Login
            </Button>
          </div>
        )}
      </AdminCard>
    </div>
  );
};

export default ForgotPasswordPage;

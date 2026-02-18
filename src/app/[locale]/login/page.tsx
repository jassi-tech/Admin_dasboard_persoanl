"use client";

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Typography, App, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/navigation';
import AdminCard from '@/components/common/AdminCard';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import { getCredentials, saveCredentials, clearAllSessionData } from '@/utils/credentials';
import styles from './login.module.scss';

const { Title } = Typography;

const LoginPage = () => {
  const { message } = App.useApp();
  const t = useTranslations('Login');
  const router = useRouter();
  const isMounted = useIsMounted();
  const { authFetch } = useAuthFetch();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [form] = Form.useForm();

  const [submitting, setSubmitting] = useState(false);

  // Pre-fill form with saved credentials if available
  useEffect(() => {
    if (isMounted) {
      const savedCredentials = getCredentials();
      if (savedCredentials) {
        form.setFieldsValue({
          email: savedCredentials.email,
          password: savedCredentials.password,
          remember: true,
        });
      }
    }
  }, [isMounted, form]);

  useEffect(() => {
    // Redirect to dashboard if already authenticated (after checking)
    if (isMounted && isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isMounted, isAuthenticated, isLoading, router]);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    const rememberMe = values.remember;
    const { email, password } = values;
    
    try {
      // We pass 'true' to rememberMe here just to trigger the API call, 
      // but actual token isn't set until 2FA
      const result = await authFetch('/auth/login', { email, password }, false);
      
      if (result) {
        // Save email for 2FA step
        sessionStorage.setItem('temp_auth_email', email);
        
        // Save credentials locally if remember me is checked
        if (rememberMe) {
          saveCredentials(email, password);
          message.success('Credentials verified. Proceeding to 2FA...');
        } else {
          clearAllSessionData(false);
          message.success('Credentials verified.');
        }
        router.push('/auth/2fa');
      } else {
        // Clear fields on failure for security/UX as requested
        form.resetFields(['email', 'password']);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMounted || isLoading) {
    return (
      <div className={styles.loginWrapper}>
        <AdminCard className={styles.loginCard} loading={true}>
          <div style={{ height: '300px' }} />
        </AdminCard>
      </div>
    );
  }

  return (
    <div className={styles.loginWrapper}>
      <AdminCard className={styles.loginCard}>
        <Title level={2} className={styles.loginHeader}>{t('title')}</Title>
        <Form name="login" form={form} initialValues={{ remember: false }} onFinish={onFinish} size="large">
          <Form.Item name="email" rules={[{ required: true, message: 'Please input your Email!' }]}>
            <Input 
              prefix={<UserOutlined />} 
              placeholder={t('email')}
              autoComplete="email"
              type="email"
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please input your Password!' }]}>
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder={t('password')}
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item>
            <Row justify="space-between" align="middle">
              <Col>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>{t('remember_me')}</Checkbox>
                </Form.Item>
              </Col>
              <Col>
                <Link href="/auth/forgot-password" className={styles.forgotPassword}>
                  Forgot Password?
                </Link>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={submitting}>
              {t('submit')}
            </Button>
          </Form.Item>
        </Form>
      </AdminCard>
    </div>
  );
};

export default LoginPage;

"use client";

import React, { useState, useEffect } from 'react';
import { Input, Button, Typography, App } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import AdminCard from '@/components/common/AdminCard';
import { setCookie } from 'cookies-next';
import styles from './twofa.module.scss';

const { Title, Paragraph } = Typography;

// NOTE: isMounted pattern also used in dashboard/page.tsx and UserMap.tsx
// NOTE: Fetch error handling pattern also used in UserMap.tsx and dashboard/page.tsx
const TwoFAPage = () => {
  const { message } = App.useApp();
  const t = useTranslations('TwoFA');
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // NOTE: Similar fetch pattern used in user.controller.ts and other controllers
  const handleVerify = async () => {
    if (otp.length !== 6) {
      message.error('Please enter a valid 6-digit code');
      return;
    }

    const email = sessionStorage.getItem('temp_auth_email');

    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
      const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      
      // Auto-append /api if missing (standard for our production deployments)
      if (!isDev && baseUrl && !baseUrl.endsWith('/api')) {
        baseUrl += '/api';
      }

      const response = await fetch(`${baseUrl}/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otp, email }), // Send email for user lookup
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCookie('auth_token', data.token, { 
          maxAge: 60 * 60 * 24,
          path: '/',
          sameSite: 'lax'
        });
        // Clean up temp email
        sessionStorage.removeItem('temp_auth_email');
        
        if (data.user) {
            // Update local profile immediately
            try {
                const { saveUserProfile } = require('@/utils/profile');
                saveUserProfile(data.user);
            } catch (e) { 
                console.warn('Failed to save initial profile', e);
            }
        }

        message.success('Authentication successful!');
        router.push('/dashboard');
      } else {
        message.error(data.message || 'Verification failed');
      }
    } catch (error) {

      message.error('Connection error');
    }
  };

  if (!isMounted) return null;

  return (
    <div className={styles.twofaWrapper}>
      <AdminCard className={styles.twofaCard}>
        <Title level={2}>{t('title')}</Title>
        <Paragraph>{t('instruction')}</Paragraph>
        <div className={styles.otpContainer}>
          <Input.OTP length={6} value={otp} onChange={setOtp} size="large" />
        </div>
        <Button type="primary" block size="large" onClick={handleVerify}>
          {t('submit')}
        </Button>
        <Button type="link" className={styles.resendButton}>
          {t('resend')}
        </Button>
      </AdminCard>
    </div>
  );
};

export default TwoFAPage;

import React, { useState } from 'react';
import { Modal, Steps, Button, Input, Typography, Alert, Spin } from 'antd';
import { SafetyOutlined, QrcodeOutlined, CheckCircleOutlined, LockOutlined } from '@ant-design/icons';
import styles from './MFASetupModal.module.scss';

const { Title, Text, Paragraph } = Typography;

interface MFASetupModalProps {
    open: boolean;
    onCancel: () => void;
    onComplete: (mfaSecret: string) => void;
    userEmail: string;
}

const MFASetupModal: React.FC<MFASetupModalProps> = ({ open, onCancel, onComplete, userEmail }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');

    const generateQRCode = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/generate-mfa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setQrCodeUrl(data.qrCodeUrl);
                setSecret(data.secret);
                setCurrentStep(1);
            } else {
                setError(data.message || 'Failed to generate QR code');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const verifyCode = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-mfa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret, code: verificationCode })
            });
            
            const data = await response.json();
            
            if (response.ok && data.valid) {
                // Move to success step
                setCurrentStep(3);
                setVerificationCode('');
            } else {
                setError(data.message || 'Invalid code. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = () => {
        onComplete(secret);
        handleReset();
    };

    const handleReset = () => {
        setCurrentStep(0);
        setQrCodeUrl('');
        setSecret('');
        setVerificationCode('');
        setError('');
    };

    const handleCancel = () => {
        handleReset();
        onCancel();
    };

    const steps = [
        {
            title: 'Introduction',
            icon: <SafetyOutlined />,
        },
        {
            title: 'Scan QR Code',
            icon: <QrcodeOutlined />,
        },
        {
            title: 'Verify Code',
            icon: <LockOutlined />,
        },
        {
            title: 'Done',
            icon: <CheckCircleOutlined />,
        },
    ];

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className={styles.stepContent}>
                        <SafetyOutlined className={styles.largeIcon} />
                        <Title level={3}>Mandatory Two-Factor Authentication</Title>
                        <Paragraph>
                            For security reasons, all <strong>Superadmin</strong> accounts require Two-Factor Authentication (2FA) using Google Authenticator.
                        </Paragraph>
                        <Alert
                            message="What you'll need"
                            description={
                                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                                    <li>Google Authenticator app installed on your mobile device</li>
                                    <li>Your device ready to scan a QR code</li>
                                    <li>2-3 minutes to complete the setup</li>
                                </ul>
                            }
                            type="info"
                            showIcon
                        />
                        <Button 
                            type="primary" 
                            size="large" 
                            onClick={generateQRCode}
                            loading={loading}
                            style={{ marginTop: 24 }}
                        >
                            Begin Setup
                        </Button>
                    </div>
                );

            case 1:
                return (
                    <div className={styles.stepContent}>
                        <Title level={4}>Step 1: Scan QR Code</Title>
                        <Paragraph>
                            Open Google Authenticator on your mobile device and scan this QR code:
                        </Paragraph>
                        <div className={styles.qrCodeContainer}>
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="QR Code" className={styles.qrCode} />
                            ) : (
                                <Spin size="large" />
                            )}
                        </div>
                        <Alert
                            message="Manual Entry"
                            description={
                                <div>
                                    <Text type="secondary">Can't scan? Enter this code manually:</Text>
                                    <br />
                                    <Text code copyable>{secret}</Text>
                                </div>
                            }
                            type="warning"
                            showIcon
                            style={{ marginTop: 16 }}
                        />
                        <div style={{ marginTop: 24 }}>
                            <Text strong>Account: </Text>
                            <Text>{userEmail}</Text>
                        </div>
                        <Button 
                            type="primary" 
                            size="large" 
                            onClick={() => setCurrentStep(2)}
                            style={{ marginTop: 24 }}
                        >
                            I've Scanned the Code
                        </Button>
                    </div>
                );

            case 2:
                return (
                    <div className={styles.stepContent}>
                        <Title level={4}>Step 2: Verify Code</Title>
                        <Paragraph>
                            Enter the 6-digit code from your Google Authenticator app:
                        </Paragraph>
                        <Input 
                            placeholder="000000"
                            maxLength={6}
                            size="large"
                            value={verificationCode}
                            onChange={(e) => {
                                setVerificationCode(e.target.value.replace(/\D/g, ''));
                                setError('');
                            }}
                            className={styles.codeInput}
                            autoFocus
                            onPressEnter={verifyCode}
                        />
                        {error && (
                            <Alert
                                message={error}
                                type="error"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        )}
                        <Button 
                            type="primary" 
                            size="large" 
                            onClick={verifyCode}
                            loading={loading}
                            disabled={verificationCode.length !== 6}
                            style={{ marginTop: 24 }}
                        >
                            Verify Code
                        </Button>
                    </div>
                );

            case 3:
                return (
                    <div className={styles.stepContent}>
                        <CheckCircleOutlined className={styles.successIcon} />
                        <Title level={3}>Setup Complete!</Title>
                        <Paragraph>
                            Two-Factor Authentication has been successfully configured for this Superadmin account.
                        </Paragraph>
                        <Alert
                            message="Important"
                            description="The user will need to enter a code from Google Authenticator every time they log in."
                            type="success"
                            showIcon
                        />
                        <Button 
                            type="primary" 
                            size="large" 
                            onClick={handleComplete}
                            style={{ marginTop: 24 }}
                        >
                            Finish
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={600}
            className={styles.mfaModal}
            mask={{ closable: false }}
        >
            <div className={styles.modalContent}>
                <Steps current={currentStep} items={steps} className={styles.steps} />
                <div className={styles.contentWrapper}>
                    {renderStepContent()}
                </div>
                {/* Cancel button only for steps 1 and 2 */}
                {currentStep > 0 && currentStep < 3 && (
                    <div className={styles.footer}>
                        <Button onClick={handleCancel}>Cancel</Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default MFASetupModal;

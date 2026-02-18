import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App } from 'antd';
import { AuthSessionProvider } from '@/components/providers/AuthSessionProvider';

export async function generateMetadata({ params }: { params: Promise<any> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Login' });
    return {
        title: t('title')
    };
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<any>;
}) {
    const { locale } = await params;
    // const messages = await getMessages();
    const messages = await getMessages({ locale });

    return (
        <AntdRegistry>
            <NextIntlClientProvider messages={messages} locale={locale}>
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: '#1890ff',
                        },
                        cssVar: { key: 'app' },
                        hashed: false,
                    }}
                >
                    <AuthSessionProvider>
                        <App>
                            {children}
                        </App>
                    </AuthSessionProvider>
                </ConfigProvider>
            </NextIntlClientProvider>
        </AntdRegistry>
    );
}

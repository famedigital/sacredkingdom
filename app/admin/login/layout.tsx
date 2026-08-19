import { getCompanyName } from '@/lib/brand';

export async function generateMetadata() {
  const name = await getCompanyName();
  return {
    title: `Admin Login | ${name}`,
    description: `Sign in to the ${name} admin dashboard`,
    manifest: '/admin-pwa/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      title: `${name} Admin`,
      statusBarStyle: 'black-translucent',
    },
    icons: {
      icon: [
        { url: '/admin-pwa/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/admin-pwa/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/admin-pwa/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
  };
}

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

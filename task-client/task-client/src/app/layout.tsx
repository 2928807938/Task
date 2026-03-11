import './globals.css'
import '@/ui/styles/apple-style.css'
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import {Providers} from './providers'
import DisableZoom from '@/components/DisableZoom'
import {Toaster} from 'react-hot-toast'
import LoaderWrapper from '@/components/LoaderWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'TaskArk',
    description: '高效的任务管理应用',
    icons: {
        icon: '/images/taskark-logo.svg'
    }
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh" suppressHydrationWarning>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0" />
            <script dangerouslySetInnerHTML={{ 
                __html: `
                (function() {
                  // 获取保存的主题或检查系统偏好
                  function getInitialTheme() {
                    try {
                      const savedTheme = localStorage.getItem('theme-mode');
                      if (savedTheme === 'light' || savedTheme === 'dark') {
                        return savedTheme;
                      }
                    } catch (e) {
                      // localStorage 可能被禁用
                    }
                    
                    // 检查系统偏好
                    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
                      ? 'dark' 
                      : 'light';
                  }
                  
                  // 立即应用主题，防止闪烁
                  const theme = getInitialTheme();
                  document.documentElement.style.colorScheme = theme;
                  
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark-theme');
                  } else {
                    document.documentElement.classList.remove('dark-theme');
                  }
                })();
                ` 
            }} />
        </head>
        <body className={`${inter.className} min-h-screen bg-background`} suppressHydrationWarning>
            <DisableZoom />
            <Providers>
                <LoaderWrapper />
                {children}
            </Providers>
            <Toaster position="top-center" toastOptions={{
                style: {
                    background: 'var(--theme-card-bg)',
                    color: 'var(--foreground)',
                    boxShadow: 'var(--theme-shadow-lg)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    border: '1px solid var(--theme-card-border)',
                },
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: 'var(--theme-success-500)',
                        secondary: 'var(--theme-card-bg)',
                    },
                },
                error: {
                    duration: 4000,
                    iconTheme: {
                        primary: 'var(--theme-error-500)',
                        secondary: 'var(--theme-card-bg)',
                    },
                },
            }} />
        </body>
        </html>
    )
}

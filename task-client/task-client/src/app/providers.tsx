'use client'

import {QueryClientProvider} from '@tanstack/react-query'
import {queryClient} from '@/infrastructure/http/react-query-config'
import {ReactNode} from 'react'
import {ProtectedRoute} from '@/components/auth/ProtectedRoute'
import {ToastProvider} from '@/ui/molecules/Toast'
import {ThemeProvider} from '@/ui/theme'
import ToastInitializer from '@/components/ToastInitializer'
import {WebSocketProvider} from '@/contexts/WebSocketProvider'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <ToastProvider>
                    <ToastInitializer />
                    <ProtectedRoute>
                        <WebSocketProvider autoConnect={true}>
                            {children}
                        </WebSocketProvider>
                    </ProtectedRoute>
                </ToastProvider>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

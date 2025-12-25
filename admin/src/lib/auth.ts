'use client';

import { useRouter } from 'next/navigation';
import { adminApi } from './api';

export function useAuth() {
    const router = useRouter();

    const logout = () => {
        adminApi.logout();
        router.push('/');
    };

    return { logout };
}

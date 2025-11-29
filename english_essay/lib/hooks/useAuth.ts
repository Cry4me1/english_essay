'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string | undefined;
  fullName: string | null;
  avatarUrl: string | null;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; requiresEmailConfirmation?: boolean }>;
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  signInWithOAuth: (provider: 'github') => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

function mapUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: user.user_metadata?.full_name || null,
    avatarUrl: user.user_metadata?.avatar_url || null,
  };
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  // 初始化时获取用户状态
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(mapUser(user));
      setIsLoading(false);
    };

    getUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(mapUser(session?.user ?? null));
        
        if (event === 'SIGNED_IN') {
          router.refresh();
        } else if (event === 'SIGNED_OUT') {
          router.push('/');
          router.refresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // 邮箱密码登录
  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: '邮箱或密码错误' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: '请先验证邮箱' };
      }
      return { error: error.message };
    }

    router.push('/dashboard');
    return {};
  }, [supabase, router]);

  // 注册
  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    // 检查是否需要邮箱验证
    if (data.user && !data.session) {
      return { requiresEmailConfirmation: true };
    }

    router.push('/dashboard');
    return {};
  }, [supabase, router]);

  // Magic Link 登录
  const signInWithMagicLink = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  }, [supabase]);

  // OAuth 登录 (仅支持 GitHub，国内可用)
  const signInWithOAuth = useCallback(async (provider: 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  }, [supabase]);

  // 登出
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/');
  }, [supabase, router]);

  return {
    user,
    isLoading,
    signInWithPassword,
    signUp,
    signInWithMagicLink,
    signInWithOAuth,
    signOut,
  };
}


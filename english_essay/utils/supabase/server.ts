import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

import { getSupabaseConfig } from './config';

export const createSupabaseServerClient = async () => {
  const { url, anonKey } = getSupabaseConfig();
  const cookieStore = await cookies();
  const mutableCookies = cookieStore as unknown as {
    set?: (name: string, value: string, options?: CookieOptions) => void;
    delete?: (name: string, options?: CookieOptions) => void;
  };

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        mutableCookies.set?.(name, value, options);
      },
      remove(name: string, options?: CookieOptions) {
        mutableCookies.delete?.(name, options);
      },
    },
  });
};


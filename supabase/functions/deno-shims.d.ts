// Minimal ambient shims so the editor's TypeScript service understands these
// Deno Edge Functions. They describe only what the functions use; the real
// runtime types come from Deno at deploy time via `supabase functions deploy`.
// This file is NOT part of the Next.js build (supabase/ is excluded from the
// root tsconfig).

declare namespace Deno {
  const env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
  };
  function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: { port?: number; hostname?: string },
  ): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export function createClient(
    url: string,
    key: string,
    options?: Record<string, unknown>,
  ): any;
}

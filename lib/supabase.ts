import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getOptionalEnv, requireEnv } from "@/lib/env";

let serviceClient: SupabaseClient | null = null;

export function getSupabaseServiceClient(): SupabaseClient {
  if (!serviceClient) {
    serviceClient = createClient(
      requireEnv("SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
  }

  return serviceClient;
}

export function createSupabaseBrowserClient(): SupabaseClient {
  const url = getOptionalEnv("NEXT_PUBLIC_SUPABASE_URL") ?? requireEnv("SUPABASE_URL");
  const anonKey =
    getOptionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ??
    getOptionalEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ??
    requireEnv("SUPABASE_ANON_KEY");

  return createClient(url, anonKey);
}

export function getStoragePublicUrl(bucket: string, path: string): string {
  const storageUrl = getOptionalEnv("SUPABASE_STORAGE_URL");

  if (storageUrl) {
    return `${storageUrl.replace(/\/$/, "")}/${bucket}/${path.replace(/^\//, "")}`;
  }

  return `${requireEnv("SUPABASE_URL").replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${path.replace(/^\//, "")}`;
}

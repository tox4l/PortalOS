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

const DELIVERABLES_BUCKET = "deliverables";

export async function uploadDeliverableFile(
  path: string,
  file: ArrayBuffer,
  contentType: string
): Promise<string> {
  const client = getSupabaseServiceClient();
  const { error } = await client.storage
    .from(DELIVERABLES_BUCKET)
    .upload(path, file, { contentType, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return path;
}

export async function getDeliverableSignedUrl(path: string): Promise<string> {
  const client = getSupabaseServiceClient();
  const { data, error } = await client.storage
    .from(DELIVERABLES_BUCKET)
    .createSignedUrl(path, 60);

  if (error) throw new Error(`Signed URL failed: ${error.message}`);

  return data.signedUrl;
}

export async function deleteDeliverableFile(path: string): Promise<void> {
  const client = getSupabaseServiceClient();
  const { error } = await client.storage
    .from(DELIVERABLES_BUCKET)
    .remove([path]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}

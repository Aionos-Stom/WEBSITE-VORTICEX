import type { SupabaseClient } from '@supabase/supabase-js'

export type AuditAction =
  | 'login'
  | 'create'
  | 'update'
  | 'delete'
  | 'upload'
  | 'toggle'
  | 'send_email'
  | 'trash'
  | 'restore'

export interface AuditLog {
  id: string
  user_email: string | null
  action: AuditAction
  table_name: string | null
  record_title: string | null
  details: Record<string, unknown> | null
  created_at: string
}

export async function logAction(
  supabase: SupabaseClient,
  action: AuditAction,
  tableName?: string,
  recordTitle?: string,
  details?: Record<string, unknown>,
): Promise<void> {
  try {
    await supabase.from('admin_audit_log').insert([{
      action,
      table_name: tableName ?? null,
      record_title: recordTitle ?? null,
      details: details ?? null,
    }])
  } catch {
    // Audit failures must never break the main flow
  }
}

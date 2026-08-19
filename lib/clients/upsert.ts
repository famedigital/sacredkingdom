import { createAdminClient } from '@/utils/supabase/admin'

export type MasterClient = {
  id: string
  name: string
  email: string
  phone?: string | null
  country?: string | null
  nationality?: string | null
  notes?: string | null
  source?: string | null
  created_at?: string
  updated_at?: string
}

type UpsertInput = {
  name: string
  email: string
  phone?: string | null
  country?: string | null
  nationality?: string | null
  notes?: string | null
  source?: string
  userId?: string | null
}

/**
 * Find or create a master client by email (case-insensitive).
 * Updates name/phone when newer values are provided.
 */
export async function upsertMasterClient(
  input: UpsertInput
): Promise<MasterClient | null> {
  const email = String(input.email || '').trim().toLowerCase()
  const name = String(input.name || '').trim()
  if (!email || !name) return null

  const supabase = createAdminClient()

  const { data: existing, error: findError } = await supabase
    .from('clients')
    .select('*')
    .ilike('email', email)
    .maybeSingle()

  if (findError) {
    // Table may not exist yet — caller should tolerate null
    console.error('[upsertMasterClient] find:', findError.message)
    return null
  }

  if (existing) {
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (name) patch.name = name
    if (input.phone) patch.phone = input.phone
    if (input.country) patch.country = input.country
    if (input.nationality) patch.nationality = input.nationality
    if (input.notes) patch.notes = input.notes
    if (input.userId) patch.updated_by = input.userId

    const { data: updated, error: updateError } = await supabase
      .from('clients')
      .update(patch)
      .eq('id', existing.id)
      .select()
      .single()

    if (updateError) {
      console.error('[upsertMasterClient] update:', updateError.message)
      return existing as MasterClient
    }
    return updated as MasterClient
  }

  const { data: created, error: createError } = await supabase
    .from('clients')
    .insert({
      name,
      email,
      phone: input.phone || null,
      country: input.country || null,
      nationality: input.nationality || null,
      notes: input.notes || null,
      source: input.source || 'booking',
      created_by: input.userId || null,
      updated_by: input.userId || null,
    })
    .select()
    .single()

  if (createError) {
    console.error('[upsertMasterClient] create:', createError.message)
    return null
  }

  return created as MasterClient
}

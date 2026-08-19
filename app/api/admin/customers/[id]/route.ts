import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { isAuthError, requireAuth } from '@/lib/auth/require-auth'
import { isUuid } from '@/lib/ops/client-key'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth()
    if (isAuthError(auth)) return auth

    const raw = decodeURIComponent((await params).id || '').trim()
    if (!raw) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const supabase = createAdminClient()
    const email = raw.toLowerCase()

    let client: {
      id?: string
      name: string
      email: string
      phone?: string | null
    } | null = null

    if (isUuid(raw)) {
      const { data } = await supabase
        .from('clients')
        .select('id, name, email, phone')
        .eq('id', raw)
        .maybeSingle()
      if (data) {
        client = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
        }
      }
    }

    if (!client) {
      const { data } = await supabase
        .from('clients')
        .select('id, name, email, phone')
        .ilike('email', email)
        .maybeSingle()
      if (data) {
        client = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
        }
      }
    }

    let bookings: {
      id: string
      booking_number: string
      client_name: string
      client_email: string
      client_phone: string | null
      travel_date: string
      status: string
      tour_title: string
    }[] = []

    const mapBooking = (row: Record<string, unknown>) => {
      const tours = row.tours as { title?: string } | null
      return {
        id: String(row.id),
        booking_number: String(row.booking_number || ''),
        client_name: String(row.client_name || ''),
        client_email: String(row.client_email || ''),
        client_phone: (row.client_phone as string) || null,
        travel_date: String(row.travel_date || ''),
        status: String(row.status || ''),
        tour_title: String(row.tour_title || tours?.title || 'Trip'),
      }
    }

    const select =
      'id, booking_number, client_id, client_name, client_email, client_phone, travel_date, status, tour_title, tours(title)'

    if (client?.id) {
      const [{ data: byId }, { data: byEmail }] = await Promise.all([
        supabase.from('bookings').select(select).eq('client_id', client.id).limit(50),
        supabase.from('bookings').select(select).ilike('client_email', client.email).limit(50),
      ])
      const seen = new Set<string>()
      for (const row of [...(byId || []), ...(byEmail || [])]) {
        const mapped = mapBooking(row as Record<string, unknown>)
        if (seen.has(mapped.id)) continue
        seen.add(mapped.id)
        bookings.push(mapped)
      }
    } else {
      const { data: bookingRows, error: bookingError } = await supabase
        .from('bookings')
        .select(select)
        .ilike('client_email', email)
        .order('travel_date', { ascending: false })
        .limit(50)
      if (bookingError) throw bookingError
      bookings = (bookingRows || []).map((row) => mapBooking(row as Record<string, unknown>))
    }

    if (!client) {
      const first = bookings[0]
      if (!first) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      client = {
        name: first.client_name || email,
        email: first.client_email || email,
        phone: first.client_phone,
      }
    }

    return NextResponse.json({
      client,
      bookings,
    })
  } catch (error) {
    console.error('Customer detail error:', error)
    return NextResponse.json({ error: 'Failed to load client' }, { status: 500 })
  }
}

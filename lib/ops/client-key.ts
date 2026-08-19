export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

export function opsClientHref(client: { id?: string | null; email: string }) {
  const key = client.id || client.email
  return `/admin/operations/clients/${encodeURIComponent(key)}`
}

import { parseCheckout, safeExternalUrl, sanitizeRichText } from '@/lib/validation'

describe('parseCheckout', () => {
  const valid = {
    name: 'Ada Okonkwo',
    email: 'ada@example.org',
    entries: [
      { ticketTypeId: 'tt-dome', visitDate: '2026-09-16', category: 'adult', quantity: 2 },
    ],
  }

  it('accepts a well-formed payload', async () => {
    await expect(parseCheckout(valid)).resolves.toMatchObject({ email: 'ada@example.org' })
  })

  it('defaults giftAidOptIn to false', async () => {
    await expect(parseCheckout(valid)).resolves.toMatchObject({ giftAidOptIn: false })
  })

  it('rejects a malformed visit date', async () => {
    const payload = { ...valid, entries: [{ ...valid.entries[0], visitDate: '16-09-2026' }] }
    await expect(parseCheckout(payload)).rejects.toThrow(/YYYY-MM-DD/)
  })

  it('rejects an unknown ticket category', async () => {
    const payload = { ...valid, entries: [{ ...valid.entries[0], category: 'toddler' }] }
    await expect(parseCheckout(payload)).rejects.toThrow()
  })

  it('rejects an empty entry list', async () => {
    await expect(parseCheckout({ ...valid, entries: [] })).rejects.toThrow()
  })

  it('strips unknown keys', async () => {
    const parsed = await parseCheckout({ ...valid, isAdmin: true })
    expect(parsed).not.toHaveProperty('isAdmin')
  })
})

describe('sanitizeRichText', () => {
  it('keeps allowed formatting', () => {
    expect(sanitizeRichText('<p>Under <strong>dark skies</strong></p>')).toContain('<strong>')
  })

  it('drops script tags', () => {
    const cleaned = sanitizeRichText('<p>hi</p><script>alert(1)</script>')
    expect(cleaned).not.toContain('script')
  })

  it('drops event handler attributes', () => {
    expect(sanitizeRichText('<p onclick="steal()">hi</p>')).not.toContain('onclick')
  })
})

describe('safeExternalUrl', () => {
  it('passes through an https url', () => {
    expect(safeExternalUrl('https://cdn.sanity.io/img.png')).toBe('https://cdn.sanity.io/img.png')
  })

  it('rejects a javascript url', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBeUndefined()
  })

  it('returns undefined for empty input', () => {
    expect(safeExternalUrl(null)).toBeUndefined()
  })
})

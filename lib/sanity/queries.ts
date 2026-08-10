import { clientFor } from './client'

export interface TicketTypeDoc {
  _id: string
  title: string
  slug: string
  summary?: string
  categories: Array<'adult' | 'child' | 'senior' | 'student' | 'member'>
  timedEntry: boolean
  heroImage?: { url: string; alt?: string }
}

export interface ExhibitDoc {
  _id: string
  title: string
  slug: string
  standfirst?: string
  opensAt?: string
  closesAt?: string
  heroImage?: { url: string; alt?: string }
}

export interface ProductDoc {
  _id: string
  title: string
  slug: string
  priceCents: number
  inStock: boolean
  heroImage?: { url: string; alt?: string }
}

const IMAGE_PROJECTION = `heroImage{ "url": asset->url, alt }`

const TICKET_TYPES = `
*[_type == "ticketType" && !(_id in path("drafts.**"))] | order(displayOrder asc) {
  _id, title, "slug": slug.current, summary, categories, timedEntry, ${IMAGE_PROJECTION}
}`

const TICKET_TYPE_BY_SLUG = `
*[_type == "ticketType" && slug.current == $slug][0] {
  _id, title, "slug": slug.current, summary, categories, timedEntry, ${IMAGE_PROJECTION}
}`

const EXHIBITS = `
*[_type == "exhibit" && !(_id in path("drafts.**"))] | order(opensAt desc) {
  _id, title, "slug": slug.current, standfirst, opensAt, closesAt, ${IMAGE_PROJECTION}
}`

const PRODUCTS = `
*[_type == "product" && !(_id in path("drafts.**"))] | order(title asc) {
  _id, title, "slug": slug.current, priceCents, inStock, ${IMAGE_PROJECTION}
}`

const PRODUCT_BY_SLUG = `
*[_type == "product" && slug.current == $slug][0] {
  _id, title, "slug": slug.current, priceCents, inStock, ${IMAGE_PROJECTION}
}`

interface FetchOptions {
  preview?: boolean
  revalidate?: number | false
}

function fetchOpts({ revalidate = 300 }: FetchOptions) {
  return { next: { revalidate } } as const
}

export async function getTicketTypes(opts: FetchOptions = {}): Promise<TicketTypeDoc[]> {
  return clientFor({ preview: !!opts.preview }).fetch(TICKET_TYPES, {}, fetchOpts(opts))
}

export async function getTicketType(
  slug: string,
  opts: FetchOptions = {}
): Promise<TicketTypeDoc | null> {
  return clientFor({ preview: !!opts.preview }).fetch(TICKET_TYPE_BY_SLUG, { slug }, fetchOpts(opts))
}

export async function getExhibits(opts: FetchOptions = {}): Promise<ExhibitDoc[]> {
  return clientFor({ preview: !!opts.preview }).fetch(EXHIBITS, {}, fetchOpts(opts))
}

export async function getProducts(opts: FetchOptions = {}): Promise<ProductDoc[]> {
  return clientFor({ preview: !!opts.preview }).fetch(PRODUCTS, {}, fetchOpts(opts))
}

export async function getProduct(
  slug: string,
  opts: FetchOptions = {}
): Promise<ProductDoc | null> {
  return clientFor({ preview: !!opts.preview }).fetch(PRODUCT_BY_SLUG, { slug }, fetchOpts(opts))
}

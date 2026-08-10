import { BasketIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Shop product',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priceCents',
      title: 'Price (cents)',
      type: 'number',
      description: 'Stored in cents to avoid float rounding at checkout.',
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({ name: 'inStock', type: 'boolean', initialValue: true }),
    defineField({ name: 'description', type: 'array', of: [{ type: 'block' }] }),
    defineField({
      name: 'heroImage',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({ name: 'seo', type: 'seo' }),
  ],
  preview: {
    select: { title: 'title', priceCents: 'priceCents', media: 'heroImage' },
    prepare: ({ title, priceCents, media }) => ({
      title,
      subtitle: typeof priceCents === 'number' ? `$${(priceCents / 100).toFixed(2)}` : 'No price',
      media,
    }),
  },
})

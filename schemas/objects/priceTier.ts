import { defineField, defineType } from 'sanity'

export const priceTier = defineType({
  name: 'priceTier',
  title: 'Price tier',
  type: 'object',
  fields: [
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: ['adult', 'child', 'senior', 'student', 'member'],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'baseCents',
      title: 'Base price (cents)',
      type: 'number',
      description: 'Weekend surcharge and advance discount are applied at quote time.',
      validation: (rule) => rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: { category: 'category', baseCents: 'baseCents' },
    prepare: ({ category, baseCents }) => ({
      title: category ?? 'Untitled tier',
      subtitle: typeof baseCents === 'number' ? `$${(baseCents / 100).toFixed(2)}` : '—',
    }),
  },
})

import { TicketIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const ticketType = defineType({
  name: 'ticketType',
  title: 'Ticket type',
  type: 'document',
  icon: TicketIcon,
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'summary', type: 'text', rows: 3 }),
    defineField({
      name: 'categories',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Adult', value: 'adult' },
          { title: 'Child', value: 'child' },
          { title: 'Senior', value: 'senior' },
          { title: 'Student', value: 'student' },
          { title: 'Member', value: 'member' },
        ],
      },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'timedEntry',
      type: 'boolean',
      description: 'Timed-entry tickets draw from the EntrySlot capacity table.',
      initialValue: false,
    }),
    defineField({ name: 'priceTiers', type: 'array', of: [{ type: 'priceTier' }] }),
    defineField({
      name: 'heroImage',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({ name: 'displayOrder', type: 'number', initialValue: 100 }),
    defineField({ name: 'seo', type: 'seo' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'summary', media: 'heroImage' },
  },
})

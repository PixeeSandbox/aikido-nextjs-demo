import { StarIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const exhibit = defineType({
  name: 'exhibit',
  title: 'Exhibit',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'standfirst', type: 'text', rows: 2 }),
    defineField({ name: 'body', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'opensAt', type: 'datetime' }),
    defineField({
      name: 'closesAt',
      type: 'datetime',
      validation: (rule) =>
        rule.min(rule.valueOfField('opensAt')).warning('Closing date is before opening date'),
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({ name: 'seo', type: 'seo' }),
  ],
  orderings: [
    {
      title: 'Opening date, newest first',
      name: 'opensAtDesc',
      by: [{ field: 'opensAt', direction: 'desc' }],
    },
  ],
  preview: { select: { title: 'title', subtitle: 'standfirst', media: 'heroImage' } },
})

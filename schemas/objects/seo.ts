import { defineField, defineType } from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'metaTitle',
      type: 'string',
      validation: (rule) => rule.max(60).warning('Titles over 60 characters get truncated'),
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      rows: 2,
      validation: (rule) =>
        rule.max(160).warning('Descriptions over 160 characters get truncated'),
    }),
    defineField({ name: 'noIndex', title: 'Hide from search engines', type: 'boolean' }),
  ],
})

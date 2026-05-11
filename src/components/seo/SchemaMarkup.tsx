interface SchemaMarkupProps {
  schemas: object | object[]
}

// Renders one or more JSON-LD schemas as <script> tags in the document <head>.
// Accepts a single schema object or an array — each item gets its own tag
// so validators see them as separate graphs.
export default function SchemaMarkup({ schemas }: SchemaMarkupProps) {
  const items = Array.isArray(schemas) ? schemas : [schemas]

  return (
    <>
      {items.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

/**
 * Renders a schema.org JSON-LD block. Server-safe (no "use client"), so the
 * structured data ships in the initial HTML where crawlers can read it.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inject; escape "<" defensively.
      dangerouslySetInnerHTML={{ __html: json.replace(/</g, "\\u003c") }}
    />
  );
}

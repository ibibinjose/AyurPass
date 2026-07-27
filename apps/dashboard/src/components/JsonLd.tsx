/**
 * Renders a schema.org JSON-LD block. Server-safe (no "use client"), so the
 * structured data ships in the initial HTML where crawlers can read it.
 */
type JsonLdNode = Record<string, unknown>;

function normalizeJsonLd(data: JsonLdNode | JsonLdNode[]) {
  if (!Array.isArray(data)) return data;

  return {
    "@context": "https://schema.org",
    "@graph": data.map((entry) => {
      const node = { ...entry };
      delete node["@context"];
      return node;
    }),
  };
}

export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] }) {
  const json = JSON.stringify(normalizeJsonLd(data));
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inject; escape "<" defensively.
      dangerouslySetInnerHTML={{ __html: json.replace(/</g, "\\u003c") }}
    />
  );
}

/** `text` with the first case-insensitive occurrence of `query` in bold ("**Ac**me Corp"). */
export function HighlightedMatch({ text, query }: { text: string; query: string }) {
  const start = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (start === -1) {
    return text;
  }
  const end = start + query.length;
  return (
    <>
      {text.slice(0, start)}
      <strong className="font-semibold">{text.slice(start, end)}</strong>
      {text.slice(end)}
    </>
  );
}

// Utility to parse a string with [text](url) and convert to HTML anchor tags
export function parseHtmlLinks(input: string): string {
  if (!input) return "";
  // Regex to match [text](url)
  const linkRegex = /\[([^\]]*)\]\(((?:[^()]*\([^)]*\))*[^)]*)\)/g;
  return input.replace(linkRegex, '<a class="govuk-link" target="_blank" href="$2">$1</a>');
}


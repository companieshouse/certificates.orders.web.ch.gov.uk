// Utility to parse a string with [text](url) and convert to HTML anchor tags
export function parseHtmlLinks(input: string): string {
  if (!input) return "";
  // Regex to match [text](url)
  return input.replace(/\[([^\]]*)\]\(([^]*)\)/g, '<a class="govuk-link" href="$2">$1</a>');
}


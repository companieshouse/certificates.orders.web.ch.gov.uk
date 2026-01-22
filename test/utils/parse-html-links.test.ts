import { expect } from "chai";
import { parseHtmlLinks } from "../../src/utils/parse-html-links";

describe("parseHtmlLinks", () => {
  it("returns empty string for empty input", () => {
    expect(parseHtmlLinks("")).to.equal("");
  });

  it("returns the same string when there are no markdown links", () => {
    const input = "This string contains no links";
    expect(parseHtmlLinks(input)).to.equal(input);
  });

  it("converts a single markdown link", () => {
    const input = "See [GOV.UK](https://www.gov.uk) for details";
    const expected = 'See <a class="govuk-link" target="_blank" href="https://www.gov.uk">GOV.UK</a> for details';
    expect(parseHtmlLinks(input)).to.equal(expected);
  });

  it("converts multiple markdown links in the same string", () => {
    const input = "One [A](https://a.test) and [B](https://b.test)";
    const expected = 'One <a class="govuk-link" target="_blank" href="https://a.test">A</a> and <a class="govuk-link" target="_blank" href="https://b.test">B</a>';
    expect(parseHtmlLinks(input)).to.equal(expected);
  });

  it("handles URLs containing parentheses", () => {
    const input = "See [example](https://example.test/path(foo)) for details";
    const expected = 'See <a class="govuk-link" target="_blank" href="https://example.test/path(foo)">example</a> for details';
    expect(parseHtmlLinks(input)).to.equal(expected);
  });

  it("handles links where URL contains newlines", () => {
    const input = "Broken [link](https://example.test/line1\nline2) end";
    // the current implementation allows newlines in URL and will include them inside href
    const expected = 'Broken <a class="govuk-link" target="_blank" href="https://example.test/line1\nline2">link</a> end';
    expect(parseHtmlLinks(input)).to.equal(expected);
  });

  it("does not alter malformed markdown (missing closing parenthesis)", () => {
    const input = "This is [bad](https://example.test";
    expect(parseHtmlLinks(input)).to.equal(input);
  });

  it("does not crash and preserves other HTML-like content", () => {
    const input = "<script>alert('x')</script> and [Link](https://ok)";
    const expected = "<script>alert('x')</script> and <a class=\"govuk-link\" target=\"_blank\" href=\"https://ok\">Link</a>";
    expect(parseHtmlLinks(input)).to.equal(expected);
  });

  it("handles empty link text and empty url (edge case)", () => {
    const input = "Empty []() here";
    // group capture allows empty text and empty url. The function will produce an anchor with empty href/text
    const expected = 'Empty <a class="govuk-link" target="_blank" href=""></a> here';
    expect(parseHtmlLinks(input)).to.equal(expected);
  });

  it("does not improperly parse nested brackets (leaves malformed markdown alone)", () => {
    const input = "Nested [a [b]](https://ok) end";
    // the regex will not successfully match the outer form, so input should be unchanged.
    expect(parseHtmlLinks(input)).to.equal(input);
  });
});


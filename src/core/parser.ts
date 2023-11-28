import { parse } from 'node-html-parser';

export default class Parser {
  async parse(html: string, host: string) {
    const { Readability } = require("@mozilla/readability");

    const document = await this.createDocument(html);
    const reader = new Readability(document);
    const parsed = reader.parse();
    const cleanedContent = this.cleanHtml(parsed.content, host);
    const content = await this.convertToMarkdown(cleanedContent);
    const title = this.getTitle(html) ?? parsed.title;

    return {
      title,
      content,
    }
  }

  private async convertToMarkdown(html: string) {
    const { NodeHtmlMarkdown } = await import('node-html-markdown');

    return NodeHtmlMarkdown.translate(html);
  }

  private async createDocument(html: string) {
    const { Window } = await import('happy-dom');
    const window = new Window();
    const document = window.document;

    document.write(html);

    return document;
  }

  private cleanHtml(content: string, host: string) {
    const html = parse(content);
    const links = html.querySelectorAll('a');

    links.forEach((link) => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');

      const href = link.getAttribute('href');

      // if the link is relative, make it absolute
      if (href && href.startsWith('/')) {
        link.setAttribute('href', `${host}${href}`);
      }
    });

    return html.innerHTML;
  }

  private getTitle(content: string) {
    const html = parse(content);
    const title = html.querySelector('title');

    return title ? title.rawText : '';
  }
}

import type { Plugin } from 'prettier';
import parserMeriyah from 'prettier/parser-meriyah';

export const removeCommentsPlugin: Plugin = {
  parsers: {
    'meriyah-remove-comments': {
      ...parserMeriyah.parsers.meriyah,
      parse(text, parsers, options) {
        const ast = parserMeriyah.parsers.meriyah.parse(text, parsers, options) as {
          comments?: unknown;
        };
        delete ast.comments;
        return ast;
      },
    },
  },
};

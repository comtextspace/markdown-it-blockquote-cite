// Thanks
// https://stackoverflow.com/a/15030117/1870317

function flatten(arr) {
    return arr.reduce((flat, toFlatten) => (
      flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten)
    ), []);
  }
  
function zip(array1, array2) {
    return array1.map((element, index) => [element, array2[index]]);
  }

function updateBlockquote(tokens, Token, attributionPrefix) {
    const { baseLevel } = tokens[0];
    const quoteLines = tokens
      .filter((token) => token.type === 'inline')
      .map((token) => token.content.split('\n'));
  
    return flatten(quoteLines).map((quoteLine) => singleQuoteLineTokens(quoteLine));
  
    function singleQuoteLineTokens(quoteLine) {
      const trimmedQuoteLine = quoteLine.trimStart();
      if (trimmedQuoteLine.startsWith(attributionPrefix)) {
        const quoteLineWithoutPrefix = trimmedQuoteLine.replace(attributionPrefix, '').trimStart();
        return [
          citationOpeningToken(baseLevel + 1),
          inlineToken(quoteLineWithoutPrefix, baseLevel + 2),
          citationClosingToken(baseLevel + 1),
        ];
      }
  
      return [
        paragraphOpeningToken(baseLevel + 1),
        inlineToken(quoteLine, baseLevel + 2),
        paragraphClosingToken(baseLevel + 1),
      ];
    }
  
    function citationOpeningToken(level) {
      return citationToken(level, 1);
    }
  
    function citationClosingToken(level) {
      return citationToken(level, -1);
    }
  
    function citationToken(level, nesting) {
      const token = new Token('paragraph_open', 'cite', nesting);
      token.level = level;
      token.block = true;
      return token;
    }
  
    function paragraphOpeningToken(level) {
      return paragraphToken(level, 1);
    }
  
    function paragraphClosingToken(level) {
      return paragraphToken(level, -1);
    }
  
    function inlineToken(content, level) {
      const token = new Token('inline', '', 0);
      token.content = content;
      token.level = level + 2;
      token.block = true;
      token.children = [];
      return token;
    }
  
    function paragraphToken(level, nesting) {
      const token = new Token('paragraph_open', 'p', nesting);
      token.level = level;
      token.block = true;
      return token;
    }
  }

module.exports = function plugin(md, options) {
  const attributionPrefix = (options && options.attributionPrefix) || '--';
  let Token;

  function setupBlockquoteRule() {
    md.core.ruler.after('block', 'attribution', blockquoteRule);
  }

  function blockquoteRule(state) {
    // make Token constructor accessible to deeply nested helper functions
    Token = state.Token;

    const indicePairs = blockquoteIndicePairs(state.tokens);

    indicePairs.forEach((indices) => {
      const [fromIndex, toIndex] = indices;
      const originalBlockquoteTokens = state.tokens.slice(fromIndex, toIndex + 1);
      const updatedBlockquoteTokens = customBlockquoteTokens(originalBlockquoteTokens);
      replaceBlockquoteTokens(state.tokens, fromIndex, toIndex, updatedBlockquoteTokens);
    });
  }

  function blockquoteIndicePairs(tokens) {
    const blockquoteOpenIndices = indicesWithTokenType(tokens, 'blockquote_open');
    const blockquoteCloseIndices = indicesWithTokenType(tokens, 'blockquote_close');

    return zip(blockquoteOpenIndices, blockquoteCloseIndices);
  }

  function replaceBlockquoteTokens(tokens, fromIndex, toIndex, updatedTokens) {
    const deleteCount = toIndex - fromIndex + 1;

    tokens.splice(fromIndex, deleteCount, ...updatedTokens);
  }

  function customBlockquoteTokens(blockquoteTokens) {
    const openingToken = blockquoteTokens[0];
    const closingToken = blockquoteTokens[blockquoteTokens.length - 1];
    const updatedBlockquoteTokens = updateBlockquote(blockquoteTokens, Token, attributionPrefix);

    return flatten([openingToken, updatedBlockquoteTokens, closingToken]);
  }

  function indicesWithTokenType(tokens, tokenType) {
    const mapped = tokens.map((token, index) => (token.type === tokenType ? index : null));
    const filtered = mapped.filter((element) => element !== null);
    return filtered;
  }

  setupBlockquoteRule();
}

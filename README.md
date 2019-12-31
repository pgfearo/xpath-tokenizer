# xpath-tokenizer

work in progress...

Possible uses:
- Syntax Highlighting
- Semantic Highlighting
  - Unused variables
  - Unresolved variable references
  - Code block matching
- Linting

Future intentions:
- Integrate with a similarly designed XSLT 3.0 Tokenizer

Design Goals:
- Single pass of text, character by character
- Disambiguate tokens in the same pass
- Use single character lookahead
- No regex
- Manage scope of tokens in an object tree
- Not a parser, so theres no AST

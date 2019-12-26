import { Lexer, Token, CharLevelState, TokenLevelState } from './Lexer'

test('number token', () => {
    let l: Lexer = new Lexer();

    let t1: Token = { 
      value: "255", 
      charType: CharLevelState.lNl, 
      tokenType: TokenLevelState.Number
    };
    expect(l.analyse('255+union')[0]).toEqual(t1);
})
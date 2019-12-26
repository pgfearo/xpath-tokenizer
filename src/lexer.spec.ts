import { Lexer, Token, CharLevelState, TokenLevelState, Utilities } from './Lexer'

test('child tokens', () => {
  let l: Lexer = new Lexer();
  let rx: Token[] = l.analyse('1 + 2');
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: "1",
tokenType: TokenLevelState.Number
},
{value: "+",
tokenType: TokenLevelState.Operator
},
{value: "2",
tokenType: TokenLevelState.Number
},]
  expect (r).toEqual(ts);
});

test('number token', () => {
    let l: Lexer = new Lexer();
    let r: Token[] = l.analyse('255.7e-2+union');

    let t0: Token = { 
      value: "255.7e-2", 
      charType: CharLevelState.lNl, 
      tokenType: TokenLevelState.Number
    };
    let t1: Token = { 
      value: "+", 
      charType: CharLevelState.sep, 
      tokenType: TokenLevelState.Operator
    };
    let t2: Token = { 
      value: "union", 
      charType: CharLevelState.lName,
      tokenType: TokenLevelState.Name
    };
    expect(r[0]).toEqual(t0);
    expect(r[1]).toEqual(t1);
    expect(r[2]).toEqual(t2);
});

test('child tokens', () => {
  let l: Lexer = new Lexer();
  let r: Token[] = l.analyse('255+($union+28)');
  let ts: Token[] = [
{value: "255",
charType: CharLevelState.lNl,
tokenType: TokenLevelState.Number
},
{value: "+",
charType: CharLevelState.sep,
tokenType: TokenLevelState.Operator
},
{value: "(",
charType: CharLevelState.lB,
tokenType: TokenLevelState.Operator,
children:[
{value: "$union",
charType: CharLevelState.lVar,
tokenType: TokenLevelState.Variable
},
{value: "+",
charType: CharLevelState.sep,
tokenType: TokenLevelState.Operator
},
{value: "28",
charType: CharLevelState.lNl,
tokenType: TokenLevelState.Number
},]
},
{value: ")",
charType: CharLevelState.rB,
tokenType: TokenLevelState.Operator
},]
  expect (r).toEqual(ts);
});
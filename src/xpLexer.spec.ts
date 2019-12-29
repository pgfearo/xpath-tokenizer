import { XPathLexer, Token, CharLevelState, TokenLevelState, Utilities } from './xpLexer'

test('numeric operator', () => {
  let l: XPathLexer = new XPathLexer();
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
       
test(`stringLiteral escaping`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`'fir''st' || "seco""nd"`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `'fir''st'`,
tokenType: TokenLevelState.String
},
{value: `||`,
tokenType: TokenLevelState.Operator
},
{value: `"seco""nd"`,
tokenType: TokenLevelState.String
},]
  expect (r).toEqual(ts);
});

test('number token', () => {
    let l: XPathLexer = new XPathLexer();
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
  let l: XPathLexer = new XPathLexer();
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


        
test(`resolve ambiguous keywords`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`union and union and union div $var, div/and/union and .. and union`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `union`,
tokenType: TokenLevelState.Name
},
{value: `and`,
tokenType: TokenLevelState.Operator
},
{value: `union`,
tokenType: TokenLevelState.Name
},
{value: `and`,
tokenType: TokenLevelState.Operator
},
{value: `union`,
tokenType: TokenLevelState.Name
},
{value: `div`,
tokenType: TokenLevelState.Operator
},
{value: `$var`,
tokenType: TokenLevelState.Variable
},
{value: `,`,
tokenType: TokenLevelState.Operator
},
{value: `div`,
tokenType: TokenLevelState.Name
},
{value: `/`,
tokenType: TokenLevelState.Operator
},
{value: `and`,
tokenType: TokenLevelState.Name
},
{value: `/`,
tokenType: TokenLevelState.Operator
},
{value: `union`,
tokenType: TokenLevelState.Name
},
{value: `and`,
tokenType: TokenLevelState.Operator
},
{value: `..`,
tokenType: TokenLevelState.Operator
},
{value: `and`,
tokenType: TokenLevelState.Operator
},
{value: `union`,
tokenType: TokenLevelState.Name
},]
  expect (r).toEqual(ts);
});


        
test(`literal uri`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`$a eq Q{http://example.com}div`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `$a`,
tokenType: TokenLevelState.Variable
},
{value: `eq`,
tokenType: TokenLevelState.Operator
},
{value: `Q{http://example.com}`,
tokenType: TokenLevelState.UriLiteral
},
{value: `div`,
tokenType: TokenLevelState.Name
},]
  expect (r).toEqual(ts);
});
       
test(`attribute castable as simple type`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`@myatt castable as xs:integer and $b`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `@myatt`,
tokenType: TokenLevelState.Attribute
},
{value: `castable`,
tokenType: TokenLevelState.Operator
},
{value: `as`,
tokenType: TokenLevelState.Operator
},
{value: `xs:integer`,
tokenType: TokenLevelState.SimpleType
},
{value: `and`,
tokenType: TokenLevelState.Operator
},
{value: `$b`,
tokenType: TokenLevelState.Variable
},]
  expect (r).toEqual(ts);
});


        
test(`axis and nodetype`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`ancestor::node() union parent::table/@name`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `ancestor`,
tokenType: TokenLevelState.Axis
},
{value: `::`,
tokenType: TokenLevelState.Operator
},
{value: `node`,
tokenType: TokenLevelState.NodeType
},
{value: `()`,
tokenType: TokenLevelState.Operator
},
{value: `union`,
tokenType: TokenLevelState.Operator
},
{value: `parent`,
tokenType: TokenLevelState.Axis
},
{value: `::`,
tokenType: TokenLevelState.Operator
},
{value: `table`,
tokenType: TokenLevelState.Name
},
{value: `/`,
tokenType: TokenLevelState.Operator
},
{value: `@name`,
tokenType: TokenLevelState.Attribute
},]
  expect (r).toEqual(ts);
});


        
test(`declarations`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`ancestor::node() union parent::table/@name`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `ancestor`,
tokenType: TokenLevelState.Axis
},
{value: `::`,
tokenType: TokenLevelState.Operator
},
{value: `node`,
tokenType: TokenLevelState.NodeType
},
{value: `()`,
tokenType: TokenLevelState.Operator
},
{value: `union`,
tokenType: TokenLevelState.Operator
},
{value: `parent`,
tokenType: TokenLevelState.Axis
},
{value: `::`,
tokenType: TokenLevelState.Operator
},
{value: `table`,
tokenType: TokenLevelState.Name
},
{value: `/`,
tokenType: TokenLevelState.Operator
},
{value: `@name`,
tokenType: TokenLevelState.Attribute
},]
  expect (r).toEqual(ts);
});
        
test(`function call`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`count($a)`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `count`,
tokenType: TokenLevelState.Function
},
{value: `(`,
tokenType: TokenLevelState.Operator,
children:[
{value: "$a",
charType: CharLevelState.lVar,
tokenType: TokenLevelState.Variable
},]
},
{value: `)`,
tokenType: TokenLevelState.Operator
},]
  expect (r).toEqual(ts);
});

test(`* wildcard 1`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`* union $b`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `*`,
tokenType: TokenLevelState.NodeType
},
{value: `union`,
tokenType: TokenLevelState.Operator
},
{value: `$b`,
tokenType: TokenLevelState.Variable
},]
  expect (r).toEqual(ts);
});
        
test(`* wildcard 2`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`pre:* union $b`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `pre`,
tokenType: TokenLevelState.Name
},
{value: `:*`,
tokenType: TokenLevelState.NodeType
},
{value: `union`,
tokenType: TokenLevelState.Operator
},
{value: `$b`,
tokenType: TokenLevelState.Variable
},]
  expect (r).toEqual(ts);
});
       
test(`* wildcard 3`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`/*:name div $b`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `/`,
tokenType: TokenLevelState.Operator
},
{value: `*:`,
tokenType: TokenLevelState.Operator
},
{value: `name`,
tokenType: TokenLevelState.Name
},
{value: `div`,
tokenType: TokenLevelState.Operator
},
{value: `$b`,
tokenType: TokenLevelState.Variable
},]
  expect (r).toEqual(ts);
});
       
test(`* wildcard 4`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`Q{http://example.com}* eq $b`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `Q{http://example.com}`,
tokenType: TokenLevelState.UriLiteral
},
{value: `*`,
tokenType: TokenLevelState.NodeType
},
{value: `eq`,
tokenType: TokenLevelState.Operator
},
{value: `$b`,
tokenType: TokenLevelState.Variable
},]
  expect (r).toEqual(ts);
});

test(`* multiplication`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`$var * 8`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `$var`,
tokenType: TokenLevelState.Variable
},
{value: `*`,
tokenType: TokenLevelState.Operator
},
{value: `8`,
tokenType: TokenLevelState.Number
},]
  expect (r).toEqual(ts);
});
       
test(`array curly brace`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`array {1}`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `array`,
tokenType: TokenLevelState.Operator
},
{value: `{`,
tokenType: TokenLevelState.Operator,
children:[
{value: "1",
charType: CharLevelState.lNl,
tokenType: TokenLevelState.Number
},]
},
{value: `}`,
tokenType: TokenLevelState.Operator
},]
  expect (r).toEqual(ts);
});
       
test(`array square brace`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`array [1]`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `array`,
tokenType: TokenLevelState.Operator
},
{value: `[`,
tokenType: TokenLevelState.Operator,
children:[
{value: "1",
charType: CharLevelState.lNl,
tokenType: TokenLevelState.Number
},]
},
{value: `]`,
tokenType: TokenLevelState.Operator
},]
  expect (r).toEqual(ts);
});
        
test(`declaration`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`map {25: first}`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `map`,
tokenType: TokenLevelState.Operator
},
{value: `{`,
tokenType: TokenLevelState.Operator,
children:[
{value: "25",
charType: CharLevelState.lNl,
tokenType: TokenLevelState.Number
},
{value: ":",
charType: CharLevelState.sep,
tokenType: TokenLevelState.Operator
},
{value: " ",
charType: CharLevelState.lWs,
tokenType: TokenLevelState.Whitespace
},
{value: "first",
charType: CharLevelState.lName,
tokenType: TokenLevelState.Name
},]
},
{value: `}`,
tokenType: TokenLevelState.Operator
},]
  expect (r).toEqual(ts);
});




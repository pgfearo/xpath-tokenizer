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
test(`parenthesis sum`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`255+($union+28)`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `255`,
tokenType: TokenLevelState.Number
},
{value: `+`,
tokenType: TokenLevelState.Operator
},
{value: `(`,
tokenType: TokenLevelState.Operator,
children:[
{value: `$union`,
tokenType: TokenLevelState.Variable
},
{value: `+`,
tokenType: TokenLevelState.Operator
},
{value: `28`,
tokenType: TokenLevelState.Number
},]
},
{value: `)`,
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


        
test(`axis and attribute shorthand`, () => {
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
tokenType: TokenLevelState.Number
},
{value: ":",
tokenType: TokenLevelState.Operator
},
{value: "first",
tokenType: TokenLevelState.Name
},]
},
{value: `}`,
tokenType: TokenLevelState.Operator
},]
  expect (r).toEqual(ts);
});
        
test(`valid names`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`$pre:var22.5a || pre:name22.5b`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `$pre:var22.5a`,
tokenType: TokenLevelState.Variable
},
{value: `||`,
tokenType: TokenLevelState.Operator
},
{value: `pre:name22.5b`,
tokenType: TokenLevelState.Name
},]
  expect (r).toEqual(ts);
});
       
test(`valid names 2`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`$_pre:var22.5a || _pre:name22.5b`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `$_pre:var22.5a`,
tokenType: TokenLevelState.Variable
},
{value: `||`,
tokenType: TokenLevelState.Operator
},
{value: `_pre:name22.5b`,
tokenType: TokenLevelState.Name
},]
  expect (r).toEqual(ts);
});
               
test(`if then else`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`if ($a eq 5) then $a else union`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `if`,
tokenType: TokenLevelState.Operator
},
{value: `(`,
tokenType: TokenLevelState.Operator,
children:[
{value: `$a`,
tokenType: TokenLevelState.Variable
},
{value: `eq`,
tokenType: TokenLevelState.Operator
},
{value: `5`,
tokenType: TokenLevelState.Number
},]
},
{value: `)`,
tokenType: TokenLevelState.Operator
},
{value: `then`,
tokenType: TokenLevelState.Operator,
children:[
{value: `$a`,
tokenType: TokenLevelState.Variable
},
{value: `else`,
tokenType: TokenLevelState.Operator
},]
},
{value: `union`,
tokenType: TokenLevelState.Name
},]
  expect (r).toEqual(ts);
});
       
test(`numeric literals with dot chars`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`.55 + 1.`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `.55`,
tokenType: TokenLevelState.Number
},
{value: `+`,
tokenType: TokenLevelState.Operator
},
{value: `1.`,
tokenType: TokenLevelState.Number
},]
  expect (r).toEqual(ts);
});

test(`map type`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`$M instance of map(xs:integer, xs:string)`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `$M`,
tokenType: TokenLevelState.Variable
},
{value: `instance`,
tokenType: TokenLevelState.Operator
},
{value: `of`,
tokenType: TokenLevelState.Operator
},
{value: `map`,
tokenType: TokenLevelState.SimpleType
},
{value: `(`,
tokenType: TokenLevelState.Operator,
children:[
{value: `xs:integer`,
tokenType: TokenLevelState.Name
},
{value: `,`,
tokenType: TokenLevelState.Operator
},
{value: `xs:string`,
tokenType: TokenLevelState.Name
},]
},
{value: `)`,
tokenType: TokenLevelState.Operator
},]
  expect (r).toEqual(ts);
});
       
test(`if else if else`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`if (level1) then 1 else if (level2) then 2 else 0`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `if`,
tokenType: TokenLevelState.Operator
},
{value: `(`,
tokenType: TokenLevelState.Operator,
children:[
{value: `level1`,
tokenType: TokenLevelState.Name
},]
},
{value: `)`,
tokenType: TokenLevelState.Operator
},
{value: `then`,
tokenType: TokenLevelState.Operator,
children:[
{value: `1`,
tokenType: TokenLevelState.Number
},
{value: `else`,
tokenType: TokenLevelState.Operator
},]
},
{value: `if`,
tokenType: TokenLevelState.Operator
},
{value: `(`,
tokenType: TokenLevelState.Operator,
children:[
{value: `level2`,
tokenType: TokenLevelState.Name
},]
},
{value: `)`,
tokenType: TokenLevelState.Operator
},
{value: `then`,
tokenType: TokenLevelState.Operator,
children:[
{value: `2`,
tokenType: TokenLevelState.Number
},
{value: `else`,
tokenType: TokenLevelState.Operator
},]
},
{value: `0`,
tokenType: TokenLevelState.Number
},]
  expect (r).toEqual(ts);
});
        
test(`if if else else`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`if (level1) then if (level1.1) then 1.1 else 1.0 else 0`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `if`,
tokenType: TokenLevelState.Operator
},
{value: `(`,
tokenType: TokenLevelState.Operator,
children:[
{value: `level1`,
tokenType: TokenLevelState.Name
},]
},
{value: `)`,
tokenType: TokenLevelState.Operator
},
{value: `then`,
tokenType: TokenLevelState.Operator,
children:[
{value: `if`,
tokenType: TokenLevelState.Operator
},
{value: `(`,
tokenType: TokenLevelState.Operator,
children:[
{value: `level1.1`,
tokenType: TokenLevelState.Name
},]
},
{value: `)`,
tokenType: TokenLevelState.Operator
},
{value: `then`,
tokenType: TokenLevelState.Operator,
children:[
{value: `1.1`,
tokenType: TokenLevelState.Number
},
{value: `else`,
tokenType: TokenLevelState.Operator
},]
},
{value: `1.0`,
tokenType: TokenLevelState.Number
},
{value: `else`,
tokenType: TokenLevelState.Operator
},]
},
{value: `0`,
tokenType: TokenLevelState.Number
},]
  expect (r).toEqual(ts);
});
        
test(`comma inside if expr - error`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`if ($a) then 1,2 else 1`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `if`,
tokenType: TokenLevelState.Operator
},
{value: `(`,
tokenType: TokenLevelState.Operator,
children:[
{value: `$a`,
tokenType: TokenLevelState.Variable
},]
},
{value: `)`,
tokenType: TokenLevelState.Operator
},
{value: `then`,
tokenType: TokenLevelState.Operator,
children:[
{value: `1`,
tokenType: TokenLevelState.Number
},
{value: `,`,
error: true,
tokenType: TokenLevelState.Operator
},
{value: `2`,
tokenType: TokenLevelState.Number
},
{value: `else`,
tokenType: TokenLevelState.Operator
},]
},
{value: `1`,
tokenType: TokenLevelState.Number
},]
  expect (r).toEqual(ts);
});
       
        
test(`declaration`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`let $a := 2 return $a`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `let`,
tokenType: TokenLevelState.Declaration
},
{value: `$a`,
tokenType: TokenLevelState.Variable
},
{value: `:=`,
tokenType: TokenLevelState.Operator,
children:[
{value: `2`,
tokenType: TokenLevelState.Number
},
{value: `return`,
tokenType: TokenLevelState.Operator,
children:[
{value: `$a`,
tokenType: TokenLevelState.Variable
},]
},]
},]
  expect (r).toEqual(ts);
});
       
test(`declaration`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`let $a := 2, $b := 3 return ($a, $b)`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `let`,
tokenType: TokenLevelState.Declaration
},
{value: `$a`,
tokenType: TokenLevelState.Variable
},
{value: `:=`,
tokenType: TokenLevelState.Operator,
children:[
{value: `2`,
tokenType: TokenLevelState.Number
},
{value: `,`,
tokenType: TokenLevelState.Operator
},
{value: `$b`,
tokenType: TokenLevelState.Variable
},
{value: `:=`,
tokenType: TokenLevelState.Operator,
children:[
{value: `3`,
tokenType: TokenLevelState.Number
},
{value: `return`,
tokenType: TokenLevelState.Function,
children:[
{value: `(`,
tokenType: TokenLevelState.Operator,
children:[
{value: `$a`,
tokenType: TokenLevelState.Variable
},
{value: `,`,
tokenType: TokenLevelState.Operator
},
{value: `$b`,
tokenType: TokenLevelState.Variable
},]
},
{value: `)`,
tokenType: TokenLevelState.Operator
},]
},]
},]
},]
  expect (r).toEqual(ts);
});
              
test(`declaration`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`for $a in 1 to 5, $b in 1 to 5 return concat($a, '.', $b)`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `for`,
tokenType: TokenLevelState.Declaration
},
{value: `$a`,
tokenType: TokenLevelState.Variable
},
{value: `in`,
tokenType: TokenLevelState.Operator,
children:[
{value: `1`,
tokenType: TokenLevelState.Number
},
{value: `to`,
tokenType: TokenLevelState.Operator
},
{value: `5`,
tokenType: TokenLevelState.Number
},
{value: `,`,
tokenType: TokenLevelState.Operator
},
{value: `$b`,
tokenType: TokenLevelState.Variable
},
{value: `in`,
tokenType: TokenLevelState.Operator,
children:[
{value: `1`,
tokenType: TokenLevelState.Number
},
{value: `to`,
tokenType: TokenLevelState.Operator
},
{value: `5`,
tokenType: TokenLevelState.Number
},
{value: `return`,
tokenType: TokenLevelState.Operator,
children:[
{value: `concat`,
tokenType: TokenLevelState.Function
},
{value: `(`,
tokenType: TokenLevelState.Operator,
children:[
{value: `$a`,
tokenType: TokenLevelState.Variable
},
{value: `,`,
tokenType: TokenLevelState.Operator
},
{value: `'.'`,
tokenType: TokenLevelState.String
},
{value: `,`,
tokenType: TokenLevelState.Operator
},
{value: `$b`,
tokenType: TokenLevelState.Variable
},]
},
{value: `)`,
tokenType: TokenLevelState.Operator
},]
},]
},]
},]
  expect (r).toEqual(ts);
});

       
test(`declaration`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`let $a := 1, $b := 2 return $a + 2, union`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `let`,
tokenType: TokenLevelState.Declaration
},
{value: `$a`,
tokenType: TokenLevelState.Variable
},
{value: `:=`,
tokenType: TokenLevelState.Operator,
children:[
{value: `1`,
tokenType: TokenLevelState.Number
},
{value: `,`,
tokenType: TokenLevelState.Operator
},
{value: `$b`,
tokenType: TokenLevelState.Variable
},
{value: `:=`,
tokenType: TokenLevelState.Operator,
children:[
{value: `2`,
tokenType: TokenLevelState.Number
},
{value: `return`,
tokenType: TokenLevelState.Operator,
children:[
{value: `$a`,
tokenType: TokenLevelState.Variable
},
{value: `+`,
tokenType: TokenLevelState.Operator
},
{value: `2`,
tokenType: TokenLevelState.Number
},
{value: `,`,
tokenType: TokenLevelState.Operator
},]
},]
},]
},
{value: `union`,
tokenType: TokenLevelState.Name
},]
  expect (r).toEqual(ts);
});
        
test(`declaration`, () => {
  let l: XPathLexer = new XPathLexer();
  let rx: Token[] = l.analyse(`every $a in * satisfies $a > 0, $b`);
  let r: Token[] = Utilities.minimiseTokens(rx);
  let ts: Token[] = [
{value: `every`,
tokenType: TokenLevelState.Declaration
},
{value: `$a`,
tokenType: TokenLevelState.Variable
},
{value: `in`,
tokenType: TokenLevelState.Operator,
children:[
{value: `*`,
tokenType: TokenLevelState.NodeType
},
{value: `satisfies`,
tokenType: TokenLevelState.Operator,
children:[
{value: `$a`,
tokenType: TokenLevelState.Variable
},
{value: `>`,
tokenType: TokenLevelState.Operator
},
{value: `0`,
tokenType: TokenLevelState.Number
},
{value: `,`,
tokenType: TokenLevelState.Operator
},]
},]
},
{value: `$b`,
tokenType: TokenLevelState.Variable
},]
  expect (r).toEqual(ts);
});


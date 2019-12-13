import { Lexer, StringCommentState, Token } from "./Lexer";

let xpath1 = "pp(:(:q:)z:)rr'ss''mm'tt";
let xpath2 = "pp'qq''rr'ss";
let xpath3 = 'pp"tt""tt again ';
let xpath4 = 'my \'single\' and "double" and (: comment :) and';
let xpath5 = 'pre \'single\' and';
let xpath6 = '$test[@predicate + doc(root + other = \'abc\')/remainder]/element';
let xpath7 = "test['abc']";
let xpath8 = '$abc+$def';
let xpath9 = 'let $a := Q{http:qutoric.com}slender';

let lexer: Lexer = new Lexer();

let testXpath = xpath6;

let tokens: Token[] = lexer.analyse(testXpath);
console.log('*************');
console.log(testXpath);
console.log('*************');

tokens.forEach(showTokens);

function showTokens(token: Token) {
    let err = (token.error)? ' error' : '';
    console.log('#' + token.value + '# ' + Lexer.stringCommentStateToString(token.type) + err);
    if (token.children) {
        console.log('--- children-start---');
        token.children.forEach(showTokens);
        console.log('--- children-end ----');
    }
}

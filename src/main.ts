import { Lexer, Token } from "./Lexer";
import { Debug } from "./Debug";

let xpath1 = "pp(:(:q:)z:)rr'ss''mm'tt";
let xpath2 = "pp'qq''rr'ss";
let xpath3 = 'pp"tt""tt again ';
let xpath4 = 'my \'single\' and "double" and (: comment :) and';
let xpath5 = 'pre \'single\' and';
let xpath6 = '$test[@predicate + doc(root + other = \'abc\')/remainder]/element';
let xpath7 = "test['abc']";
let xpath8 = '$abc+$def';
let xpath9 = 'let $a := Q{http:qutoric.com}slender';
let xpath10 = '+72.8 + $my:first-name + 7e-2 + 7-2 + 982.5';
let xpath11 = '5>=8';
let xpath12 = `let $exclude := test/elements/"trick.com":element/let!$over return
if (empty($exclude) and 'tre'||$t eq 'treat' and "trick.com":another)
   then ()
else if ($exclude/@end)
   then
   $exclude/@end cast as xs:integer + 1
else ()`;
let xpath13 = `let $increment := function($x as xs:integer) as xs:integer* {
	if ($x lt 10 and 'a' eq $y) then
	$x + 1, $fnb[22](24), $fna(28)
	else
	$x + 2, Q{http://example.com}div
} return books/book/@title + $test`;
// tests
let xpath14 = `$a and 'a' and 23 and true() and function() and array[1] and $var and 5 + and and`;
let xpath15 = `$a castable as xs:integer and $b instance of element()`;


let testXpath = xpath15;

let lexer: Lexer = new Lexer();


let tokens: Token[] = lexer.analyse(testXpath);

console.log('*************');
console.log(testXpath);
console.log('*************');
Debug.printResultTokens(tokens);



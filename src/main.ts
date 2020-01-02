import { XPathLexer, Token } from "./xpLexer";
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
let xpath15 = `$a castable as xs:integer and union instance of element()`;
let xpath16 = `map {25: 'first'}, for $a in 1 to 100 return concat($a, 'this''quoted'' thing')`
let xpath17 = `for $a in 1 to 5, $b in 1 to 5 return concat($a, '.', $b)`;
let largeXPath: string;
for (let i = 0; i < 5000; i++) {
	largeXPath += (' ' + xpath16);
}

// -------------
let testXpath: string = xpath17;
let testTitle = `declaration`;
let generateTest = true;
let timerOnly = false;
// =============

generateTest = timerOnly? false: generateTest;
let debugOn;
if (timerOnly) {
	debugOn = false;
} else {
	debugOn = !generateTest;
}

let lexer: XPathLexer = new XPathLexer();
lexer.setDebug(debugOn);
let tokens: Token[] = lexer.analyse(testXpath);


if (generateTest) {
	Debug.printMinSerializedTokens(testTitle, testXpath, tokens);
} else if (timerOnly) {
	console.log("XPath length: " + testXpath.length);
	console.log("Token Count:" + tokens.length);
} else {
	console.log('---------------');
	console.log(testXpath);
	console.log('---------------');
	Debug.printResultTokens(tokens);
}




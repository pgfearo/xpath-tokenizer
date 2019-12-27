import { Debug } from "./Debug";

export enum CharLevelState {
    init,// 0 initial state
    lB,  // 1 left bracket
    rB,  // 2 right bracket
    lC,  // 3 left comment
    rC,  // 4 right comment
    lSq, // 5 left single quote
    rSq, // 6 right single quote
    lDq, // 7 left double quote
    rDq, // 8 right double quote
    lBr, // 8 left brace
    rBr, // 10 right brace
    lPr, // 11 left predicate
    rPr, // 12 right predicate
    lWs,  // 13 whitspace char start
    escSq,  // 14 escaped single quote
    escDq,   // 15 escaped double quote
    sep,    // 16 separator
    lUri,    // 17 left braced URI literal
    rUri,   // 18 right braced URI literal
    lNl,    // 20 left numeric literal
    rNl ,    // 21 right numeric literal
    dSep,    // 22 first char of double char separator
    lVar,    // 23 variable start: $var
    exp,     // 24 exponent in numeric literal - allow + or - or digit after it
    lName,   // 25 node-name, function-name or operator like 'is' etc
    lAttr,   // 26 attribute-name
    dSep2,   // 27 2nd char of double char separator
}

export enum TokenLevelState {
    Attribute,
    Number,
    Unset,
    Operator,
    Variable,
    Whitespace,
    String,
    UriLiteral,
    NodeType,
    SimpleType,
    Axis,
    Name,
    Declaration,
    Function,
}

export class Data {
    public static separators = ['!','*', '+', ',', '-', '.', '/', ':', '<', '=', '>', '?','|'];

    public static doubleSeps = ['!=', '*:', '..', '//', ':*', '::', ':=', '<<', '<=', '=>', '>=', '>>', '||'];

    public static axes = [ "ancestor", "ancestor-or-self", "attribute", "child", "descendant", "descendant-or-self", 
                            "following", "following-sibling", "namespace", "parent", "preceding", "preceding-sibling", "self"];

    public static nodeTypes = [ "attribute", 
                                "comment", "document-node", "element", "empty-sequence", "item", "namespace-node", "node", 
                                "processing-instruction", 
                                "schema-attribute", "schema-element", "text"];                        

    public static keywords = [ "and", "array", "as", "div", 
                                "else", "eq", "except",
                                "function", "ge", "gt", "idiv", "if", "in", "intersect", "is", "le",
                                "lt", "map", "mod", "ne", "of", "or", "return", "satisfies",
                                "then", "to", "treat", "union"];

    public static rangeVars = ["every", "for", "let", "some"]
    public static firstParts = [ "cast", "castable", "instance"];
    public static secondParts = ["as", "of"];

    public static setAsOperatorIfKeyword(token: Token) {
        if (Data.keywords.indexOf(token.value) > -1) {
            token.tokenType = TokenLevelState.Operator;
        }
    }
}

export class XPathLexer {

    public debug: boolean = false;
    public debugState: boolean = false;
    private latestRealToken: Token;

    private static isPartOperator(firstPart: string, secondPart: string): boolean {
        let result = false;
        switch (firstPart) {
            case "cast":
            case "castable":
                result = secondPart === "as";
                break;
            case "instance":
                result = secondPart === "of";
                break;
        }
        return result;
    }

    public setDebug(debug: boolean) {
        this.debug = debug;
    }

    private static calcNewState (isFirstChar: boolean, nesting: number, char: string, nextChar: string, existing: CharLevelState): [CharLevelState, number] {
        let rv: CharLevelState;
        let firstCharOfToken = true;

        switch (existing) {
            case CharLevelState.lNl:
                let charCode = char.charCodeAt(0);
                let nextCharCode = (nextChar)? nextChar.charCodeAt(0): -1;
                if (XPathLexer.isDigit(charCode) || char === '.') {
                    rv = existing;
                } else if (char === 'e' || char === 'E') {
                    if (nextChar === '-' || nextChar === '+' || XPathLexer.isDigit(nextCharCode)) {
                        rv = CharLevelState.exp;
                    } else {
                        rv = existing;
                    }
                } else {
                    ({ rv, nesting } = XPathLexer.testChar(existing, firstCharOfToken, char, nextChar, nesting));
                }
                break;
            case CharLevelState.exp:
                rv = CharLevelState.lNl;
                break;
            case CharLevelState.lWs:
                if (char === ' ' || char === '\t' || char === '\n' || char === '\f') {
                    rv = existing;
                } else {
                    // we must switch to the new state, depending on the char/nextChar
                    ({ rv, nesting } = XPathLexer.testChar(existing, firstCharOfToken, char, nextChar, nesting));
                }
                break;
            case CharLevelState.lName:
            case CharLevelState.lVar:
            case CharLevelState.lAttr:
                if (char === '-' || char === '.' || (char === ':' && nextChar !== ':')) {
                    rv = existing;
                } else {
                    // we must switch to the new state, depending on the char/nextChar
                    ({ rv, nesting } = XPathLexer.testChar(existing, isFirstChar, char, nextChar, nesting));
                }
                break;
            case CharLevelState.dSep:
                rv = CharLevelState.dSep2;
                break;
            case CharLevelState.lUri:
                rv = (char === '}')? CharLevelState.rUri : existing;
                break;
            case CharLevelState.lSq:
                if (char === '\'' ) {
                    if (nextChar === '\'') {
                        rv = CharLevelState.escSq;
                    } else {
                        rv = CharLevelState.rSq;
                    }
                } else {
                    rv = existing;
                }
                break;
            case CharLevelState.escSq:
                rv = CharLevelState.lSq;
                break;
            case CharLevelState.escDq:
                rv = CharLevelState.lDq;
                break;
            case CharLevelState.lDq:
                if (char === '\"') {
                    if (nextChar === '\"') {
                        rv = CharLevelState.escDq;
                    } else {
                        rv = CharLevelState.rDq;
                    }
                } else {
                    rv = existing;
                }
                break;  
            case CharLevelState.lC:
                if (char === ':' && nextChar === ')') {
                    rv = (nesting === 1)? CharLevelState.rC : existing; 
                    nesting--;
                } else if (char === '(' && nextChar === ':') {
                    rv = existing;
                    nesting++;
                } else {
                    rv = existing;
                }
                break; 
            default:
                ({ rv, nesting } = XPathLexer.testChar(existing, isFirstChar, char, nextChar, nesting));
        }
        return [rv, nesting];
    }

    public analyse(xpath: string): Token[] {
        this.latestRealToken = null;
        let prevRealToken: Token = null;
        let currentState: [CharLevelState, number] = [CharLevelState.init, 0];
        let currentChar: string = null;
        let tokenChars: string[] = [];
        let result: Token[] = [];
        let nestedTokenStack: Token[] = [];
        if (this.debug) {
            console.log("xpath: " + xpath);
            Debug.debugHeading();
        }
    
        for (let i = 0; i < xpath.length + 1; i++) {
            // deconstruct state:
            let [currentLabelState, nestingState] = currentState;
            let nextChar: string = xpath.charAt(i);
            let nextState: [CharLevelState, number];
            let isFirstTokenChar = tokenChars.length === 0;
    
            if (currentChar) {
                nextState = XPathLexer.calcNewState(
                    isFirstTokenChar,
                    nestingState,
                    currentChar,
                    nextChar, 
                    currentLabelState
                );
                let [nextLabelState] = nextState;
                let token: string;
                if (
                    (nextLabelState === currentLabelState
                        && !(this.unChangedStateSignificant(currentLabelState))
                    )
                    || (currentLabelState === CharLevelState.exp && nextLabelState == CharLevelState.lNl)) {
                    // do nothing if state has not changed
                    // or we're within a number with an exponent
                    tokenChars.push(currentChar);
                } else {
                    // state has changed, so save token and start new token
                    switch (nextLabelState){
                        case CharLevelState.lNl:
                        case CharLevelState.lVar:
                        case CharLevelState.lName:
                            this.update(nestedTokenStack, result, tokenChars, currentLabelState);
                            tokenChars.push(currentChar);
                            break;
                        case CharLevelState.exp:
                            tokenChars.push(currentChar);
                            break;
                        case CharLevelState.dSep:
                            this.update(nestedTokenStack, result, tokenChars, currentLabelState);
                            let bothChars = currentChar + nextChar;
                            this.updateResult(nestedTokenStack, result, new BasicToken(bothChars, nextLabelState));
                            break;
                        case CharLevelState.dSep2:
                            break;
                        case CharLevelState.sep:
                            this.update(nestedTokenStack, result, tokenChars, currentLabelState);
                            this.updateResult(nestedTokenStack, result, new BasicToken(currentChar, nextLabelState));
                            break;
                        case CharLevelState.escSq:
                        case CharLevelState.escDq:
                            tokenChars.push(currentChar); 
                            break;
                        case CharLevelState.rC:
                            tokenChars.push(':)');
                            token = tokenChars.join('');
                            tokenChars = [];
                            break;
                        case CharLevelState.lB:
                        case CharLevelState.lBr:
                        case CharLevelState.lPr:
                            this.update(nestedTokenStack, result, tokenChars, currentLabelState);
                            let currentToken: ContainerToken = new ContainerToken(currentChar, nextLabelState);
                            this.updateResult(nestedTokenStack, result, currentToken);
                            // add to nesting level
                            nestedTokenStack.push(currentToken);
                            this.latestRealToken = null;                   
                            break;
                        case CharLevelState.rB:
                        case CharLevelState.rBr:
                        case CharLevelState.rPr:
                            if (currentLabelState !== CharLevelState.rC) {
                                let prevToken: Token = new BasicToken(tokenChars.join(''), currentLabelState);
                                this.updateResult(nestedTokenStack, result, prevToken);
                                let newToken: Token = new BasicToken(currentChar, nextLabelState);
                                if (nestedTokenStack.length > 0) {
                                    // remove from nesting level
                                    if (XPathLexer.closeMatchesOpen(nextLabelState, nestedTokenStack)) {
                                        nestedTokenStack.pop();
                                    } else {
                                        newToken.error = true;
                                    }
                                } else {
                                    newToken.error = true;
                                }
                                this.updateResult(nestedTokenStack, result, newToken);
                                tokenChars = [];
                            }
                            break;
                            
                        case CharLevelState.rSq:
                        case CharLevelState.rDq:
                        case CharLevelState.rUri:
                            tokenChars.push(currentChar);
                            token = tokenChars.join('');
                            tokenChars = [];                       
                            break;
                        case CharLevelState.lSq:
                        case CharLevelState.lDq:
                        case CharLevelState.lC:
                        case CharLevelState.lWs:
                        case CharLevelState.lUri:
                            if (currentLabelState !== CharLevelState.escSq && currentLabelState !== CharLevelState.escDq) {
                                token = tokenChars.join('');
                                tokenChars = [];
                            }
                            tokenChars.push(currentChar);
                            break;              
                        default:
                            if (currentLabelState === CharLevelState.rC) {
                                // in this case, don't include ')' as it is part of last token
                                tokenChars = [];
                            } else if (currentLabelState === CharLevelState.lWs) {
                                // set whitespace token and then initial with currentChar
                                token = tokenChars.join('');
                                tokenChars = []; 
                                tokenChars.push(currentChar);
                            }
                            else {
                                tokenChars.push(currentChar);
                            }
                            break;
                    }
                    if (this.debugState) {
                        Debug.printStateOuput(prevRealToken, currentLabelState, nextLabelState, token);
                    }
                    if (token) {
                        if (this.debugState) {
                            console.log('[' + token + ']' + ' type: ' + Debug.charStateToString(currentLabelState));
                        }
                        this.updateResult(nestedTokenStack, result, new BasicToken(token, currentLabelState));
                    }
                }
                if (!nextChar && tokenChars.length > 0) {
                    token = tokenChars.join('');
                    this.updateResult(nestedTokenStack, result, new BasicToken(token, nextLabelState));
                }
                currentState = nextState;
                prevRealToken = this.latestRealToken;
            } // end if(currentChar)
            currentChar = nextChar;
        } // end iteration over chars
        return result;
    }

    private static closeMatchesOpen(close: CharLevelState, stack: Token[]): boolean {
        let open: CharLevelState = stack[stack.length - 1].charType;
        let result: boolean = false;
        switch (close) {
            case CharLevelState.rB:
                result = open === CharLevelState.lB;
                break;
            case CharLevelState.rBr:
                result = open === CharLevelState.lBr;
                break;
            case CharLevelState.rPr:
                result = open === CharLevelState.lPr;
        }
        return result;
    }

    private update(stack: Token[], result: Token[], tokenChars: string[], charState: CharLevelState) {
        this.updateResult(stack, result, new BasicToken(tokenChars.join(''), charState ))
        tokenChars.length = 0;
    }

    private unChangedStateSignificant(charState: CharLevelState): boolean {
        let 
        result: boolean = false;
        switch (charState) {
            case CharLevelState.lB:
            case CharLevelState.lBr:
            case CharLevelState.lPr:
            case CharLevelState.rB:
            case CharLevelState.rBr:
            case CharLevelState.rPr:
            case CharLevelState.sep:
                result = true;
        }
        return result;
    }

    private updateResult(stack: Token[], result: Token[], newValue: Token) {
        let cachedRealToken = this.latestRealToken;
        if (newValue.value !== '') {
            let addStackTokens = stack.length > 0;
            let targetArray: Token[] = (addStackTokens)? stack[stack.length - 1].children: result;
            targetArray.push(newValue);

            let prevToken = this.latestRealToken;
            this.setLabelForLastTokenOnly(prevToken, newValue);
            this.setLabelsUsingCurrentToken(prevToken, newValue);

            let state = newValue.charType;
            if (!(state === CharLevelState.lC || state === CharLevelState.lWs)) {
                this.latestRealToken = newValue;
            } 
        }
        if (this.debug) {
            Debug.printDebugOutput(this.latestRealToken, cachedRealToken, newValue);
        }
    }

    private setLabelForLastTokenOnly(prevToken: Token, currentToken: Token) {
        let currentState = currentToken.charType

        if (prevToken) {
            if (XPathLexer.isCharTypeEqual(prevToken, CharLevelState.lName)) {
                switch (currentState) {
                    case CharLevelState.lVar:
                        if (Data.rangeVars.indexOf(prevToken.value) > -1) {
                                // every, for, let, some
                                prevToken.tokenType = TokenLevelState.Declaration;
                        }
                        break;
                    case CharLevelState.lB:
                        if (prevToken.value === 'if') {
                            prevToken.tokenType = TokenLevelState.Operator;
                        } else if (Data.nodeTypes.indexOf(prevToken.value) > -1) {
                            prevToken.tokenType = TokenLevelState.NodeType;
                        } else {
                            prevToken.tokenType = TokenLevelState.Function;
                        }
                        break;
                    case CharLevelState.dSep:
                        if (currentToken.value === '::' && Data.axes.indexOf(prevToken.value) > -1) {
                            prevToken.tokenType = TokenLevelState.Axis;
                        } else if (currentToken.value === '()') {
                            if (Data.nodeTypes.indexOf(prevToken.value) > -1) {
                                prevToken.tokenType = TokenLevelState.NodeType;
                            } else {
                                prevToken.tokenType = TokenLevelState.Function;
                            }
                        }
                        break;
                    case CharLevelState.lPr:
                        if (prevToken.value ===  'array') {
                            prevToken.tokenType = TokenLevelState.Operator;
                        }
                        break;
                    case CharLevelState.lBr:
                        if (prevToken.value === 'map' || prevToken.value === 'array') {
                            prevToken.tokenType = TokenLevelState.Operator;
                        }
                        break;
                }
            }
        }
    }

    private setLabelsUsingCurrentToken(prevToken: Token, currentToken: Token) {
        if (!(prevToken)) {
            prevToken = new BasicToken(',', CharLevelState.sep);
            prevToken.tokenType = TokenLevelState.Operator;
        }
        let currentValue = currentToken.value;

        switch (currentToken.charType) {
            case CharLevelState.lName:
                // token is a 'name' that needs resolving:
                // a Name cannot follow a Name -- unless it's like 'instance of'
                switch (prevToken.charType) {
                    case CharLevelState.lName:
                        // previous token was lName and current token is lName
                        if (Data.secondParts.indexOf(currentValue) > -1 && XPathLexer.isPartOperator(prevToken.value, currentValue)) {
                            // castable as etc.
                            prevToken.tokenType = TokenLevelState.Operator;
                            currentToken.tokenType = TokenLevelState.Operator;                               
                        } else if (XPathLexer.isTokenTypeEqual(prevToken, TokenLevelState.Operator)) {
                            // don't set to name because it may be a function etc.
                            //currentToken.tokenType = TokenLevelState.Name;
                            if (prevToken.value === 'as' || prevToken.value === 'of') {
                                // e.g. castable as xs:integer
                                // TODO: check if value equals xs:integer or element?
                                currentToken.tokenType = TokenLevelState.SimpleType;
                            }
                        } else if (XPathLexer.isTokenTypeEqual(prevToken, TokenLevelState.Name) || XPathLexer.isTokenTypeAType(prevToken)) {
                            Data.setAsOperatorIfKeyword(currentToken);
                        } 
                        break;
                    case CharLevelState.rB:
                    case CharLevelState.rBr:
                    case CharLevelState.rPr:
                    case CharLevelState.lAttr:
                    case CharLevelState.lNl:
                    case CharLevelState.lVar:
                    case CharLevelState.lSq:
                    case CharLevelState.lDq:
                        Data.setAsOperatorIfKeyword(currentToken);
                        break;
                    case CharLevelState.sep:
                        if (prevToken.value === '.') {
                            Data.setAsOperatorIfKeyword(currentToken);
                        }
                        break;
                    case CharLevelState.dSep:
                        if (prevToken.value === '()' || prevToken.value === '..') {
                            Data.setAsOperatorIfKeyword(currentToken);
                        }
                        break;
                    default: // current token is an lName but previous token was not

                        if (XPathLexer.isTokenTypeUnset(prevToken)
                             && Data.keywords.indexOf(currentValue) > -1) {
                            currentToken.tokenType = TokenLevelState.Operator;
                        } else if (XPathLexer.isCharTypeEqual(prevToken, CharLevelState.dSep) 
                                    && prevToken.value === '()' 
                                    && Data.keywords.indexOf(currentValue) > -1) {
                            currentToken.tokenType = TokenLevelState.Operator;
                        } else if (XPathLexer.isTokenTypeEqual(prevToken, TokenLevelState.Operator) && 
                            (prevToken.value === 'as' || prevToken.value === 'of')) {
                            currentToken.tokenType = TokenLevelState.SimpleType;
                        }
                        break;
                }
                break;
        }
    }

    private static testChar(existingState: CharLevelState, isFirstChar: boolean, char: string, nextChar: string, nesting: number) {
        let rv: CharLevelState;

        switch (char) {
            case 'Q':
                rv = (nextChar === '{')? CharLevelState.lUri : CharLevelState.lName;
                break;
            case '(':
                if (nextChar === ':') {
                    rv = CharLevelState.lC;
                    nesting++;
                } else if (nextChar == ')') {
                    rv = CharLevelState.dSep;
                }
                else {
                    rv = CharLevelState.lB;
                }
                break;
            case '{':
                if (nextChar === '}') {
                    rv = CharLevelState.dSep;
                } else {
                    rv = CharLevelState.lBr;
                }
                break;
            case '[':
                if (nextChar === ']') {
                    rv = CharLevelState.dSep;
                } else {
                    rv = CharLevelState.lPr;
                }
                break;
            case ')':
                rv = CharLevelState.rB;
                break;
            case ']':
                rv = CharLevelState.rPr;
                break;
            case '}':
                rv = CharLevelState.rBr
                break;
            case '\'':
                rv = CharLevelState.lSq;
                break;
            case '\"':
                rv = CharLevelState.lDq;
                break;
            case ' ':
            case '\t':
            case '\n':
            case '\f':
                rv = CharLevelState.lWs;
                break;
            case '+':
            case '-':
                rv = CharLevelState.sep;
                break;
            default:
                let doubleChar = char + nextChar;
                if ((nextChar) && Data.doubleSeps.indexOf(doubleChar) > -1) {
                    rv = CharLevelState.dSep;
                    break;
                } else if (Data.separators.indexOf(char) > -1) {
                    rv = CharLevelState.sep;
                } else if (isFirstChar) {
                    let charCode = char.charCodeAt(0);
                    let nextCharCode = (nextChar)? nextChar.charCodeAt(0): -1;
                    // check 'dot' char:
                    if (charCode === 46) {
                        if (nextCharCode === 46) {
                            // '..' parent axis
                            rv = CharLevelState.dSep;
                        } else {
                            rv = this.isDigit(nextCharCode)? CharLevelState.lNl : CharLevelState.sep;
                        }
                    } else if (this.isDigit(charCode)) {
                        rv = CharLevelState.lNl;
                    } else if (char === '$') {
                        rv = CharLevelState.lVar;
                    } else if (char === '@') {
                        rv = CharLevelState.lAttr;
                    } else {
                        rv = CharLevelState.lName;
                    }
                } else {
                    rv = existingState;
                }
        }
        return { rv, nesting };
    }

    private static isDigit(charCode: number) {
        return charCode > 47 && charCode < 58;
    }

    private static isCharTypeEqual(token: Token, type2: CharLevelState): boolean {
        return token.charType.valueOf() === type2.valueOf();
    }

    private static isTokenTypeEqual(token: Token, type2: TokenLevelState): boolean {
        return token.tokenType.valueOf() === type2.valueOf();
    }

    private static isTokenTypeAType(token: Token): boolean {
        return token.tokenType.valueOf() === TokenLevelState.SimpleType.valueOf() ||
                token.tokenType.valueOf() === TokenLevelState.NodeType.valueOf();
    }

    private static isTokenTypeUnset(token: Token): boolean {
        return token.tokenType.valueOf() === TokenLevelState.Unset.valueOf();
    }
}

export interface Token {
    value: string,
    charType?: CharLevelState;
    tokenType: TokenLevelState;
    children?: Token[];
    error?: boolean;
}

export class Utilities {

    public static minimiseTokens(tokens: Token[]): Token[] {
        let r: Token[] = new Array();
        for (let token of tokens) {
            if (token.charType.valueOf() !== CharLevelState.lWs) {
                delete token.charType;
                r.push(token);
            }
        }
        return r;
    }
}

class BasicToken implements Token {
    value: string;
    charType: CharLevelState;
    tokenType: TokenLevelState;

    constructor(value: string, type: CharLevelState) {
        this.value = value;
        this.charType = type;
        switch (type) {
            case CharLevelState.lWs:
                this.tokenType = TokenLevelState.Whitespace;
                break;
            case CharLevelState.lName:
                this.tokenType = TokenLevelState.Name;
                break;
            case CharLevelState.dSep:
            case CharLevelState.sep:
            case CharLevelState.lB:
            case CharLevelState.lBr:
            case CharLevelState.lPr:
            case CharLevelState.rB:
            case CharLevelState.rBr:
            case CharLevelState.rPr:
                this.tokenType = TokenLevelState.Operator;
                break;
            case CharLevelState.lAttr:
                this.tokenType = TokenLevelState.Attribute;
                break;
            case CharLevelState.lNl:
                this.tokenType = TokenLevelState.Number;
                break;
            case CharLevelState.lVar:
                this.tokenType = TokenLevelState.Variable;
                break;
            case CharLevelState.lSq:
            case CharLevelState.lDq:
                this.tokenType = TokenLevelState.String;
                break;
            case CharLevelState.lUri:
                this.tokenType = TokenLevelState.UriLiteral;
                break;
            default:
                this.tokenType = TokenLevelState.Unset;
                break;
        }
    }
}

class ContainerToken implements Token {
    value: string;
    charType: CharLevelState;
    children: Token[];
    tokenType: TokenLevelState;

    constructor(value: string, type: CharLevelState) {
        this.children = [];
        this.value = value;
        this.charType = type;
        this.tokenType = TokenLevelState.Operator;
    }
}

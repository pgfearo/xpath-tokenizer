export enum StringCommentState {
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

export enum ResolvedState {
    Operator,
    NodeType,
    Axis,
    Name,
    Declaration,
    Function,
}

export class Lexer {

    public debug: boolean = true;
    public debugState: boolean = false;
    private latestRealToken: Token;

    private static separators = ['!','*', '+', ',', '-', '.', '/', ':', '<', '=', '>', '?'];

    private static doubleSeps = ['!=', '*:', '..', '//', ':*', '::', ':=', '<<', '<=', '=>', '>=', '>>'];

    private static axes = [ "ancestor", "ancestor-or-self", "child", "descendant", "descendant-or-self", 
                            "following", "following-sibling", "namespace", "parent", "preceding", "preceding-sibling", "self"];

    private static nodeTypes = [ "attribute", 
                                "comment", "document-node", "attribute", "element", "empty-sequence", "item", "namespace-node", "node", 
                                "processing-instruction", 
                                "schema-attribute", "schema-element", "text"];                        

    private static keywords = [ "and", "array", "div", 
                                "else", "eq", "except",
                                "function", "ge", "gt", "idiv", "if", "in", "intersect", "is", "le",
                                "lt", "map", "mod", "ne", "or", "return", "satisfies",
                                "then", "to", "treat", "union"];

    private static rangeVars = ["every", "for", "let", "some"]
    private static firstParts = [ "cast", "castable", "instance"];
    private static secondParts = ["as", "of"];

    public static stringResolvedStateToString (resolvedState: ResolvedState) : string {
        let r: string = undefined;

        switch (resolvedState) {
            case ResolvedState.Axis:
                r = "Axis";
                break;
            case ResolvedState.Declaration:
                r = "Declaration";
                break;
            case ResolvedState.Function:
                r = "Function";
                break;
            case ResolvedState.Name:
                r = "Name";
                break;
            case ResolvedState.NodeType:
                r = "NodeType";
                break;
            case ResolvedState.Operator:
                r = "Operator";
                break;
        }
        return r;
    }

    public static stringCommentStateToString (stringCommentState: StringCommentState) : string {
        let result: string = undefined;

        switch (stringCommentState) {
            case StringCommentState.init:
                result = "init";
                break;
            case StringCommentState.lB:
                result = "lB";
                break;
            case StringCommentState.rB:
                result = "rB";
                break;
            case StringCommentState.lC:
                result = "Comment";
                break;
            case StringCommentState.rC:
                result = "rC";
                break;
            case StringCommentState.lSq:
                result = "StringLiteral";
                break;
            case StringCommentState.rSq:
                result = "rSq";
                break;
            case StringCommentState.lDq:
                result = "lDq";
                break;
            case StringCommentState.rDq:
                result = "rDq";
                break;
            case StringCommentState.lBr:
                result = "lBr";
                break;
            case StringCommentState.rBr:
                result = "rBr";
                break;
            case StringCommentState.lWs:
                result = "Whitespace";
                break;
            case StringCommentState.lPr:
                result = "lPr";
                break;
            case StringCommentState.rPr:
                result = "rPr";
                break;
            case StringCommentState.escDq:
                result = "escDq";
                break;
            case StringCommentState.escSq:
                result = "escSq";
                break;
            case StringCommentState.sep:
                result = "sep";
                break;
            case StringCommentState.dSep:
                result = "dSep";
                break;
            case StringCommentState.dSep2:
                result = "dSep2";
                break;
            case StringCommentState.lUri:
                result = "URILiteral";
                break;
            case StringCommentState.rUri:
                result = "rUri";
                break;
            case StringCommentState.lNl:
                result = "NumericLiteral";
                break;
            case StringCommentState.rNl:
                result = "rNl";
                break;
            case StringCommentState.lVar:
                result = "Variable";
                break;
            case StringCommentState.exp:
                result = "Exponent";
                break;
            case StringCommentState.lName:
                result = "Name";
                break;
            case StringCommentState.lAttr:
                result = "Attribute";
                break;
         }
        return result;
    }

    private static calcNewState (isFirstChar: boolean, nesting: number, char: string, nextChar: string, existing: StringCommentState): [StringCommentState, number] {
        let rv: StringCommentState;
        let firstCharOfToken = true;

        switch (existing) {
            case StringCommentState.lNl:
                let charCode = char.charCodeAt(0);
                let nextCharCode = (nextChar)? nextChar.charCodeAt(0): -1;
                if (Lexer.isDigit(charCode) || char === '.') {
                    rv = existing;
                } else if (char === 'e' || char === 'E') {
                    if (nextChar === '-' || nextChar === '+' || Lexer.isDigit(nextCharCode)) {
                        rv = StringCommentState.exp;
                    } else {
                        rv = existing;
                    }
                } else {
                    ({ rv, nesting } = Lexer.testChar(existing, firstCharOfToken, char, nextChar, nesting));
                }
                break;
            case StringCommentState.exp:
                rv = StringCommentState.lNl;
                break;
            case StringCommentState.lWs:
                if (char === ' ' || char === '\t' || char === '\n' || char === '\f') {
                    rv = existing;
                } else {
                    // we must switch to the new state, depending on the char/nextChar
                    ({ rv, nesting } = Lexer.testChar(existing, firstCharOfToken, char, nextChar, nesting));
                }
                break;
            case StringCommentState.lName:
            case StringCommentState.lVar:
            case StringCommentState.lAttr:
                if (char === '-' || char === '.' || char === ':') {
                    rv = existing;
                } else {
                    // we must switch to the new state, depending on the char/nextChar
                    ({ rv, nesting } = Lexer.testChar(existing, isFirstChar, char, nextChar, nesting));
                }
                break;
            case StringCommentState.dSep:
                rv = StringCommentState.dSep2;
                break;
            case StringCommentState.lUri:
                rv = (char === '}')? StringCommentState.rUri : existing;
                break;
            case StringCommentState.lSq:
                if (char === '\'' ) {
                    if (nextChar === '\'') {
                        rv = StringCommentState.escSq;
                    } else {
                        rv = StringCommentState.rSq;
                    }
                } else {
                    rv = existing;
                }
                break;
            case StringCommentState.escSq:
                rv = StringCommentState.lSq;
                break;
            case StringCommentState.escDq:
                rv = StringCommentState.lDq;
                break;
            case StringCommentState.lDq:
                if (char === '\"') {
                    if (nextChar === '\"') {
                        rv = StringCommentState.escDq;
                    } else {
                        rv = StringCommentState.rDq;
                    }
                } else {
                    rv = existing;
                }
                break;  
            case StringCommentState.lC:
                if (char === ':' && nextChar === ')') {
                    rv = (nesting === 1)? StringCommentState.rC : existing; 
                    nesting--;
                } else if (char === '(' && nextChar === ':') {
                    rv = existing;
                    nesting++;
                } else {
                    rv = existing;
                }
                break; 
            default:
                ({ rv, nesting } = Lexer.testChar(existing, isFirstChar, char, nextChar, nesting));
        }
        return [rv, nesting];
    }

    public analyse(xpath: string): Token[] {
        this.latestRealToken = null;
        let prevRealToken: Token = null;
        let currentState: [StringCommentState, number] = [StringCommentState.init, 0];
        let currentChar: string = null;
        let tokenChars: string[] = [];
        let result: Token[] = [];
        let nestedTokenStack: Token[] = [];
        if (this.debug) {
            console.log("xpath: " + xpath);
            Lexer.debugHeading();
        }
    
        for (let i = 0; i < xpath.length + 1; i++) {
            // deconstruct state:
            let [currentLabelState, nestingState] = currentState;
            let nextChar: string = xpath.charAt(i);
            let nextState: [StringCommentState, number];
            let isFirstTokenChar = tokenChars.length === 0;
    
            if (currentChar) {
                nextState = Lexer.calcNewState(
                    isFirstTokenChar,
                    nestingState,
                    currentChar,
                    nextChar, 
                    currentLabelState
                );
                let [nextLabelState] = nextState;
                let token: string;
                if (nextLabelState === currentLabelState || 
                   (currentLabelState === StringCommentState.exp && nextLabelState == StringCommentState.lNl)) {
                    // do nothing if state has not changed
                    // or we're within a number with an exponent
                    tokenChars.push(currentChar);
                } else {
                    // state has changed, so save token and start new token
                    switch (nextLabelState){
                        case StringCommentState.lNl:
                        case StringCommentState.lVar:
                        case StringCommentState.lName:
                            this.updateResult(nestedTokenStack, result, {value: tokenChars.join(''), type: currentLabelState});
                            tokenChars = [];
                            tokenChars.push(currentChar);
                            break;
                        case StringCommentState.exp:
                            tokenChars.push(currentChar);
                            break;
                        case StringCommentState.dSep:
                            this.updateResult(nestedTokenStack, result, {value: tokenChars.join(''), type: currentLabelState});
                            let bothChars = currentChar + nextChar;
                            this.updateResult(nestedTokenStack, result, {value: bothChars , type: nextLabelState});
                            tokenChars = [];
                            break;
                        case StringCommentState.dSep2:
                            break;
                        case StringCommentState.sep:
                            this.updateResult(nestedTokenStack, result, {value: tokenChars.join(''), type: currentLabelState});
                            this.updateResult(nestedTokenStack, result, {value: currentChar, type: nextLabelState});
                            tokenChars = [];
                            break;
                        case StringCommentState.escSq:
                        case StringCommentState.escDq:
                            tokenChars.push(currentChar); 
                            break;
                        case StringCommentState.rC:
                            tokenChars.push(':)');
                            token = tokenChars.join('');
                            tokenChars = [];
                            break;
                        case StringCommentState.lB:
                        case StringCommentState.lBr:
                        case StringCommentState.lPr:
                            this.updateResult(nestedTokenStack, result, {value: tokenChars.join(''), type: currentLabelState});
                            tokenChars = [];
                            let currentToken: ContainerToken = new ContainerToken(currentChar, nextLabelState);
                            this.updateResult(nestedTokenStack, result, currentToken);
                            // add to nesting level
                            nestedTokenStack.push(currentToken);
                            this.latestRealToken = null;                   
                            break;
                        case StringCommentState.rB:
                        case StringCommentState.rBr:
                        case StringCommentState.rPr:
                            if (currentLabelState !== StringCommentState.rC) {
                                let prevToken: Token = {value: tokenChars.join(''), type: currentLabelState};
                                this.updateResult(nestedTokenStack, result, prevToken);
                                let newToken: Token = {value: currentChar, type: nextLabelState};
                                if (nestedTokenStack.length > 0) {
                                    // remove from nesting level
                                    if (Lexer.closeMatchesOpen(nextLabelState, nestedTokenStack)) {
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
                            
                        case StringCommentState.rSq:
                        case StringCommentState.rDq:
                        case StringCommentState.rUri:
                            tokenChars.push(currentChar);
                            token = tokenChars.join('');
                            tokenChars = [];                       
                            break;
                        case StringCommentState.lSq:
                        case StringCommentState.lDq:
                        case StringCommentState.lC:
                        case StringCommentState.lWs:
                        case StringCommentState.lUri:
                            if (currentLabelState !== StringCommentState.escSq && currentLabelState !== StringCommentState.escDq) {
                                token = tokenChars.join('');
                                tokenChars = [];
                            }
                            tokenChars.push(currentChar);
                            break;              
                        default:
                            if (currentLabelState === StringCommentState.rC) {
                                // in this case, don't include ')' as it is part of last token
                                tokenChars = [];
                            } else if (currentLabelState === StringCommentState.lWs) {
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
                        console.log('============STATE CHANGE ===========================');
                        let prevType: string;
                        let prevToken: string = '';
                        if (prevRealToken === null) {
                            prevType = 'NULL';
                        } else {
                            prevType = Lexer.stringCommentStateToString(prevRealToken.type);
                            prevToken = prevRealToken.value;
                        }
                        console.log('prevReal: ' + prevType + '[' + prevToken + ']');
                        console.log("from: " + Lexer.stringCommentStateToString(currentLabelState));
                        console.log("to:   " + Lexer.stringCommentStateToString(nextLabelState)) + "[" + token + "]";
                    }
                    if (token) {
                        if (this.debugState) {
                            console.log('[' + token + ']' + ' type: ' + Lexer.stringCommentStateToString(currentLabelState));
                        }
                        this.updateResult(nestedTokenStack, result, {value: token, type: currentLabelState});
                    }
                }
                if (!nextChar && tokenChars.length > 0) {
                    token = tokenChars.join('');
                    if (this.debug) {
                        console.log("end-token: [" + token + "]" + ' type: ' + Lexer.stringCommentStateToString(currentLabelState));
                    }
                    result.push({value: token, type: currentLabelState});
                }
                // console.log('=======================================');
                currentState = nextState;
                prevRealToken = this.latestRealToken;
            } // end if(currentChar)
            currentChar = nextChar;
        } // end iteration over chars
        return result;
    }

    private static closeMatchesOpen(close: StringCommentState, stack: Token[]): boolean {
        let open: StringCommentState = stack[stack.length - 1].type;
        let result: boolean = false;
        switch (close) {
            case StringCommentState.rB:
                result = open === StringCommentState.lB;
                break;
            case StringCommentState.rBr:
                result = open === StringCommentState.lBr;
                break;
            case StringCommentState.rPr:
                result = open === StringCommentState.lPr;
        }
        return result;
    }

    /*
    *   1. If stack has any tokens on it, add the new token as a child to the top item on the stack
    *   2. If stack is empty add the new token to the array of result tokens
    *   3. If the new token is 'real' then set the latestRealToken to the new token
    */
    private updateResult(stack: Token[], result: Token[], newValue: Token) {
        let cachedRealToken = this.latestRealToken;
        if (newValue.value !== '') {
            let addStackTokens = stack.length > 0;
            let targetArray: Token[] = (addStackTokens)? stack[stack.length - 1].children: result;
            targetArray.push(newValue);

            let state = newValue.type;
            if (!(state === StringCommentState.lC || state === StringCommentState.lWs)) {
                this.latestRealToken = newValue;
            } 
        }
        if (this.debug && newValue.value !== '') {
            let showWhitespace = false;
            let nextRealToken: string = this.getTokenDebugString(this.latestRealToken);
            let cachedRealTokenString: string = this.getTokenDebugString(cachedRealToken);
            let newT: string =  this.getTokenDebugString(newValue);

            let cachedTpadding: string = Lexer.padColumns(cachedRealTokenString.length);
            let newTpadding: string = Lexer.padColumns(newT.length);
            if (newValue.type === StringCommentState.lWs && !(showWhitespace)) {
                // show nothing
            } else {
                console.log(cachedRealTokenString + cachedTpadding +  newT);
            }

            
        }
    }

    private setLabelForLastToken(currentState: StringCommentState) {
        let lastState: StringCommentState = this.latestRealToken.type;
        
    }

    private getTokenDebugString(lrt: Token) {
        let prevType: string;
        let prevToken: string = '';
        if (lrt === null) {
            prevType = 'NULL';
        }
        else {
            prevType = Lexer.stringCommentStateToString(lrt.type);
            prevToken = lrt.value;
        }
        let prevTypeLength = (prevType)? prevType.length : 0;
        let oldT: string = prevType + Lexer.padParts(prevTypeLength) +  prevToken + '_';
        return oldT;
    }

    private static padColumns(padLength: number): string {
        let padding = '';
        for (let i = 0;  i < 50 - padLength; i++) {
            padding += ' ';
        }
        return padding;
    }

    private static padParts(padLength: number): string {
        let padding = '';
        for (let i = 0;  i < 16 - padLength; i++) {
            padding += ' ';
        }
        return padding;
    }

    private static debugHeading() {
        let cachedT: string = 'Cached Real Token';
        let newT: string =  'New Token';
        let oldT: string = 'New Real Token';
        let paddingCached: string = Lexer.padColumns(cachedT.length);
        let padding: string = Lexer.padColumns(newT.length);
        console.log('===============================================================================================================');
        console.log(cachedT + paddingCached + newT);
        console.log('===============================================================================================================');
    }

    private static testChar(existingState: StringCommentState, isFirstChar: boolean, char: string, nextChar: string, nesting: number) {
        let rv: StringCommentState;

        switch (char) {
            case 'Q':
                rv = (nextChar === '{')? StringCommentState.lUri : StringCommentState.init;
                break;
            case '(':
                if (nextChar === ':') {
                    rv = StringCommentState.lC;
                    nesting++;
                } else if (nextChar == ')') {
                    rv = StringCommentState.dSep;
                }
                else {
                    rv = StringCommentState.lB;
                }
                break;
            case '{':
                if (nextChar === '}') {
                    rv = StringCommentState.dSep;
                } else {
                    rv = StringCommentState.lBr;
                }
                break;
            case '[':
                if (nextChar === ']') {
                    rv = StringCommentState.dSep;
                } else {
                    rv = StringCommentState.lPr;
                }
                break;
            case ')':
                rv = StringCommentState.rB;
                break;
            case ']':
                rv = StringCommentState.rPr;
                break;
            case '}':
                rv = StringCommentState.rBr
                break;
            case '\'':
                rv = StringCommentState.lSq;
                break;
            case '\"':
                rv = StringCommentState.lDq;
                break;
            case ' ':
            case '\t':
            case '\n':
            case '\f':
                rv = StringCommentState.lWs;
                break;
            case '+':
            case '-':
                rv = StringCommentState.sep;
                break;
            default:
                let doubleChar = char + nextChar;
                if ((nextChar) && this.doubleSeps.indexOf(doubleChar) > -1) {
                    rv = StringCommentState.dSep;
                    break;
                } else if (this.separators.indexOf(char) > -1) {
                    rv = StringCommentState.sep;
                } else if (isFirstChar) {
                    let charCode = char.charCodeAt(0);
                    let nextCharCode = (nextChar)? nextChar.charCodeAt(0): -1;
                    // check 'dot' char:
                    if (charCode === 46) {
                        if (nextCharCode === 46) {
                            // '..' parent axis
                            rv = StringCommentState.dSep;
                        } else {
                            rv = this.isDigit(nextCharCode)? StringCommentState.lNl : StringCommentState.sep;
                        }
                    } else if (this.isDigit(charCode)) {
                        rv = StringCommentState.lNl;
                    } else if (char === '$') {
                        rv = StringCommentState.lVar;
                    } else if (char === '@') {
                        rv = StringCommentState.lAttr;
                    } else {
                        rv = StringCommentState.lName;
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
}



export interface Token {
    value: string,
    type: StringCommentState;
    label?: ResolvedState;
    children?: Token[];
    error?: boolean;
}

class ContainerToken implements Token {
    constructor(value: string, type: StringCommentState) {
        this.children = [];
        this.value = value;
        this.type = type;
    }
    value: string;
    type: StringCommentState;
    children: Token[];
}
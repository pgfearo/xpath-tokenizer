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
    Operator,
    NodeType,
    Axis,
    Name,
    Declaration,
    Function,
    If,
}

export class Data {
    public static separators = ['!','*', '+', ',', '-', '.', '/', ':', '<', '=', '>', '?','|'];

    public static doubleSeps = ['!=', '*:', '..', '//', ':*', '::', ':=', '<<', '<=', '=>', '>=', '>>', '||'];

    public static axes = [ "ancestor", "ancestor-or-self", "child", "descendant", "descendant-or-self", 
                            "following", "following-sibling", "namespace", "parent", "preceding", "preceding-sibling", "self"];

    public static nodeTypes = [ "attribute", 
                                "comment", "document-node", "attribute", "element", "empty-sequence", "item", "namespace-node", "node", 
                                "processing-instruction", 
                                "schema-attribute", "schema-element", "text"];                        

    public static keywords = [ "and", "array", "div", 
                                "else", "eq", "except",
                                "function", "ge", "gt", "idiv", "if", "in", "intersect", "is", "le",
                                "lt", "map", "mod", "ne", "or", "return", "satisfies",
                                "then", "to", "treat", "union"];

    public static rangeVars = ["every", "for", "let", "some"]
    public static firstParts = [ "cast", "castable", "instance"];
    public static secondParts = ["as", "of"];
}

export class Lexer {

    public debug: boolean = true;
    public debugState: boolean = false;
    private latestRealToken: Token;

    private static isPartOperator(firstPart: string, secondPart: string): boolean {
        let result = false;
        switch (firstPart) {
            case "cast":
            case "castable":
                result = secondPart === "of";
                break;
            case "instance":
                result = secondPart === "of";
                break;
        }
        return result;
    }

    public static tokenStateToString (resolvedState: TokenLevelState) : string {
        let r: string = undefined;

        switch (resolvedState) {
            case TokenLevelState.Axis:
                r = "Axis";
                break;
            case TokenLevelState.Declaration:
                r = "Declaration";
                break;
            case TokenLevelState.Function:
                r = "Function";
                break;
            case TokenLevelState.Name:
                r = "Name";
                break;
            case TokenLevelState.NodeType:
                r = "NodeType";
                break;
            case TokenLevelState.Operator:
                r = "Operator";
                break;
            case TokenLevelState.If:
                r = "If";
                break;
            default:
                r = "";
        }
        return r;
    }

    public static charStateToString (stringCommentState: CharLevelState) : string {
        let result: string = undefined;

        switch (stringCommentState) {
            case CharLevelState.init:
                result = "init";
                break;
            case CharLevelState.lB:
                result = "lB";
                break;
            case CharLevelState.rB:
                result = "rB";
                break;
            case CharLevelState.lC:
                result = "Comment";
                break;
            case CharLevelState.rC:
                result = "rC";
                break;
            case CharLevelState.lSq:
                result = "StringLiteral";
                break;
            case CharLevelState.rSq:
                result = "rSq";
                break;
            case CharLevelState.lDq:
                result = "lDq";
                break;
            case CharLevelState.rDq:
                result = "rDq";
                break;
            case CharLevelState.lBr:
                result = "lBr";
                break;
            case CharLevelState.rBr:
                result = "rBr";
                break;
            case CharLevelState.lWs:
                result = "Whitespace";
                break;
            case CharLevelState.lPr:
                result = "lPr";
                break;
            case CharLevelState.rPr:
                result = "rPr";
                break;
            case CharLevelState.escDq:
                result = "escDq";
                break;
            case CharLevelState.escSq:
                result = "escSq";
                break;
            case CharLevelState.sep:
                result = "sep";
                break;
            case CharLevelState.dSep:
                result = "dSep";
                break;
            case CharLevelState.dSep2:
                result = "dSep2";
                break;
            case CharLevelState.lUri:
                result = "URILiteral";
                break;
            case CharLevelState.rUri:
                result = "rUri";
                break;
            case CharLevelState.lNl:
                result = "NumericLiteral";
                break;
            case CharLevelState.rNl:
                result = "rNl";
                break;
            case CharLevelState.lVar:
                result = "Variable";
                break;
            case CharLevelState.exp:
                result = "Exponent";
                break;
            case CharLevelState.lName:
                result = "lName";
                break;
            case CharLevelState.lAttr:
                result = "Attribute";
                break;
         }
        return result;
    }

    private static calcNewState (isFirstChar: boolean, nesting: number, char: string, nextChar: string, existing: CharLevelState): [CharLevelState, number] {
        let rv: CharLevelState;
        let firstCharOfToken = true;

        switch (existing) {
            case CharLevelState.lNl:
                let charCode = char.charCodeAt(0);
                let nextCharCode = (nextChar)? nextChar.charCodeAt(0): -1;
                if (Lexer.isDigit(charCode) || char === '.') {
                    rv = existing;
                } else if (char === 'e' || char === 'E') {
                    if (nextChar === '-' || nextChar === '+' || Lexer.isDigit(nextCharCode)) {
                        rv = CharLevelState.exp;
                    } else {
                        rv = existing;
                    }
                } else {
                    ({ rv, nesting } = Lexer.testChar(existing, firstCharOfToken, char, nextChar, nesting));
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
                    ({ rv, nesting } = Lexer.testChar(existing, firstCharOfToken, char, nextChar, nesting));
                }
                break;
            case CharLevelState.lName:
            case CharLevelState.lVar:
            case CharLevelState.lAttr:
                if (char === '-' || char === '.' || (char === ':' && nextChar !== ':')) {
                    rv = existing;
                } else {
                    // we must switch to the new state, depending on the char/nextChar
                    ({ rv, nesting } = Lexer.testChar(existing, isFirstChar, char, nextChar, nesting));
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
                ({ rv, nesting } = Lexer.testChar(existing, isFirstChar, char, nextChar, nesting));
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
            Lexer.debugHeading();
        }
    
        for (let i = 0; i < xpath.length + 1; i++) {
            // deconstruct state:
            let [currentLabelState, nestingState] = currentState;
            let nextChar: string = xpath.charAt(i);
            let nextState: [CharLevelState, number];
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
                   (currentLabelState === CharLevelState.exp && nextLabelState == CharLevelState.lNl)) {
                    // do nothing if state has not changed
                    // or we're within a number with an exponent
                    tokenChars.push(currentChar);
                } else {
                    // state has changed, so save token and start new token
                    switch (nextLabelState){
                        case CharLevelState.lNl:
                        case CharLevelState.lVar:
                        case CharLevelState.lName:
                            this.updateResult(nestedTokenStack, result, {value: tokenChars.join(''), charType: currentLabelState});
                            tokenChars = [];
                            tokenChars.push(currentChar);
                            break;
                        case CharLevelState.exp:
                            tokenChars.push(currentChar);
                            break;
                        case CharLevelState.dSep:
                            this.updateResult(nestedTokenStack, result, {value: tokenChars.join(''), charType: currentLabelState});
                            let bothChars = currentChar + nextChar;
                            this.updateResult(nestedTokenStack, result, {value: bothChars , charType: nextLabelState});
                            tokenChars = [];
                            break;
                        case CharLevelState.dSep2:
                            break;
                        case CharLevelState.sep:
                            this.updateResult(nestedTokenStack, result, {value: tokenChars.join(''), charType: currentLabelState});
                            this.updateResult(nestedTokenStack, result, {value: currentChar, charType: nextLabelState});
                            tokenChars = [];
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
                            this.updateResult(nestedTokenStack, result, {value: tokenChars.join(''), charType: currentLabelState});
                            tokenChars = [];
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
                                let prevToken: Token = {value: tokenChars.join(''), charType: currentLabelState};
                                this.updateResult(nestedTokenStack, result, prevToken);
                                let newToken: Token = {value: currentChar, charType: nextLabelState};
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
                        console.log('============STATE CHANGE ===========================');
                        let prevType: string;
                        let prevToken: string = '';
                        if (prevRealToken === null) {
                            prevType = 'NULL';
                        } else {
                            prevType = Lexer.charStateToString(prevRealToken.charType);
                            prevToken = prevRealToken.value;
                        }
                        console.log('prevReal: ' + prevType + '[' + prevToken + ']');
                        console.log("from: " + Lexer.charStateToString(currentLabelState));
                        console.log("to:   " + Lexer.charStateToString(nextLabelState)) + "[" + token + "]";
                    }
                    if (token) {
                        if (this.debugState) {
                            console.log('[' + token + ']' + ' type: ' + Lexer.charStateToString(currentLabelState));
                        }
                        this.updateResult(nestedTokenStack, result, {value: token, charType: currentLabelState});
                    }
                }
                if (!nextChar && tokenChars.length > 0) {
                    token = tokenChars.join('');
                    if (this.debug) {
                        console.log("end-token: [" + token + "]" + ' type: ' + Lexer.charStateToString(currentLabelState));
                    }
                    result.push({value: token, charType: currentLabelState});
                }
                // console.log('=======================================');
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

            this.setLabelForLastTokenOnly(newValue);
            this.setLabelsUsingCurrentToken(newValue);

            let state = newValue.charType;
            if (!(state === CharLevelState.lC || state === CharLevelState.lWs)) {
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
            if (newValue.charType === CharLevelState.lWs && !(showWhitespace)) {
                // show nothing
            } else {
                console.log(cachedRealTokenString + cachedTpadding +  newT);
            }

            
        }
    }

    private setLabelForLastTokenOnly(currentToken: Token) {
        let currentState = currentToken.charType
        let prevToken = this.latestRealToken;
        if (prevToken) {
            let lastState: CharLevelState = prevToken.charType;
            if (prevToken.tokenType) {
                // do nothing as it's already been set
            } else if (prevToken.charType.valueOf() === CharLevelState.lName.valueOf()) {
                // prev tokens was a name so it may need resetting
                switch (currentState) {
                    case CharLevelState.lVar:
                        if (Data.rangeVars.indexOf(prevToken.value) > -1) {
                                // every, for, let, some
                                prevToken.tokenType = TokenLevelState.Declaration;
                        }
                        break;
                    case CharLevelState.lB:
                        if (prevToken.value === 'if') {
                            prevToken.tokenType = TokenLevelState.If;
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
                }
            }
        }
    }

    private setLabelsUsingCurrentToken(currentToken: Token) {
        let prevToken = this.latestRealToken;
        if (!(prevToken)) {
            prevToken = new BasicToken(',', CharLevelState.sep);
        }
        let currentValue = currentToken.value;

        switch (currentToken.charType) {
            case CharLevelState.dSep:
                currentToken.tokenType = TokenLevelState.Operator;
                break;
            case CharLevelState.lName:
                // token is a 'name' that needs resolving:
                // a Name cannot follow a Name -- unless it's like 'instance of'
                switch (prevToken.charType) {
                    case CharLevelState.lName:
                        if (Data.secondParts.indexOf(currentValue) > -1
                        && Lexer.isPartOperator(prevToken.value, currentValue)) {
                            // castable as etc.
                            prevToken.tokenType = TokenLevelState.Operator;
                            currentToken.tokenType = TokenLevelState.Operator;                               
                        } else if (prevToken.charType.valueOf() === CharLevelState.sep.valueOf() ||
                                   prevToken.charType.valueOf() === CharLevelState.dSep.valueOf()) {
                                       currentToken.tokenType = TokenLevelState.Name;
                        }
                        break;
                    case CharLevelState.rB:
                        // prev was ')' so this name must be an operator of some kind
                        // options: as, then, is, instance of, castable as, occurrence-indicator ?, *, +
                        // or any separator
                        currentToken.tokenType = TokenLevelState.Operator;
                        break;
                }
                break;
            case CharLevelState.dSep:
            case CharLevelState.dSep2:
                currentToken.tokenType = TokenLevelState.Operator; 
                break;

        }

    }

    private getTokenDebugString(lrt: Token) {
        let prevType: string;
        let prevToken: string = '';
        if (lrt === null) {
            prevType = 'NULL';
        }
        else {
            prevType = Lexer.charStateToString(lrt.charType);
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

    private static testChar(existingState: CharLevelState, isFirstChar: boolean, char: string, nextChar: string, nesting: number) {
        let rv: CharLevelState;

        switch (char) {
            case 'Q':
                rv = (nextChar === '{')? CharLevelState.lUri : CharLevelState.init;
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
}



export interface Token {
    value: string,
    charType: CharLevelState;
    tokenType?: TokenLevelState;
    children?: Token[];
    error?: boolean;
}

class BasicToken implements Token {
    value: string;
    charType: CharLevelState;

    constructor(value: string, type: CharLevelState) {
        this.value = value;
        this.charType = type;
    }
}

class ContainerToken implements Token {
    value: string;
    charType: CharLevelState;
    children: Token[];

    constructor(value: string, type: CharLevelState) {
        this.children = [];
        this.value = value;
        this.charType = type;
    }
}
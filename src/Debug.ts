import {CharLevelState, TokenLevelState, Token} from "./Lexer";

export class Debug {

    public static printResultTokens(tokens: Token[]) {
        tokens.forEach(Debug.showTokens);
    }

    public static printSerializedTokens(testTitle: string, testXpath: string, tokens: Token[]) {
        let preamble: string = `
        
        test('${testTitle}', () => {
        let l: Lexer = new Lexer();
        let r: Token[] = l.analyse('${testXpath}');
        let ts: Token[] = `;
        let postamble: string = `
        expect (r).toEqual(ts);
    });`
        let r = tokens.reduce(this.serializeTokens, '');
        let result = '[' + r + ']';

        console.log(preamble + result + postamble);
    }

    private static serializeTokens = function(accumulator: any, token: Token|null): any {
        let err = (token.error)? ', error' : '\"\"';
        let value = token.value;
        let tokenType = 'TokenLevelState.' + Debug.tokenStateToString(token.tokenType);
        let charType = 'CharLevelState.' + Debug.charStateToString(token.charType);
        let childrenString: string = '';
        if (token.children) {
            childrenString = ',\nchildren:';
            childrenString += '[' + token.children.reduce(Debug.serializeTokens, '') + ']';
        }
        let objectString = 
        `
{value: "${value}",
charType: ${charType},
tokenType: ${tokenType + childrenString}
},`;
         return accumulator + objectString;
    }


    public static printMinSerializedTokens(testTitle: string, testXpath: string, tokens: Token[]) {
        let preamble: string = `
        
        test('${testTitle}', () => {
        let l: Lexer = new Lexer();
        let rx: Token[] = l.analyse('${testXpath}');
        let r: Token[] = Utilities.minimiseTokens(rx);
        let ts: Token[] = `;
        let postamble: string = `
        expect (r).toEqual(ts);
    });`
        let r = tokens.reduce(this.minSerializeTokens, '');
        let result = '[' + r + ']';

        console.log(preamble + result + postamble);
    }

    private static minSerializeTokens = function(accumulator: any, token: Token|null): any {
        if (token.charType.valueOf() === CharLevelState.lWs.valueOf()) {
            return accumulator;
        } else {
            let err = (token.error)? ', error' : '\"\"';
            let value = token.value;
            let tokenType = 'TokenLevelState.' + Debug.tokenStateToString(token.tokenType);
            let charType = 'CharLevelState.' + Debug.charStateToString(token.charType);
            let childrenString: string = '';
            if (token.children) {
                childrenString = ',\nchildren:';
                childrenString += '[' + token.children.reduce(Debug.serializeTokens, '') + ']';
            }
            let objectString = 
            `
    {value: "${value}",
    tokenType: ${tokenType + childrenString}
    },`;
            return accumulator + objectString;
        }   
    }


    private static showTokens = function(token: Token) {
        let err = (token.error)? ' error' : '';
        let tokenValue = token.value + '';
        let charState: string = Debug.charStateToString(token.charType);
        console.log(Debug.padString(tokenValue) + Debug.padString(charState) + Debug.tokenStateToString(token.tokenType) + err);
        if (token.children) {
            console.log('--- children-start---');
            token.children.forEach(Debug.showTokens);
            console.log('--- children-end ----');
        }
    }

    public static printDebugOutput(latestRealToken: Token, cachedRealToken: Token, newValue: Token) {
        if (newValue.value !== '') {
            let showWhitespace = false;
            let nextRealToken: string = this.getTokenDebugString(latestRealToken);
            let cachedRealTokenString: string = this.getTokenDebugString(cachedRealToken);
            let newT: string =  this.getTokenDebugString(newValue);

            let cachedTpadding: string = this.padColumns(cachedRealTokenString.length);
            let newTpadding: string = this.padColumns(newT.length);
            if (newValue.charType === CharLevelState.lWs && !(showWhitespace)) {
                // show nothing
            } else {
                console.log(cachedRealTokenString + cachedTpadding +  newT);
            }
        }
    }

    public static printStateOuput(prevRealToken: Token, currentLabelState: CharLevelState, nextLabelState: CharLevelState, token: string ) {
        console.log('============STATE CHANGE ===========================');
        let prevType: string;
        let prevToken: string = '';
        if (prevRealToken === null) {
            prevType = 'NULL';
        } else {
            prevType = Debug.charStateToString(prevRealToken.charType);
            prevToken = prevRealToken.value;
        }
        console.log('prevReal: ' + prevType + '[' + prevToken + ']');
        console.log("from: " + Debug.charStateToString(currentLabelState));
        console.log("to:   " + Debug.charStateToString(nextLabelState)) + "[" + token + "]";
    }

    public static getTokenDebugString(lrt: Token) {
        let prevType: string;
        let prevToken: string = '';
        if (lrt === null) {
            prevType = 'NULL';
        }
        else {
            prevType = this.charStateToString(lrt.charType);
            prevToken = lrt.value;
        }
        let prevTypeLength = (prevType)? prevType.length : 0;
        let oldT: string = prevType + this.padParts(prevTypeLength) +  prevToken + '_';
        return oldT;
    }

    private static padString(text: string): string {
        return text + this.padParts(text.length);
    }

    private static padStringDots(padLength: number): string {
        let padding = '';
        for (let i = 0;  i < 16 - padLength; i++) {
            padding += '.';
        }
        return padding;
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

    public static debugHeading() {
        let cachedT: string = 'Cached Real Token';
        let newT: string =  'New Token';
        let oldT: string = 'New Real Token';
        let paddingCached: string = this.padColumns(cachedT.length);
        let padding: string = this.padColumns(newT.length);
        console.log('===============================================================================================================');
        console.log(cachedT + paddingCached + newT);
        console.log('===============================================================================================================');
    }

    public static tokenStateToString (resolvedState: TokenLevelState) : string {
        let r: string = undefined;

        switch (resolvedState) {
            case TokenLevelState.Attribute:
                r = "Attribute";
                break;
            case TokenLevelState.Number:
                r = "Number";
                break;
            case TokenLevelState.Variable:
                r = "Variable";
                break;
            case TokenLevelState.Whitespace:
                r = "Whitespace";
                break;
            case TokenLevelState.String:
                r = "String";
                break;
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
            case TokenLevelState.SimpleType:
                r = "SimpleType";
                break;
            case TokenLevelState.Operator:
                r = "Operator";
                break;
            case TokenLevelState.Unset:
                r = "Unset";
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
                result = "lC";
                break;
            case CharLevelState.rC:
                result = "rC";
                break;
            case CharLevelState.lSq:
                result = "lSq";
                break;
            case CharLevelState.lDq:
                result = "lDq";
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
                result = "lWs";
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
                result = "lUri";
                break;
            case CharLevelState.rUri:
                result = "rUri";
                break;
            case CharLevelState.lNl:
                result = "lNl";
                break;
            case CharLevelState.rNl:
                result = "rNl";
                break;
            case CharLevelState.lVar:
                result = "lVar";
                break;
            case CharLevelState.exp:
                result = "exp";
                break;
            case CharLevelState.lName:
                result = "lName";
                break;
            case CharLevelState.lAttr:
                result = "lAttr";
                break;
         }
        return result;
    }
}
import {CharLevelState, TokenLevelState, Token} from "./Lexer";

export class Debug {

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
}
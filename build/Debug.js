"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Lexer_1 = require("./Lexer");
var Debug = /** @class */ (function () {
    function Debug() {
    }
    Debug.printDebugOutput = function (latestRealToken, cachedRealToken, newValue) {
        if (newValue.value !== '') {
            var showWhitespace = false;
            var nextRealToken = this.getTokenDebugString(latestRealToken);
            var cachedRealTokenString = this.getTokenDebugString(cachedRealToken);
            var newT = this.getTokenDebugString(newValue);
            var cachedTpadding = this.padColumns(cachedRealTokenString.length);
            var newTpadding = this.padColumns(newT.length);
            if (newValue.charType === Lexer_1.CharLevelState.lWs && !(showWhitespace)) {
                // show nothing
            }
            else {
                console.log(cachedRealTokenString + cachedTpadding + newT);
            }
        }
    };
    Debug.printStateOuput = function (prevRealToken, currentLabelState, nextLabelState, token) {
        console.log('============STATE CHANGE ===========================');
        var prevType;
        var prevToken = '';
        if (prevRealToken === null) {
            prevType = 'NULL';
        }
        else {
            prevType = Debug.charStateToString(prevRealToken.charType);
            prevToken = prevRealToken.value;
        }
        console.log('prevReal: ' + prevType + '[' + prevToken + ']');
        console.log("from: " + Debug.charStateToString(currentLabelState));
        console.log("to:   " + Debug.charStateToString(nextLabelState)) + "[" + token + "]";
    };
    Debug.getTokenDebugString = function (lrt) {
        var prevType;
        var prevToken = '';
        if (lrt === null) {
            prevType = 'NULL';
        }
        else {
            prevType = this.charStateToString(lrt.charType);
            prevToken = lrt.value;
        }
        var prevTypeLength = (prevType) ? prevType.length : 0;
        var oldT = prevType + this.padParts(prevTypeLength) + prevToken + '_';
        return oldT;
    };
    Debug.padColumns = function (padLength) {
        var padding = '';
        for (var i = 0; i < 50 - padLength; i++) {
            padding += ' ';
        }
        return padding;
    };
    Debug.padParts = function (padLength) {
        var padding = '';
        for (var i = 0; i < 16 - padLength; i++) {
            padding += ' ';
        }
        return padding;
    };
    Debug.debugHeading = function () {
        var cachedT = 'Cached Real Token';
        var newT = 'New Token';
        var oldT = 'New Real Token';
        var paddingCached = this.padColumns(cachedT.length);
        var padding = this.padColumns(newT.length);
        console.log('===============================================================================================================');
        console.log(cachedT + paddingCached + newT);
        console.log('===============================================================================================================');
    };
    Debug.tokenStateToString = function (resolvedState) {
        var r = undefined;
        switch (resolvedState) {
            case Lexer_1.TokenLevelState.Attribute:
                r = "Attribute";
                break;
            case Lexer_1.TokenLevelState.Number:
                r = "Number";
                break;
            case Lexer_1.TokenLevelState.Variable:
                r = "Variable";
                break;
            case Lexer_1.TokenLevelState.Whitespace:
                r = "Whitespace";
                break;
            case Lexer_1.TokenLevelState.String:
                r = "String";
                break;
            case Lexer_1.TokenLevelState.Axis:
                r = "Axis";
                break;
            case Lexer_1.TokenLevelState.Declaration:
                r = "Declaration";
                break;
            case Lexer_1.TokenLevelState.Function:
                r = "Function";
                break;
            case Lexer_1.TokenLevelState.Name:
                r = "Name";
                break;
            case Lexer_1.TokenLevelState.NodeType:
                r = "NodeType";
                break;
            case Lexer_1.TokenLevelState.SimpleType:
                r = "SimpleType";
                break;
            case Lexer_1.TokenLevelState.Operator:
                r = "Operator";
                break;
            case Lexer_1.TokenLevelState.Unset:
                r = "Unset";
            default:
                r = "";
        }
        return r;
    };
    Debug.charStateToString = function (stringCommentState) {
        var result = undefined;
        switch (stringCommentState) {
            case Lexer_1.CharLevelState.init:
                result = "init";
                break;
            case Lexer_1.CharLevelState.lB:
                result = "lB";
                break;
            case Lexer_1.CharLevelState.rB:
                result = "rB";
                break;
            case Lexer_1.CharLevelState.lC:
                result = "lC";
                break;
            case Lexer_1.CharLevelState.rC:
                result = "rC";
                break;
            case Lexer_1.CharLevelState.lSq:
                result = "lSq";
                break;
            case Lexer_1.CharLevelState.lDq:
                result = "lDq";
                break;
            case Lexer_1.CharLevelState.rSq:
                result = "rSq";
                break;
            case Lexer_1.CharLevelState.lDq:
                result = "lDq";
                break;
            case Lexer_1.CharLevelState.rDq:
                result = "rDq";
                break;
            case Lexer_1.CharLevelState.lBr:
                result = "lBr";
                break;
            case Lexer_1.CharLevelState.rBr:
                result = "rBr";
                break;
            case Lexer_1.CharLevelState.lWs:
                result = "lWs";
                break;
            case Lexer_1.CharLevelState.lPr:
                result = "lPr";
                break;
            case Lexer_1.CharLevelState.rPr:
                result = "rPr";
                break;
            case Lexer_1.CharLevelState.escDq:
                result = "escDq";
                break;
            case Lexer_1.CharLevelState.escSq:
                result = "escSq";
                break;
            case Lexer_1.CharLevelState.sep:
                result = "sep";
                break;
            case Lexer_1.CharLevelState.dSep:
                result = "dSep";
                break;
            case Lexer_1.CharLevelState.dSep2:
                result = "dSep2";
                break;
            case Lexer_1.CharLevelState.lUri:
                result = "lUri";
                break;
            case Lexer_1.CharLevelState.rUri:
                result = "rUri";
                break;
            case Lexer_1.CharLevelState.lNl:
                result = "lNl";
                break;
            case Lexer_1.CharLevelState.rNl:
                result = "rNl";
                break;
            case Lexer_1.CharLevelState.lVar:
                result = "lVar";
                break;
            case Lexer_1.CharLevelState.exp:
                result = "exp";
                break;
            case Lexer_1.CharLevelState.lName:
                result = "lName";
                break;
            case Lexer_1.CharLevelState.lAttr:
                result = "lAttr";
                break;
        }
        return result;
    };
    return Debug;
}());
exports.Debug = Debug;
//# sourceMappingURL=Debug.js.map
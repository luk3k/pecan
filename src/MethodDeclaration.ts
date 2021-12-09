import {Target} from "./Target";
import {Variable} from "./Variable";
import {Range, Position, TextDocument} from 'vscode';

export class MethodDeclaration extends Target {
    className: string;
    returnType: Target;
    params: Variable[];

    constructor(identifier: Range, start: Position, end: Position, document: TextDocument,
                className: string, returnType: Target, params: Variable[]) {
        super(identifier, start, end, document);
        this.className = className;
        this.returnType = returnType;
        this.params = params;
    }
}

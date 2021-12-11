import {Target} from "./Target";
import {Variable} from "./Variable";
import {Range, Position, TextDocument} from 'vscode';

export class MethodDeclaration extends Target {
    className: string;
    returnType: Target | undefined;
    params: Variable[];
    methodBody: Target;

    constructor(identifier: Range, start: Position, end: Position, document: TextDocument,
                className: string, returnType: Target, params: Variable[], methodBody: Target) {
        super(identifier, start, end, document);
        this.className = className;
        this.returnType = returnType;
        this.params = params;
        this.methodBody = methodBody;
    }
}

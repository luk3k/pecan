import {Target} from "./Target";
import {Variable} from "./Variable";
import {Range, Position} from 'vscode';

export class MethodDeclaration extends Target {
    className: string;
    returnType: Range;
    params: Variable[];

    constructor(identifier: Range, start: Position, end: Position,
                className: string, returnType: Range, params: Variable[]) {
        super(identifier, start, end);
        this.className = className;
        this.returnType = returnType;
        this.params = params;
    }
}

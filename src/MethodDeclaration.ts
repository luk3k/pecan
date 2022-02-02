import {Target} from "./Target";
import {Variable} from "./Variable";
import {Range, Position, TextDocument} from 'vscode';
import {ClassDeclaration} from "./ClassDeclaration";

export class MethodDeclaration extends Target {
    classDeclaration: ClassDeclaration | null = null;
    returnType: Target | null;
    params: Variable[];
    methodBody: Target;

    constructor(identifier: Range, start: Position, end: Position, document: TextDocument,
                classDeclaration: ClassDeclaration | null, returnType: Target | null, params: Variable[], methodBody: Target) {
        super(identifier, start, end, document);
        this.classDeclaration = classDeclaration;
        this.returnType = returnType;
        this.params = params;
        this.methodBody = methodBody;
    }
}

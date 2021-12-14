import {Target} from "./Target";
import {Variable} from "./Variable";
import {Position, Range, TextDocument} from "vscode";
import {ClassDeclaration} from "./ClassDeclaration";

export class ConstructorDeclaration extends Target {
    classDeclaration: ClassDeclaration | null = null;
    params: Variable[];
    body: Target;

    constructor(identifier: Range, start: Position, end: Position, document: TextDocument,
                classDeclaration: ClassDeclaration | null, params: Variable[], body: Target) {
        super(identifier, start, end, document);
        this.classDeclaration = classDeclaration;
        this.params = params;
        this.body = body;
    }
}

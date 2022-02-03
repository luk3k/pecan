import {Target} from "./Target";
import {Range, Position, TextDocument} from 'vscode';
import {MethodDeclaration} from "./MethodDeclaration";
import {Variable} from "./Variable";
import {ConstructorDeclaration} from "./ConstructorDeclaration";

export class ClassDeclaration extends Target {
    typeParams: Target[];
    superClasses: Target[];
    interfaces: Target[];
    classBody: Target;
    constructorDeclarations: ConstructorDeclaration[];
    fields: Variable[];
    methodDeclarations: MethodDeclaration[];

    constructor(identifier: Range, start: Position, end: Position, document: TextDocument, typeParams: Target[],
                superClasses: Target[], interfaces: Target[], classBody: Target,
                constructorDeclarations: ConstructorDeclaration[], fields: Variable[], methodDeclarations: MethodDeclaration[]) {
        super(identifier, start, end, document);
        this.typeParams = typeParams;
        this.superClasses = superClasses;
        this.interfaces = interfaces;
        this.classBody = classBody;
        this.constructorDeclarations = constructorDeclarations;
        this.fields = fields;
        this.methodDeclarations = methodDeclarations;
    }
}

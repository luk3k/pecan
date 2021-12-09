import {Target} from "./Target";
import {Range, Position, TextDocument} from 'vscode';

export class ClassDeclaration extends Target {

    constructor(identifier: Range, start: Position, end: Position, document: TextDocument) {
        super(identifier, start, end, document);
    }
}

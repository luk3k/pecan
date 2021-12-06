import {Target} from "./Target";
import {Range, Position} from 'vscode';

export class ClassDeclaration extends Target {

    constructor(identifier: Range, start: Position, end: Position) {
        super(identifier, start, end);
    }
}

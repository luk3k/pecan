import {Target} from "./Target";
import {Range, Position, TextDocument} from 'vscode';

export class Variable extends Target {
    type: Target | undefined;
    value: Target | undefined;

    constructor(identifier: Range | undefined, start: Position, end: Position, document: TextDocument,
                type: Target | undefined, value: Target | undefined) {
        super(identifier, start, end, document);
        this.type = type;
        this.value = value;
    }
}

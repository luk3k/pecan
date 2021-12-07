import {Target} from "./Target";
import {Range, Position} from 'vscode';

export class Variable extends Target {
    type: Range | undefined;
    value: Range | undefined;

    constructor(identifier: Range | undefined, start: Position, end: Position,
                type: Range | undefined, value: Range | undefined) {
        super(identifier, start, end);
        this.type = type;
        this.value = value;
    }
}

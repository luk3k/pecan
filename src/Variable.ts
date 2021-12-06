import {Target} from "./Target";
import {Range, Position} from 'vscode';

export class Variable extends Target {
    type: string | undefined;
    value: string | undefined;

    constructor(identifier: Range | undefined, start: Position, end: Position,
                type: string | undefined, value: string | undefined) {
        super(identifier, start, end);
        this.type = type;
        this.value = value;
    }
}

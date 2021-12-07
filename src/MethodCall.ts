import {Target} from "./Target";
import {Range, Position} from 'vscode';

export class MethodCall extends Target {
    args: Range[];

    constructor(identifier: Range | undefined, start: Position , end: Position, args: Range[]) {
        super(identifier, start, end);
        this.args = args;
    }
}

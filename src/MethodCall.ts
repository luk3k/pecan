import {Target} from "./Target";
import {Range, Position} from 'vscode';

export class MethodCall extends Target {
    args: string[];

    constructor(identifier: Range | undefined, start: Position , end: Position, args: string[]) {
        super(identifier, start, end);
        this.args = args;
    }
}

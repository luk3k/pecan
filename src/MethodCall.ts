import {Target} from "./Target";
import {Range, Position, TextDocument} from 'vscode';

export class MethodCall extends Target {
    args: Target[];

    constructor(identifier: Range | undefined, start: Position , end: Position, document: TextDocument, args: Target[]) {
        super(identifier, start, end, document);
        this.args = args;
    }
}

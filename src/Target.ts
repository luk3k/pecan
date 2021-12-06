import {Range, Position} from 'vscode';

/**
 * The Target class is used to represent a target in the editor. E.g. a target could be a class declaration or a
 * method declaration. It is possible to annotate and highlight target objects.
 */
export class Target {
    identifier: Range | undefined;
    start: Position;
    end: Position;

    constructor(identifier: Range | undefined, start: Position, end: Position) {
        this.identifier = identifier;
        this.start = start;
        this.end = end;
    }
}

import {Range, Position, TextEditorDecorationType, DecorationOptions, TextEditor} from 'vscode';
import {registerTarget, unregisterTarget, renderActiveTargets} from "./index";

/**
 * The Target class is used to represent a target in the editor. E.g. a target could be a class declaration or a
 * method declaration. It is possible to annotate and highlight target objects.
 */
export class Target {
    identifier: Range | undefined;
    start: Position;
    end: Position;
    decorationOptions: DecorationOptions;

    constructor(identifier: Range | undefined, start: Position, end: Position) {
        this.identifier = identifier;
        this.start = start;
        this.end = end;
        this.decorationOptions = {
            range: new Range(start, end)
        } as DecorationOptions;
    }

    applyStyle(decorationType: TextEditorDecorationType, editor: TextEditor): void {
        registerTarget(this, decorationType);
        renderActiveTargets(editor, decorationType);
    }

    removeStyle(decorationType: TextEditorDecorationType, editor: TextEditor): void {
        unregisterTarget(this, decorationType);
        renderActiveTargets(editor, decorationType);
    }
}

import {
    Range,
    Position,
    TextEditorDecorationType,
    DecorationOptions,
    TextEditor,
    TextDocument,
    Command, CodeLens, DecorationInstanceRenderOptions, ThemableDecorationAttachmentRenderOptions
} from 'vscode';
import {registerTarget, unregisterTarget, renderActiveTargets, resetDecorations} from "./index";
import * as vscode from 'vscode';
import {DefaultCodeLensProvider} from "./DefaultCodeLensProvider";

/**
 * The Target class is used to represent a target in the editor. E.g. a target could be a class declaration or a
 * method declaration. It is possible to annotate and highlight target objects.
 */
export class Target {
    identifier: Range | undefined;
    start: Position;
    end: Position;
    readonly document: vscode.TextDocument;
    readonly decorationOptions: DecorationOptions;

    constructor(identifier: Range | undefined, start: Position, end: Position, document: TextDocument) {
        this.identifier = identifier;
        this.start = start;
        this.end = end;
        this.document = document;
        this.decorationOptions = {
            range: new Range(start, end)
        } as DecorationOptions;
    }

    applyStyle(decorationType: TextEditorDecorationType, editor: TextEditor, identifier: boolean = false): void {
        if(identifier) {
            if(!this.identifier) throw TypeError('Identifier is undefined');
            const r: Range = this.identifier!;
            const t: Target = new Target(r, r.start, r.end, this.document);
            registerTarget(t, decorationType);
        } else {
            registerTarget(this, decorationType);
        }
        renderActiveTargets(editor);
    }

    applyTextDecoration(decorationType: TextEditorDecorationType,text: ThemableDecorationAttachmentRenderOptions, position: string, editor: TextEditor) {
        if(this.decorationOptions.renderOptions === undefined) this.decorationOptions.renderOptions = {} as DecorationInstanceRenderOptions;
        if(position === 'before') {
            this.decorationOptions.renderOptions.before = text;
        } else if(position === 'after') {
            this.decorationOptions.renderOptions.after = text;
        }
        // TODO renderoption stay in target with applyStyle
        unregisterTarget(this, decorationType);
        registerTarget(this, decorationType);
        renderActiveTargets(editor);
    }

    applyCodelens(provider: DefaultCodeLensProvider, command: Command): void {
        provider.attachCodeLens(new CodeLens(new Range(this.start, this.end), command));
    }

    removeStyle(decorationType: TextEditorDecorationType, editor: TextEditor): void {
        unregisterTarget(this, decorationType);
        renderActiveTargets(editor);
    }

    removeTextDecoration(decorationType: TextEditorDecorationType, position: string, editor: TextEditor): void {
        if(this.decorationOptions.renderOptions === undefined) return;
        if(position === 'before') {
            this.decorationOptions.renderOptions.before = undefined;
        } else if(position === 'after') {
            this.decorationOptions.renderOptions.after = undefined;
        }
        unregisterTarget(this, decorationType);
        renderActiveTargets(editor);
    }

    getText(): string {
        return this.document.getText(new Range(this.start, this.end));
    }

    isEqual(other: Target): boolean {
        if(this.identifier) {
            return other.identifier !== undefined &&
                this.identifier!.isEqual(other.identifier!) &&
                this.start.isEqual(other.start) &&
                this.end.isEqual(other.end);
        }
        return other.identifier === undefined &&
            this.start.isEqual(other.start) &&
            this.end.isEqual(other.end);
    }
}

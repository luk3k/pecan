import {
    Range,
    Position,
    TextEditorDecorationType,
    DecorationOptions,
    TextDocument,
    Command,
    CodeLens,
    ThemableDecorationAttachmentRenderOptions,
    DecorationRenderOptions,
    window, MarkdownString
} from 'vscode';
import * as vscode from 'vscode';
import {getCodeLensController, getDecorationController} from "./index";

/**
 * The Target class is used to represent a target in the editor. E.g. a target could be a class declaration or a
 * method declaration. It is possible to annotate and highlight target objects.
 */
export class Target {
    identifier: Range | undefined;
    start: Position;
    end: Position;
    private identifierTarget: Target | undefined;
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

    applyStyle(decorationType: TextEditorDecorationType, hoverMessage?: MarkdownString | Array<MarkdownString>, identifier: boolean = false): void {
        if(identifier) {
            if(!this.identifier) throw TypeError('Identifier is undefined');
            const r: Range = this.identifier!;
            if(!this.identifierTarget) {
                this.identifierTarget = new Target(r, r.start, r.end, this.document);
            }
            if(hoverMessage) {
                this.identifierTarget.setHoverMessage(hoverMessage);
            }
            getDecorationController(this.document.fileName)?.decorateTarget(this.identifierTarget, decorationType);
        } else {
            if(hoverMessage) {
                this.decorationOptions.hoverMessage = hoverMessage;
            }
            getDecorationController(this.document.fileName)?.decorateTarget(this, decorationType);
        }
    }

    setHoverMessage(hoverMessage: MarkdownString | Array<MarkdownString>) {
        this.decorationOptions.hoverMessage = hoverMessage;
    }

    removeHoverMessage(identifier: boolean = false) {
        if(identifier) {
            this.identifierTarget?.removeHoverMessage();
        } else {
            this.decorationOptions.hoverMessage = undefined;
        }
    }

    applyTextDecoration(textDecoration: ThemableDecorationAttachmentRenderOptions, position: string, identifier: boolean = false): TextEditorDecorationType {
        const decorationOptions: DecorationRenderOptions = {};
        if(position === 'before') {
            decorationOptions.before = textDecoration;
        } else if(position === 'after') {
            decorationOptions.after = textDecoration;
        }

        const decorationType: TextEditorDecorationType = window.createTextEditorDecorationType(decorationOptions);
        this.applyStyle(decorationType, undefined, identifier);

        return decorationType;
    }

    applyCodelens(command: Command, identifier: boolean = false): void {
        let r: Range = new Range(this.start, this.end);
        if(identifier) {
            if(!this.identifier) throw TypeError('Identifier is undefined');
            r = this.identifier!;
        }
        const codeLens = new CodeLens(r, command);
        getCodeLensController(this.document.fileName)?.addCodeLens(codeLens);
    }

    removeStyle(decorationType: TextEditorDecorationType, identifier: boolean = false): void {
        if(identifier) {
            if(!this.identifier) throw TypeError('Identifier is undefined');
            const r: Range = this.identifier!;
            const t: Target = new Target(r, r.start, r.end, this.document);
            getDecorationController(this.document.fileName)?.removeDecoration(t, decorationType);
        } else {
            getDecorationController(this.document.fileName)?.removeDecoration(this, decorationType);
        }
    }

    removeTextDecoration(decorationType: TextEditorDecorationType): void {
        this.removeStyle(decorationType);
    }

    removeCodeLenses(identifier: boolean = false) {
        if(identifier) {
            if(!this.identifier) throw TypeError('Identifier is undefined');
            getCodeLensController(this.document.fileName)?.removeCodeLens(this.identifier!);
        } else {
            getCodeLensController(this.document.fileName)?.removeCodeLens(new Range(this.start, this.end));
        }
    }

    getText(): string {
        return this.document.getText(new Range(this.start, this.end));
    }

    getIdentifierText(): string {
        return this.identifier ? this.document.getText(this.identifier) : this.getText();
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

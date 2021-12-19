import {DecorationOptions, TextEditor, TextEditorDecorationType} from "vscode";
import {Target} from "./Target";


export class DecorationController {

    private decorationTargets: Map<TextEditorDecorationType, Target[]>;
    private editor: TextEditor;

    constructor(editor: TextEditor) {
        this.decorationTargets = new Map<TextEditorDecorationType, Target[]>();
        this.editor = editor;
    }

    decorateTarget(target: Target, decorationType: TextEditorDecorationType): void {
        if(this.decorationTargets.has(decorationType)) {
            if(this.decorationTargets.get(decorationType)!.findIndex(t => t.isEqual(target)) !== -1) return;
            this.decorationTargets.get(decorationType)!.push(target);
        } else {
            this.decorationTargets.set(decorationType, [target]);
        }

        this.renderTargets();
    }

    removeDecoration(target: Target, decorationType: TextEditorDecorationType): void {
        if(this.decorationTargets.has(decorationType)) {
            const i: number = this.decorationTargets.get(decorationType)!.findIndex(t => t.isEqual(target));
            if(i === -1) return;
            this.decorationTargets.get(decorationType)?.splice(i, 1);

            this.renderTargets();
        }
    }

    removeAllDecorations() {
        this.decorationTargets.forEach((targets, decorationType) => {
            this.editor.setDecorations(decorationType, []);
        });

        this.decorationTargets = new Map<TextEditorDecorationType, Target[]>();
    }

    disposeDecorationType(decorationType: TextEditorDecorationType): void {
        if(this.decorationTargets.has(decorationType)) {
            this.decorationTargets.delete(decorationType);
            decorationType.dispose();
        }
    }

    renderTargets(): void {
        this.decorationTargets.forEach((targets, decorationType) => {
            const decorationOptions: DecorationOptions[] = [];
            targets.forEach(t => {
                decorationOptions.push(t.decorationOptions);
            });

            this.editor.setDecorations(decorationType, decorationOptions);
        });
    }

    setEditor(editor: TextEditor) {
        this.editor = editor;
    }
}

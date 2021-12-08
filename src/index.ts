import {Target} from "./Target";
import {DecorationOptions, TextEditor, TextEditorDecorationType} from "vscode";

export * from './Ast';

const activeTargets: Map<TextEditorDecorationType, Target[]> = new Map<TextEditorDecorationType, Target[]>()

export function registerTargetWithDecorationType(target: Target, decorationType: TextEditorDecorationType) {
    if(activeTargets.has(decorationType)) {
        activeTargets.get(decorationType)?.push(target);
    } else {
        activeTargets.set(decorationType, [target]);
    }
}

export function renderActiveTargets(editor: TextEditor, decorationType: TextEditorDecorationType) {
    const decorationOptions: DecorationOptions[] = [];
    activeTargets.get(decorationType)?.forEach((t) => {
        decorationOptions.push(t.decorationOptions);
    });

    editor.setDecorations(decorationType, decorationOptions);
}

import {Target} from "./Target";
import {DecorationOptions, TextEditor, TextEditorDecorationType} from "vscode";

export * from './Ast';
export * from './globals';

const activeTargets: Map<TextEditorDecorationType, Target[]> = new Map<TextEditorDecorationType, Target[]>()

export function registerTarget(target: Target, decorationType: TextEditorDecorationType): void {
    if(activeTargets.has(decorationType)) {
        activeTargets.get(decorationType)!.push(target);
    } else {
        activeTargets.set(decorationType, [target]);
    }
}

export function unregisterTarget(target: Target, decorationType: TextEditorDecorationType): void {
    if(activeTargets.has(decorationType)) {
        const i: number = activeTargets.get(decorationType)!.indexOf(target);
        activeTargets.get(decorationType)?.splice(i, 1);
    }
}

export function renderActiveTargets(editor: TextEditor, decorationType: TextEditorDecorationType): void {
    const decorationOptions: DecorationOptions[] = [];
    activeTargets.get(decorationType)?.forEach((t) => {
        decorationOptions.push(t.decorationOptions);
    });

    editor.setDecorations(decorationType, decorationOptions);
}

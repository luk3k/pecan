import {Target} from "./Target";
import {DecorationOptions, TextEditor, TextEditorDecorationType} from "vscode";

export * from './Ast';
export * from './globals';
export * from './DefaultCodeLensProvider';

const activeTargets: Map<TextEditorDecorationType, Target[]> = new Map<TextEditorDecorationType, Target[]>()

export function registerTarget(target: Target, decorationType: TextEditorDecorationType): void {
    if(activeTargets.has(decorationType)) {
        if(activeTargets.get(decorationType)!.findIndex((t) => t.isEqual(target)) !== -1) return;
        activeTargets.get(decorationType)!.push(target);
    } else {
        activeTargets.set(decorationType, [target]);
    }
}

export function unregisterTarget(target: Target, decorationType: TextEditorDecorationType): void {
    if(activeTargets.has(decorationType)) {
        const i: number = activeTargets.get(decorationType)!.findIndex((t) => t.isEqual(target));
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

export function registerCodelensProvider() {

}

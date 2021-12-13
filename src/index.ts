import {Target} from "./Target";
import {DecorationOptions, TextEditor, TextEditorDecorationType} from "vscode";

//Export Classes
export * from './Target';
export * from './DefaultCodeLensProvider';
export * from './ClassDeclaration';
export * from './MethodCall';
export * from './MethodDeclaration';
export * from './Variable';

export * from './Ast';
export * from './globals';

const activeTargets: Map<TextEditorDecorationType, Target[]> = new Map<TextEditorDecorationType, Target[]>();

export function registerTarget(target: Target, decorationType: TextEditorDecorationType): void {
    if(activeTargets.has(decorationType)) {
        if(activeTargets.get(decorationType)!.findIndex(t => t.isEqual(target)) !== -1) return;
        activeTargets.get(decorationType)!.push(target);
    } else {
        activeTargets.set(decorationType, [target]);
    }
}

export function unregisterTarget(target: Target, decorationType: TextEditorDecorationType): void {
    if(activeTargets.has(decorationType)) {
        const i: number = activeTargets.get(decorationType)!.findIndex(t => t.isEqual(target));
        if(i === -1) return;
        activeTargets.get(decorationType)?.splice(i, 1);
    }
}

export function resetDecorations(decorationType: TextEditorDecorationType) {
    activeTargets.delete(decorationType);
}

export function renderActiveTargets(editor: TextEditor): void {
    activeTargets.forEach((targets, decorationType) => {
        const decorationOptions: DecorationOptions[] = [];
        targets.forEach(t => {
            decorationOptions.push(t.decorationOptions);
        });

        editor.setDecorations(decorationType, decorationOptions);
    });
}

export function registerCodelensProvider() {

}

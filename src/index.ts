import {TextEditor} from "vscode";
import {DecorationController} from "./DecorationController";

//Export Classes
export * from './Target';
export * from './DefaultCodeLensProvider';
export * from './ClassDeclaration';
export * from './MethodCall';
export * from './MethodDeclaration';
export * from './Variable';

export * from './Ast';
export * from './globals';

let decorationControllers: Map<string ,DecorationController> = new Map<string, DecorationController>();

export function registerTextEditor(editor: TextEditor): void {
    if(decorationControllers.has(editor.document.fileName)) {
        decorationControllers.get(editor.document.fileName)?.setEditor(editor);
        decorationControllers.get(editor.document.fileName)?.renderTargets();
    } else {
        decorationControllers.set(editor.document.fileName, new DecorationController(editor));
    }
}

export function removeAllDecorations(editor: TextEditor) {
    decorationControllers.get(editor.document.fileName)?.removeAllDecorations();
}

export function getDecorationController(fileName: string): DecorationController | undefined {
    return decorationControllers.get(fileName);
}

export function unregisterTextEditor(editor: TextEditor) {
    //TODO cleanup in Controller?
    decorationControllers.delete(editor.document.fileName);
}

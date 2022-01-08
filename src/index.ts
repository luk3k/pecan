import {Disposable, languages, TextEditor} from "vscode";
import {DecorationController} from "./DecorationController";
import {CodeLensController} from "./CodeLensController";
import {DefaultCodeLensProvider} from "./DefaultCodeLensProvider";

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
let codeLensControllers: Map<string ,CodeLensController> = new Map<string, CodeLensController>();
let codeLensProviders: Map<string, Disposable> = new Map<string, Disposable>();

export function registerTextEditor(editor: TextEditor): void {
    if(decorationControllers.has(editor.document.fileName)) {
        decorationControllers.get(editor.document.fileName)?.setEditor(editor);
        decorationControllers.get(editor.document.fileName)?.renderTargets();
    } else {
        decorationControllers.set(editor.document.fileName, new DecorationController(editor));
    }

    if(codeLensControllers.has(editor.document.fileName)) {
    } else {
        if(!codeLensProviders.has(editor.document.languageId)) {
            let selector = {
                language: editor.document.languageId,
                scheme: 'file'
            };
            const codeLensProvider: DefaultCodeLensProvider = new DefaultCodeLensProvider();
            const disposable: Disposable = languages.registerCodeLensProvider(selector, codeLensProvider);
            codeLensProviders.set(editor.document.languageId, disposable);
        }
        codeLensControllers.set(editor.document.fileName, new CodeLensController());
    }
}

export function removeAllDecorations(editor: TextEditor) {
    decorationControllers.get(editor.document.fileName)?.removeAllDecorations();
}

export function removeAllCodeLenses(editor: TextEditor) {
    codeLensControllers.get(editor.document.fileName)?.removeAllCodeLenses();
}

export function getDecorationController(fileName: string): DecorationController | undefined {
    return decorationControllers.get(fileName);
}

export function getCodeLensController(fileName: string): CodeLensController | undefined {
    return codeLensControllers.get(fileName);
}

export function unregisterTextEditor(editor: TextEditor) {
    //TODO cleanup in Controller?
    decorationControllers.delete(editor.document.fileName);
}

export function unregisterCodeLensControllers() {
    codeLensProviders.forEach(p => p.dispose());
    codeLensProviders = new Map<string, Disposable>();
    codeLensControllers = new Map<string, CodeLensController>();
}

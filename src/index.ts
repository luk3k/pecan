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

/**
 * Registers a text editor for the controllers. If no controllers exists for the file, new ones are created.
 * Else the controllers are updated. Should be called, when a new editor comes into view in vscode.
 * @param editor the editor which holds the file name
 */
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

/**
 * Helper function to remove all decoration for one editor(file).
 * @param editor the editor which holds the file name
 */
export function removeAllDecorations(editor: TextEditor) {
    decorationControllers.get(editor.document.fileName)?.removeAllDecorations();
}

/**
 * Helper function to remove all codeLenses for one editor(file).
 * @param editor the editor which holds the file name
 */
export function removeAllCodeLenses(editor: TextEditor) {
    codeLensControllers.get(editor.document.fileName)?.removeAllCodeLenses();
}

/**
 * Get the decorationController associated with a file. Returns null if no such Controller exists.
 * @param fileName the filename
 * @return DecorationController The decorationController
 */
export function getDecorationController(fileName: string): DecorationController | undefined {
    return decorationControllers.get(fileName);
}

/**
 * Get the codeLensController associated with a file. Returns null if no such Controller exists.
 * @param fileName the filename
 * @return CodeLensController The codeLensController
 */
export function getCodeLensController(fileName: string): CodeLensController | undefined {
    return codeLensControllers.get(fileName);
}

/**
 * Removes a controllers associated with a specific file. Also reemoves all decorations and codeLenses.
 * @param editor the editor which holds the file name
 */
export function unregisterTextEditor(editor: TextEditor) {
    decorationControllers.get(editor.document.fileName)?.dispose();
    decorationControllers.delete(editor.document.fileName);
    codeLensControllers.delete(editor.document.fileName);
}

/**
 * Removes all controllers. Also disposes of all decorations and codeLenses.
 */
export function unregisterAllTextEditors() {
    for(const fileName of decorationControllers.keys()) {
        decorationControllers.get(fileName)?.dispose();
        decorationControllers.delete(fileName);
    }
    unregisterCodeLensControllers();
}

/**
 * Removes all codeLensControllers and their codeLenses.
 */
export function unregisterCodeLensControllers() {
    codeLensProviders.forEach(p => p.dispose());
    codeLensProviders = new Map<string, Disposable>();
    codeLensControllers = new Map<string, CodeLensController>();
}

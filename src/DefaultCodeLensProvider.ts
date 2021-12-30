import {CodeLens, CodeLensProvider, Event, EventEmitter, TextDocument} from 'vscode';
import {onDidChangeCodeLenses} from './CodeLensController'
import {getCodeLensController} from "./index";

export class DefaultCodeLensProvider implements CodeLensProvider {

    private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
    public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        onDidChangeCodeLenses(() => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
        return getCodeLensController(document.fileName)?.getCodeLenses() ?? [];
    }
}

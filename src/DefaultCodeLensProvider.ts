import {
    CancellationToken,
    CodeLens,
    CodeLensProvider, Command,
    ProviderResult, Range,
    TextDocument,
    TextEditorDecorationType
} from 'vscode';
import {Target} from "./Target";

export class DefaultCodeLensProvider implements CodeLensProvider {

    private codeLenses: CodeLens[] = [];

    async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
        return this.codeLenses;
    }

    attachCodeLens(codeLens: CodeLens): void {
        this.codeLenses.push(codeLens);
    }
}

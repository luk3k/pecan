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

    activeCodelenses: CodeLens[] = [];

    async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
        return this.activeCodelenses;
    }

    attachCodeLens(range: Range, command: Command) {
        let c: CodeLens = new CodeLens(range, command);
        this.activeCodelenses.push(c);
    }

}

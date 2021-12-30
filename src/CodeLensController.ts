import {
    CodeLens,
    Event,
    EventEmitter,
    Range
} from "vscode";

const didChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
export const onDidChangeCodeLenses: Event<void> = didChangeCodeLenses.event;

export class CodeLensController {

    private codeLenses: CodeLens[];

    constructor() {
        this.codeLenses = [];
    }

    addCodeLens(codeLens: CodeLens) {
        this.codeLenses.push(codeLens);
        didChangeCodeLenses.fire();
    }

    removeCodeLens(range: Range) {
        const i: number = this.codeLenses.findIndex((c) => c.range.isEqual(range));
        if(i === -1) return;
        this.codeLenses.splice(i, 1);
        didChangeCodeLenses.fire();
    }

    removeAllCodeLenses() {
        this.codeLenses = [];
        didChangeCodeLenses.fire()
    }

    getCodeLenses() {
        return this.codeLenses;
    }

}

import {Target} from "./Target";
import * as vscode from 'vscode';
import {TextEditor, TextEditorDecorationType} from "vscode";

/**
 * Find all matches to the specified regular expressions. Return the found matches as Target objects
 * @param document the document on which the search should be performed
 * @param regex the regular expression
 * @return Target[] returns an array of matched targets
 */
export function findTargets(document: vscode.TextDocument, regex: string | RegExp): Target[] {
    regex = typeof regex === 'string' ? new RegExp(regex, 'g') : regex;
    regex = regex.global ? regex : new RegExp(regex, 'g');
    const text = document.getText();
    const targets: Target[] = [];
    let matches = text.matchAll(regex);
    for (let m of matches) {
        const line = document.lineAt(document.positionAt(m.index!).line);
        const indexOf = line.text.indexOf(m[0]);
        const startPos = new vscode.Position(line.lineNumber, indexOf);
        const endPos = new vscode.Position(line.lineNumber, indexOf + m[0].length);
        targets.push(new Target(new vscode.Range(startPos, endPos), startPos, endPos, document));
    }
    return targets;
}

export function applyStyle(ranges: vscode.Range[], decorationType: TextEditorDecorationType, editor: TextEditor): void {
    const targets: Target[] = [];
    ranges.forEach(r => {
        r = editor.document.validateRange(r);
        const t: Target = new Target(r, r.start, r.end, editor.document);
        targets.push(t);
    });

    targets.forEach(t => t.applyStyle(decorationType, editor));
}

import {Target} from "./Target";
import * as vscode from 'vscode';

/**
 * Find all matches to the specified regular expressions. Return the found matches as Target objects
 * @param document the document on which the search should be performed
 * @param regex the regular expression
 * @return Target[] returns an array of matched targets
 */
export function findTargets(document: vscode.TextDocument, regex: RegExp): Target[] {
    const text = document.getText();
    const targets: Target[] = [];
    let matches: RegExpExecArray | null;
    while ((matches = regex.exec(text)) !== null) {
        const line = document.lineAt(document.positionAt(matches.index).line);
        const indexOf = line.text.indexOf(matches[0]);
        const startPos = new vscode.Position(line.lineNumber, indexOf);
        const endPos= new vscode.Position(line.lineNumber, indexOf + matches[0].length);
        targets.push(new Target(new vscode.Range(startPos, endPos), startPos, endPos));
    }
    return targets;
}

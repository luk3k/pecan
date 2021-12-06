import * as vscode from 'vscode';

export function convertToRange(pos1: vscode.Position, pos2: vscode.Position): vscode.Range {
    return new vscode.Range(pos1, pos2);
}

export function convertToPosition(line: number, charPos: number): vscode.Position {
    return new vscode.Position(line, charPos);
}

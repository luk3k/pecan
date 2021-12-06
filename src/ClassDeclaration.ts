import {RuleNode} from "antlr4ts/tree";
import {Target} from "./Target";
import * as vscode from 'vscode';

export class ClassDeclaration extends Target {

    constructor(identifier: string, start: vscode.Position, end: vscode.Position, node: RuleNode) {
        super(identifier, start, end, node);
    }
}

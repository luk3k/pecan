import {RuleNode} from "antlr4ts/tree";
import {Target} from "./Target";
import * as vscode from 'vscode';

export class MethodCall extends Target {
    args: string[];

    constructor(identifier: string | undefined, start: vscode.Position , end: vscode.Position, node: RuleNode, args: string[]) {
        super(identifier, start, end, node);
        this.args = args;
    }
}

import {Target} from "./Target";
import {RuleNode} from "antlr4ts/tree";
import * as vscode from 'vscode';

export class Variable extends Target {
    type: any;
    value: any;

    constructor(identifier: string | undefined, start: vscode.Position, end: vscode.Position, node: RuleNode, type: any,
                value: any) {
        super(identifier, start, end, node);
        this.type = type;
        this.value = value;
    }
}

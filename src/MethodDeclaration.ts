import {RuleNode} from "antlr4ts/tree";
import {Target} from "./Target";
import {Variable} from "./Variable";
import * as vscode from 'vscode';

export class MethodDeclaration extends Target {
    className: string;
    returnType: string;
    params: Variable[];

    constructor(identifier: string, start: vscode.Position, end: vscode.Position, node: RuleNode,
                className: string, returnType: string, params: Variable[]) {
        super(identifier, start, end, node);
        this.className = className;
        this.returnType = returnType;
        this.params = params;
    }
}

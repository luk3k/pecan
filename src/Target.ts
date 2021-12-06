import {Interval} from "antlr4ts/misc";
import {RuleNode} from "antlr4ts/tree";
import * as vscode from 'vscode';
import {Position} from "vscode";

/**
 * The Target class is used to represent a target in the editor. E.g. a target could be a class declaration or a
 * method declaration. It is possible to annotate and highlight target objects.
 */
export class Target {
    identifier: string | undefined;
    start: vscode.Position;
    end: vscode.Position;
    node: RuleNode;

    constructor(identifier: string | undefined, start: vscode.Position, end: vscode.Position, node: RuleNode) {
        this.identifier = identifier;
        this.start = start;
        this.end = end;
        this.node = node;
    }
}

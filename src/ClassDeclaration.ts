import {RuleNode} from "antlr4ts/tree";
import {Interval} from "antlr4ts/misc";
import {Target} from "./Target";

export class ClassDeclaration extends Target {

    constructor(identifier: string, range: Interval, line: number, node: RuleNode) {
        super(identifier, range, line, node);
    }
}

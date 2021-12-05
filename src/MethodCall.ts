import {Interval} from "antlr4ts/misc";
import {RuleNode} from "antlr4ts/tree";
import {Target} from "./Target";

export class MethodCall extends Target {

    constructor(identifier: string | undefined, range: Interval, line: number, node: RuleNode) {
        super(identifier, range, line, node);
    }
}

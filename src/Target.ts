import {Interval} from "antlr4ts/misc";
import {RuleNode} from "antlr4ts/tree";

/**
 * The Target class is used to represent a target in the editor. E.g. a target could be a class declaration or a
 * method declaration. It is possible to annotate and highlight target objects.
 */
export class Target {
    identifier: string | undefined;
    range: Interval;
    line: number;
    node: RuleNode;

    constructor(identifier: string | undefined, range: Interval, line: number, node: RuleNode) {
        this.identifier = identifier;
        this.range = range;
        this.line = line;
        this.node = node;
    }
}

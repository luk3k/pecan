import {Python3Listener} from "../parsers/python/Python3Listener";
import {Python3Ast} from "./Ast";
import {TextDocument} from "vscode";
import {ClassdefContext, FuncdefContext} from "../parsers/python/Python3Parser";

/**
 * This call implements the Python3ParserListener and is therefore used to initialize the Ast data structure.
 */
export class Python3AstListener implements Python3Listener {
    ast: Python3Ast;
    document: TextDocument;

    constructor(ast: Python3Ast, document: TextDocument) {
        this.ast = ast;
        this.document = document;
    }

    enterClassdef(ctx: ClassdefContext) {

    }

    enterFuncdef(ctx: FuncdefContext) {

    }
}

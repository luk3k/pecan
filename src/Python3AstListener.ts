import {Python3Listener} from "../parsers/python/Python3Listener";
import {Python3Ast} from "./Ast";
import {Position, Range, TextDocument} from "vscode";
import {
    Async_funcdefContext,
    ClassdefContext,
    FuncdefContext,
    TestContext,
    TfpdefContext, TypedargslistContext
} from "../parsers/python/Python3Parser";
import {ParserRuleContext} from "antlr4ts/ParserRuleContext";
import {Target} from "./Target";
import {TerminalNode} from "antlr4ts/tree/TerminalNode";
import {Variable} from "./Variable";
import {MethodDeclaration} from "./MethodDeclaration";
import {FormalParameterContext} from "../parsers/java/JavaParser";

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
        // collect arguments of method call
        const idRange = this.getIdRange(ctx.NAME()!);

        // get method type
        const typeTarget = ctx.test() ? this.getTargetFromContext(ctx.test()!) : null;

        // collect all params
        let params: Variable[] = [];
        if (ctx.parameters()?.typedargslist()) {
            params = this.getFormalParams(ctx.parameters().typedargslist()!);
        }

        const start = new Position(ctx.start.line - 1, ctx.start.charPositionInLine);
        const stop = ctx.stop ? new Position(ctx.stop!.line - 1, ctx.stop!.charPositionInLine + 1) : start;

        const bodyTarget = this.getTargetFromContext(ctx.suite());

        this.ast.methodDeclarations.push(
            new MethodDeclaration(idRange, start, stop, this.document, null, typeTarget, params, bodyTarget)
        );
    }

    enterAsync_funcdef(ctx: Async_funcdefContext) {

    }

    private getTargetFromContext(ctx: ParserRuleContext): Target {
        const start = new Position(ctx.start.line - 1, ctx.start.charPositionInLine);
        let range = ctx.start.stopIndex - ctx.start.startIndex + 1;
        let stop = new Position(ctx.start.line - 1, ctx.start.charPositionInLine + range);
        if (ctx.stop) {
            range = ctx.stop!.stopIndex - ctx.start.startIndex + 1;
            stop = new Position(ctx.stop!.line - 1, ctx.start.charPositionInLine + range);
        }
        const targetRange = new Range(start, stop);
        return new Target(targetRange, start, stop, this.document);
    }

    private getFormalParams(arglist: TypedargslistContext): Variable[] {
        const params = [];
        const tfpCtx: TfpdefContext[] = arglist.tfpdef();
        for (let i = 0; i < tfpCtx.length; i++) {
            const p = arglist.tfpdef(i);
            const pStart = new Position(p.start.line - 1, p.start.charPositionInLine);
            const pStop = p.stop ? new Position(p.stop!.line - 1, p.stop!.charPositionInLine + 1) : pStart;
            const pidRange = this.getIdRange(p.NAME());
            const type = p.test()? this.getTargetFromContext(p.test()!) : undefined;
            const value = this.getTargetFromContext(arglist.test(i));
            params.push(new Variable(
                pidRange, pStart, pStop, this.document, type, value)
            );
        }
        return params;
    }

    private getIdRange(identifier: TerminalNode): Range {
        const idStart = new Position(identifier.symbol.line - 1, identifier.symbol.charPositionInLine);
        const idStop = new Position(
            identifier.symbol.line - 1,
            identifier.symbol.charPositionInLine + identifier.text.length
        );
        return new Range(idStart, idStop);
    }
}

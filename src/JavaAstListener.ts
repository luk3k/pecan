import {JavaParserListener} from "../parsers/JavaParserListener";
import {ClassDeclarationContext, MethodCallContext, MethodDeclarationContext} from "../parsers/JavaParser";
import {ClassDeclaration} from "./ClassDeclaration";
import {JavaAst} from "./Ast";
import {MethodDeclaration} from "./MethodDeclaration";
import {MethodCall} from "./MethodCall";
import {Variable} from "./Variable";
import {Range, Position} from "vscode";
import {TerminalNode} from "antlr4ts/tree/TerminalNode";

/**
 * This class implements the JavaParserListener and is therefore used to initialize the Ast data structure.
 */
export class JavaAstListener implements JavaParserListener {
    ast: JavaAst;

    constructor(ast: JavaAst) {
        this.ast = ast;
    }

    enterClassDeclaration(ctx: ClassDeclarationContext) {
        const start = new Position(ctx.start.line - 1, ctx.start.charPositionInLine);
        const stop = ctx.stop ? new Position(ctx.stop!.line - 1, ctx.stop!.charPositionInLine) : start;
        const idRange = JavaAstListener.getIdRange(ctx.IDENTIFIER());

        this.ast.classDeclarations.push(
            new ClassDeclaration(idRange, start, stop)
        );
    }

    enterMethodDeclaration(ctx: MethodDeclarationContext) {
        console.log(ctx.IDENTIFIER().text, ctx.IDENTIFIER().symbol.charPositionInLine, ctx.IDENTIFIER().symbol.line);
        const idRange = JavaAstListener.getIdRange(ctx.IDENTIFIER());

        // get class of method
        const c: ClassDeclarationContext = ctx.parent?.parent?.parent?.parent as ClassDeclarationContext;
        const className = c.IDENTIFIER().text

        // get method type
        const type = ctx.typeTypeOrVoid().text;

        const start = new Position(ctx.start.line - 1, ctx.start.charPositionInLine);
        const stop = ctx.stop ? new Position(ctx.stop!.line - 1, ctx.stop!.charPositionInLine) : start;

        // collect param types and param names of method declaration
        const params = [];
        if (ctx.formalParameters().formalParameterList()) {
            for (let p of ctx.formalParameters().formalParameterList()!.formalParameter()) {
                const pStart = new Position(p.start.line - 1, p.start.charPositionInLine);
                const pStop = p.stop ? new Position(p.stop!.line - 1, p.stop!.charPositionInLine) : pStart;
                const pidRange = JavaAstListener.getIdRange(p.variableDeclaratorId().IDENTIFIER());
                params.push(new Variable(
                    pidRange, pStart, pStop, p.typeType().text, undefined)
                );
            }
        }

        this.ast.methodDeclarations.push(
            new MethodDeclaration(
                idRange, start, stop, className, type, params
            )
        );
    }

    enterMethodCall(ctx: MethodCallContext) {
        // collect arguments of method call
        const args = [];
        if (ctx.expressionList()) {
            for (let exp of ctx.expressionList()!.expression()) {
                args.push(exp.text);
            }
        }

        const start = new Position(ctx.start.line - 1, ctx.start.charPositionInLine);
        const stop = ctx.stop ? new Position(ctx.stop!.line - 1, ctx.stop!.charPositionInLine) : start;
        const idRange = ctx.IDENTIFIER() ? JavaAstListener.getIdRange(ctx.IDENTIFIER()!) : undefined;

        this.ast.methodCalls.push(
            new MethodCall(idRange, start, stop, args)
        );
    }

    private static getIdRange(identifier: TerminalNode): Range {
        const idStart = new Position(identifier.symbol.line - 1, identifier.symbol.charPositionInLine);
        const idStop = new Position(
            identifier.symbol.line - 1,
            identifier.symbol.charPositionInLine + identifier.text.length
        );
        return new Range(idStart, idStop);
    }
}

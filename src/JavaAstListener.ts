import {JavaParserListener} from "../parsers/JavaParserListener";
import {ClassDeclarationContext, MethodCallContext, MethodDeclarationContext} from "../parsers/JavaParser";
import {ClassDeclaration} from "./ClassDeclaration";
import {JavaAst} from "./Ast";
import {MethodDeclaration} from "./MethodDeclaration";
import {MethodCall} from "./MethodCall";
import {Variable} from "./Variable";
import {Range, Position, TextDocument} from "vscode";
import {TerminalNode} from "antlr4ts/tree/TerminalNode";
import {ParserRuleContext} from "antlr4ts/ParserRuleContext";
import {Target} from "./Target";

/**
 * This class implements the JavaParserListener and is therefore used to initialize the Ast data structure.
 */
export class JavaAstListener implements JavaParserListener {
    ast: JavaAst;
    document: TextDocument;

    constructor(ast: JavaAst, document: TextDocument) {
        this.ast = ast;
        this.document = document;
    }

    enterClassDeclaration(ctx: ClassDeclarationContext) {
        const start = new Position(ctx.start.line - 1, ctx.start.charPositionInLine);
        const stop = ctx.stop ? new Position(ctx.stop!.line - 1, ctx.stop!.charPositionInLine) : start;
        const idRange = JavaAstListener.getIdRange(ctx.IDENTIFIER());

        this.ast.classDeclarations.push(
            new ClassDeclaration(idRange, start, stop, this.document)
        );
    }

    enterMethodDeclaration(ctx: MethodDeclarationContext) {
        const idRange = JavaAstListener.getIdRange(ctx.IDENTIFIER());

        // get class of method
        const c: ClassDeclarationContext = ctx.parent?.parent?.parent?.parent as ClassDeclarationContext;
        const className = c.IDENTIFIER().text

        // get method type
        const typeStart = new Position(
            ctx.typeTypeOrVoid().start.line - 1,
            ctx.typeTypeOrVoid().start.charPositionInLine
        );
        const typeStop = new Position(
            ctx.typeTypeOrVoid().start.line - 1,
            ctx.typeTypeOrVoid().start.charPositionInLine + ctx.typeTypeOrVoid().text.length
        );
        const typeTarget = new Target(new Range(typeStart, typeStop), typeStart, typeStop, this.document);

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
                    pidRange, pStart, pStop, this.document, this.getTargetFromContext(p.typeType()), undefined)
                );
            }
        }

        // save the method body as targets
        let bodyTarget = this.getTargetFromContext(ctx.methodBody());
        if (ctx.methodBody().block()) {
            const blockList = ctx.methodBody().block()!.blockStatement();
            const bodyStart = new Position(blockList[0].start.line - 1, blockList[0].start.charPositionInLine);
            const bodyStop = blockList[blockList.length - 1].stop ?
                new Position(
                    blockList[blockList.length - 1].stop!.line,
                    blockList[blockList.length - 1].stop!.charPositionInLine
                ) :
                new Position(
                    blockList[blockList.length - 1].start.line - 1,
                blockList[blockList.length - 1].start.charPositionInLine + blockList[blockList.length - 1].text.length
            );
            bodyTarget = new Target(new Range(bodyStart, bodyStop), bodyStart, bodyStop, this.document);
        }

        this.ast.methodDeclarations.push(
            new MethodDeclaration(
                idRange, start, stop, this.document, className, typeTarget, params, bodyTarget
            )
        );
    }

    enterMethodCall(ctx: MethodCallContext) {
        // collect arguments of method call
        const args = [];
        if (ctx.expressionList()) {
            for (let exp of ctx.expressionList()!.expression()) {
                let argTarget = this.getTargetFromContext(exp);
                args.push(argTarget);
            }
        }

        const start = new Position(ctx.start.line - 1, ctx.start.charPositionInLine);
        const stop = ctx.stop ? new Position(ctx.stop!.line - 1, ctx.stop!.charPositionInLine) : start;
        const idRange = ctx.IDENTIFIER() ? JavaAstListener.getIdRange(ctx.IDENTIFIER()!) : undefined;

        this.ast.methodCalls.push(
            new MethodCall(idRange, start, stop, this.document, args)
        );
    }

    private getTargetFromContext(ctx: ParserRuleContext): Target {
        const start = new Position(ctx.start.line - 1, ctx.start.charPositionInLine);
        const stop = ctx.stop ?
            new Position(ctx.stop!.line - 1, ctx.stop!.charPositionInLine) :
            new Position(ctx.start.line - 1, ctx.start.charPositionInLine + ctx.text.length);
        const targetRange = new Range(start, stop);
        return new Target(targetRange, start, stop, this.document);
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

import {JavaParserListener} from "../parsers/JavaParserListener";
import {ClassDeclarationContext, MethodCallContext, MethodDeclarationContext} from "../parsers/JavaParser";
import {ClassDeclaration} from "./ClassDeclaration";
import {JavaAst} from "./Ast";
import {MethodDeclaration} from "./MethodDeclaration";
import {MethodCall} from "./MethodCall";
import {Variable} from "./Variable";
import {convertToPosition} from "./Util";

/**
 * This class implements the JavaParserListener and is therefore used to initialize the Ast data structure.
 */
export class JavaAstListener implements JavaParserListener {
    ast: JavaAst;

    constructor(ast: JavaAst) {
        this.ast = ast;
    }

    enterClassDeclaration(ctx: ClassDeclarationContext) {
        const start = convertToPosition(ctx.start.line, ctx.start.charPositionInLine);
        const stop = ctx.stop ? convertToPosition(ctx.stop!.line, ctx.stop!.charPositionInLine) : start;
        this.ast.classDeclarations.push(
            new ClassDeclaration(ctx.IDENTIFIER().text, start, stop, ctx)
        );
    }

    enterMethodDeclaration(ctx: MethodDeclarationContext) {
        // get class of method
        const c: ClassDeclarationContext = ctx.parent?.parent?.parent?.parent as ClassDeclarationContext;
        const className = c.IDENTIFIER().text

        // get method type
        const type = ctx.typeTypeOrVoid().text;

        const start = convertToPosition(ctx.start.line, ctx.start.charPositionInLine);
        const stop = ctx.stop ? convertToPosition(ctx.stop!.line, ctx.stop!.charPositionInLine) : start;

        // collect param types and param names of method declaration
        const params = [];
        if (ctx.formalParameters().formalParameterList()) {
            for (let p of ctx.formalParameters().formalParameterList()!.formalParameter()) {
                const pStart = convertToPosition(p.start.line, p.start.charPositionInLine);
                const pStop = p.stop ? convertToPosition(p.stop!.line, p.stop!.charPositionInLine) : pStart;
                params.push(new Variable(
                    p.variableDeclaratorId().text, pStart, pStop, p, p.typeType().text, undefined)
                );
            }
        }

        this.ast.methodDeclarations.push(
            new MethodDeclaration(
                ctx.IDENTIFIER().text, start, stop, ctx, className, type, params
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

        const start = convertToPosition(ctx.start.line, ctx.start.charPositionInLine);
        const stop = ctx.stop ? convertToPosition(ctx.stop!.line, ctx.stop!.charPositionInLine) : start;

        this.ast.methodCalls.push(
            new MethodCall(ctx.IDENTIFIER()?.text, start, stop, ctx, args)
        );
    }
}

import {JavaParserListener} from "../parsers/JavaParserListener";
import {ClassDeclarationContext, MethodCallContext, MethodDeclarationContext} from "../parsers/JavaParser";
import {ClassDeclaration} from "./ClassDeclaration";
import {JavaAst} from "./Ast";
import {MethodDeclaration} from "./MethodDeclaration";
import {MethodCall} from "./MethodCall";

/**
 * This class implements the JavaParserListener and is therefore used to initialize the Ast data structure.
 */
export class JavaAstListener implements JavaParserListener {
    ast: JavaAst;

    constructor(ast: JavaAst) {
        this.ast = ast;
    }

    enterClassDeclaration(ctx: ClassDeclarationContext) {
        this.ast.classDeclarations.push(
            new ClassDeclaration(ctx.IDENTIFIER().text, ctx.sourceInterval, ctx.start.line, ctx)
        );
    }

    enterMethodDeclaration(ctx: MethodDeclarationContext) {
        let className: ClassDeclarationContext = ctx.parent?.parent?.parent?.parent as ClassDeclarationContext;
        console.log(className.sourceInterval);
        this.ast.methodDeclarations.push(
            new MethodDeclaration(ctx.IDENTIFIER().text, ctx.sourceInterval, ctx.start.line, ctx)
        );
    }

    enterMethodCall(ctx: MethodCallContext) {
        this.ast.methodCalls.push(
            new MethodCall(ctx.IDENTIFIER()?.text, ctx.sourceInterval, ctx.start.line, ctx)
        );
    }
}

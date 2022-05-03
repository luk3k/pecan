import {JavaParserListener} from "../parsers/java/JavaParserListener";
import {
    ClassDeclarationContext, ConstructorDeclarationContext, FieldDeclarationContext, FormalParameterContext,
    MethodCallContext,
    MethodDeclarationContext,
} from "../parsers/java/JavaParser";
import {ClassDeclaration} from "./ClassDeclaration";
import {JavaAst} from "./Ast";
import {MethodDeclaration} from "./MethodDeclaration";
import {MethodCall} from "./MethodCall";
import {Variable} from "./Variable";
import {Range, Position, TextDocument} from "vscode";
import {TerminalNode} from "antlr4ts/tree/TerminalNode";
import {ParserRuleContext} from "antlr4ts/ParserRuleContext";
import {Target} from "./Target";
import {ConstructorDeclaration} from "./ConstructorDeclaration";

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
        const classDeclaration = this.getClassDeclaration(ctx);
        classDeclaration.methodDeclarations.forEach(m => {
           m.classDeclaration = classDeclaration;
        });
        classDeclaration.constructorDeclarations.forEach(c => {
            c.classDeclaration = classDeclaration;
        });
        this.ast.classDeclarations.push(classDeclaration);
    }

    enterMethodDeclaration(ctx: MethodDeclarationContext) {
        this.ast.methodDeclarations.push(this.getMethodDeclaration(ctx));
    }

    enterMethodCall(ctx: MethodCallContext) {
        // collect arguments of method call
        const args = [];
        if (ctx.expressionList()) {
            for (let exp of ctx.expressionList()!.expression()) {
                const argTarget = this.getTargetFromContext(exp);
                args.push(argTarget);
            }
        }

        const start = new Position(ctx.start.line - 1, ctx.start.charPositionInLine);
        const stop = ctx.stop ? new Position(ctx.stop!.line - 1, ctx.stop!.charPositionInLine + 1) : start;
        const idRange = ctx.IDENTIFIER() ? this.getIdRange(ctx.IDENTIFIER()!) : undefined;

        this.ast.methodCalls.push(
            new MethodCall(idRange, start, stop, this.document, args)
        );
    }

    /**
     * Get a target from a ParserRuleContext. This method converts the ParserRuleContext to our target objects.
     * @param ctx the context of the parser
     * @return Target the target object
     */
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

    /**
     * Get a ClassDeclaration from a ClassDeclarationContext. This method also takes care of parsing all the
     * member variables and methods contained in the given class including constructors.
     * @param ctx the context of the parser
     * @return ClassDeclaration the class declaration object
     */
    private getClassDeclaration(ctx: ClassDeclarationContext): ClassDeclaration {
        const start = new Position(ctx.start.line - 1, ctx.start.charPositionInLine);
        const stop = ctx.stop ? new Position(ctx.stop!.line - 1, ctx.stop!.charPositionInLine + 1) : start;
        const idRange = this.getIdRange(ctx.IDENTIFIER());

        // add type parameters
        const typeParams = [];
        if (ctx.typeParameters()) {
            for (let tp of ctx.typeParameters()!.typeParameter()) {
                const tpStart = new Position(tp.start.line - 1, tp.start.charPositionInLine);
                const tpStop = tp.stop ?
                    new Position(tp.stop!.line - 1, tp.stop!.charPositionInLine + 1) : tpStart;
                const tpIdRange = this.getIdRange(tp.IDENTIFIER());
                const tpTarget = new Target(tpIdRange, tpStart, tpStop, this.document);
                typeParams.push(tpTarget);
            }
        }

        const superClass = ctx.typeType() ? [this.getTargetFromContext(ctx.typeType()!)] : [];

        // add interfaces
        const interfaces = [];
        if (ctx.typeList()) {
            for (let i of ctx.typeList()!.typeType()) {
                interfaces.push(this.getTargetFromContext(i));
            }
        }

        const classBody = this.getTargetFromContext(ctx.classBody());

        let fields: Variable[][] = [];
        const methodDeclarations = [];
        const constructorDeclarations = [];
        for (let cd of ctx.classBody().classBodyDeclaration()) {
            const member = cd.memberDeclaration();
            if (member?.fieldDeclaration()) {
                fields.push(this.getFieldDeclaration(member!.fieldDeclaration()!));
            } else if (member?.methodDeclaration()) {
                methodDeclarations.push(this.getMethodDeclaration(member!.methodDeclaration()!));
            } else if (member?.constructorDeclaration()) {
                const c = member!.constructorDeclaration()!;
                constructorDeclarations.push(this.getConstructorDeclaration(c));
            }
        }

        return new ClassDeclaration(
            idRange, start, stop, this.document, typeParams, superClass, interfaces, classBody, constructorDeclarations,
            fields.reduce((acc, val) => acc.concat(val), []), methodDeclarations
        );
    }

    /**
     * Get a ClassDeclaration from a ClassDeclarationContext.
     * @param ctx the context of the parser
     * @return ConstructorDeclaration the constructor declaration object
     */
    private getConstructorDeclaration(ctx: ConstructorDeclarationContext): ConstructorDeclaration {
        const cidRange = this.getIdRange(ctx.IDENTIFIER());
        const cStart = new Position(ctx.start.line - 1, ctx.start.charPositionInLine);
        const cStop = ctx.stop ? new Position(ctx.stop!.line - 1, ctx.stop!.charPositionInLine + 1) : cStart;
        let cParams: Variable[] = []
        if (ctx.formalParameters().formalParameterList()) {
            cParams = this.getFormalParams(ctx.formalParameters().formalParameterList()!.formalParameter());
        }
        const body = this.getTargetFromContext(ctx.block());

        return new ConstructorDeclaration(cidRange, cStart, cStop, this.document, null, cParams, body);
    }

    /**
     * Get a MethodDeclaration from a MethodDeclarationContext. Note that also the parameters of the method are parsed.
     * @param ctx the context of the parser
     * @return MethodDeclaration the method declaration object
     */
    private getMethodDeclaration(ctx: MethodDeclarationContext): MethodDeclaration {
        const idRange = this.getIdRange(ctx.IDENTIFIER());

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
        const stop = ctx.stop ? new Position(ctx.stop!.line - 1, ctx.stop!.charPositionInLine + 1) : start;

        // collect param types and param names of method declaration
        let params: Variable[] = [];
        if (ctx.formalParameters().formalParameterList()) {
            params = this.getFormalParams(ctx.formalParameters().formalParameterList()!.formalParameter());
        }

        let bodyTarget = this.getTargetFromContext(ctx.methodBody());

        return new MethodDeclaration(idRange, start, stop, this.document, null, typeTarget, params, bodyTarget);
    }

    /**
     * Parse the formal parameters of a function.
     * @param ctx the context of the parser
     * @return Variable array containing all formal parameters if they exist.
     */
    private getFormalParams(ctx: FormalParameterContext[]): Variable[] {
        const params = [];
        for (let p of ctx) {
            const pStart = new Position(p.start.line - 1, p.start.charPositionInLine);
            const pStop = p.stop ? new Position(p.stop!.line - 1, p.stop!.charPositionInLine + 1) : pStart;
            const pidRange = this.getIdRange(p.variableDeclaratorId().IDENTIFIER());
            params.push(new Variable(
                pidRange, pStart, pStop, this.document, this.getTargetFromContext(p.typeType()), undefined)
            );
        }
        return params;
    }

    /**
     * Get all FieldDeclarations from the specified context.
     * @param ctx the context of the parser
     * @return Variable array containing all field variables
     */
    private getFieldDeclaration(ctx: FieldDeclarationContext): Variable[] {
        const vars: Variable[] = []
        const type = this.getTargetFromContext(ctx.typeType());
        for (let fd of ctx.variableDeclarators().variableDeclarator()) {
            const idRange = this.getIdRange(fd.variableDeclaratorId().IDENTIFIER());
            const start = new Position(fd.start.line - 1, fd.start.charPositionInLine);
            const stop = fd.stop ? new Position(fd.stop!.line - 1, fd.stop!.charPositionInLine + 1) : start;
            const val = fd.variableInitializer() ? this.getTargetFromContext(fd.variableInitializer()!) : undefined;
            vars.push(new Variable(idRange, start, stop, this.document, type, val));
        }
        return vars;
    }

    /**
     * Get the VSCode Range object for a given identifier.
     * @param identifier the parser's terminal node
     * @return Range the VSCode Range object
     */
    private getIdRange(identifier: TerminalNode): Range {
        const idStart = new Position(identifier.symbol.line - 1, identifier.symbol.charPositionInLine);
        const idStop = new Position(
            identifier.symbol.line - 1,
            identifier.symbol.charPositionInLine + identifier.text.length
        );
        return new Range(idStart, idStop);
    }
}

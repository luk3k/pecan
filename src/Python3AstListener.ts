import {Python3Listener} from "../parsers/python/Python3Listener";
import {Python3Ast} from "./Ast";
import {Position, Range, TextDocument} from "vscode";
import {
    Async_funcdefContext, Atom_exprContext,
    ClassdefContext, Compound_stmtContext,
    FuncdefContext, Simple_stmtContext,
    TfpdefContext, TypedargslistContext
} from "../parsers/python/Python3Parser";
import {ParserRuleContext} from "antlr4ts/ParserRuleContext";
import {Target} from "./Target";
import {TerminalNode} from "antlr4ts/tree/TerminalNode";
import {Variable} from "./Variable";
import {MethodDeclaration} from "./MethodDeclaration";
import {ClassDeclaration} from "./ClassDeclaration";
import {ConstructorDeclaration} from "./ConstructorDeclaration";
import {MethodCall} from "./MethodCall";

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
        const classDeclaration = this.getClassDeclaration(ctx);
        classDeclaration.methodDeclarations.forEach(m => {
            m.classDeclaration = classDeclaration;
        });
        classDeclaration.constructorDeclarations.forEach(c => {
            c.classDeclaration = classDeclaration;
        });
        this.ast.classDeclarations.push(classDeclaration);
    }

    enterAtom_expr(ctx: Atom_exprContext) {
        if (ctx.atom().NAME() && ctx.trailer().length !== 0) {
            let identifier: Range | undefined = this.getIdRange(ctx.atom().NAME()!);
            for (let t of ctx.trailer()) {
                if(t.NAME()) {
                    identifier = this.getIdRange(t.NAME()!);
                } else if(t.OPEN_PAREN() && t.CLOSE_PAREN() && identifier) {
                    const start = identifier.start;
                    const stop = t.stop ? new Position(t.stop!.line - 1, t.stop!.charPositionInLine + 1) : identifier.end;

                    const args: Target[] = [];
                    const argList = t.arglist()?.argument() ?? [];
                    for (let arg of argList) {
                        args.push(this.getTargetFromContext(arg));
                    }
                    this.ast.methodCalls.push(new MethodCall(identifier, start, stop, this.document, args));
                    identifier = undefined;
                }
            }
        }
    }

    enterFuncdef(ctx: FuncdefContext) {
        if (ctx.NAME().text !== '__init__') {
            this.ast.methodDeclarations.push(this.getFunc(ctx));
        }
    }

    enterAsync_funcdef(ctx: Async_funcdefContext) {
        if (ctx.funcdef().NAME().text !== '__init__') {
            this.ast.methodDeclarations.push(this.getFunc(ctx.funcdef()));
        }
    }

    /**
     * Get a ClassDeclaration from a ClassDeclarationContext. This method also takes care of parsing all the
     * member variables and methods contained in the given class including constructors.
     * @param ctx the context of the parser
     * @return ClassDeclaration the class declaration object
     */
    private getClassDeclaration(ctx: ClassdefContext): ClassDeclaration {
        const classBody = this.getTargetFromContext(ctx.suite());

        const start = new Position(ctx.start.line - 1, ctx.start.charPositionInLine);
        const stop = classBody.end;
        const idRange = this.getIdRange(ctx.NAME());

        // add superclasses
        const superClasses: Target[] = [];
        const argList = ctx.arglist()?.argument() ?? [];
        for(let arg of argList) {
            superClasses.push(this.getTargetFromContext(arg))
        }

        const fields: Variable[] = [];
        const methodDeclarations: MethodDeclaration[] = [];
        const constructorDeclarations: ConstructorDeclaration[] = [];
        for (let stmt of ctx.suite().stmt()) {
            if (stmt.simple_stmt()) {
                const field = this.getSimpleStmt(stmt.simple_stmt()!)
                if(field && !field?.getText().startsWith('"')) {
                    fields.push(field);
                }
            } else if (stmt.compound_stmt()) {
                const funcDef = this.getCompoundStmt(stmt.compound_stmt()!);
                if (funcDef) {
                    if (funcDef.getIdentifierText() === '__init__') {
                        constructorDeclarations.push(new ConstructorDeclaration(
                            funcDef.identifier!, funcDef.start, funcDef.end, this.document, null,
                            funcDef.params, funcDef.methodBody)
                        );
                    } else {
                        methodDeclarations.push(funcDef);
                    }
                }
            }
        }

        return new ClassDeclaration(
            idRange, start, stop, this.document, [], superClasses, [], classBody, constructorDeclarations,
            fields, methodDeclarations
        );
    }

    /**
     * This method takes the Compound_stmtContext from the parser and transforms it to a MethodDeclaration.
     * This is needed to be able to parse async as well as normal functions. Note that we do not differentiate between
     * the them.
     * @param ctx the context of the parser
     * @return MethodDeclaration if the compound statement was a function definition or null otherwise
     */
    private getCompoundStmt(ctx: Compound_stmtContext): MethodDeclaration | null {
        if(ctx.funcdef()) {
            return this.getFunc(ctx.funcdef()!)
        } else if (ctx.async_stmt()?.funcdef()) {
            this.getFunc(ctx.async_stmt()?.funcdef()!)
        }
        return null;
    }

    /**
     * Get a Variable from the Simple_stmtContext.
     * @param ctx the context of the parser
     * @return Variable if the Simple_stmtContext contained a variable or null otherwise
     */
    private getSimpleStmt(ctx: Simple_stmtContext): Variable | null {
        if(ctx.small_stmt()[0].expr_stmt()) {
            const stmt = ctx.small_stmt()[0].expr_stmt()!;
            const idRange = this.getTargetFromContext(stmt.testlist_star_expr()[0]).identifier;
            const start = new Position(stmt.start.line - 1, stmt.start.charPositionInLine);
            const stop = stmt.stop ? new Position(stmt.stop!.line - 1, stmt.stop!.charPositionInLine + 1) : start;

            let type;
            let val;
            if(stmt.annassign()) {
                type = this.getTargetFromContext(stmt.annassign()!.test()[0]);
                val = stmt.annassign()!.test()[1] ? this.getTargetFromContext(stmt.annassign()!.test()[1]) : undefined;
            } else {
                val = stmt.testlist_star_expr()[1] ? this.getTargetFromContext(stmt.testlist_star_expr()[1]) : undefined;
            }

            return new Variable(idRange, start, stop, this.document, type, val);
        }

        return null;
    }

    /**
     * Get a MethodDeclaration from a MethodDeclarationContext. Note that also the parameters of the method are parsed.
     * @param ctx the context of the parser
     * @return MethodDeclaration the method declaration object
     */
    private getFunc(ctx: FuncdefContext): MethodDeclaration {
        // collect arguments of method call
        const idRange = this.getIdRange(ctx.NAME());

        // get method type
        const typeTarget = ctx.test() ? this.getTargetFromContext(ctx.test()!) : null;

        // collect all params
        let params: Variable[] = [];
        if (ctx.parameters()?.typedargslist()) {
            params = this.getFormalParams(ctx.parameters().typedargslist()!);
        }

        const bodyTarget = this.getTargetFromContext(ctx.suite());

        const start = new Position(ctx.start.line - 1, ctx.start.charPositionInLine);
        const stop = bodyTarget.end;

        return new MethodDeclaration(idRange, start, stop, this.document, null, typeTarget, params, bodyTarget);
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
     * Parse the formal parameters of a function.
     * @param arglist the context of the parser
     * @return Variable array containing all formal parameters if they exist.
     */
    private getFormalParams(arglist: TypedargslistContext): Variable[] {
        const params = [];
        const tfpCtx: TfpdefContext[] = arglist.tfpdef();
        for (let i = 0; i < tfpCtx.length; i++) {
            const p = arglist.tfpdef(i);
            const pStart = new Position(p.start.line - 1, p.start.charPositionInLine);
            const pStop = p.stop ? new Position(p.stop!.line - 1, p.stop!.charPositionInLine + 1) : pStart;
            const pidRange = this.getIdRange(p.NAME());
            const type = p.test()? this.getTargetFromContext(p.test()!) : undefined;

            // get default value if there is any
            let value = undefined;
            for (let v of arglist.test()) {
                if (i+1 < tfpCtx.length) {
                    const nextP = arglist.tfpdef(i+1);
                    if (v.start.startIndex > p.start.startIndex && v.start.startIndex < nextP.start.startIndex) {
                        value = this.getTargetFromContext(v);
                    }
                } else if (v.start.startIndex > p.start.startIndex) {
                    value = this.getTargetFromContext(v);
                }
            }

            params.push(new Variable(
                pidRange, pStart, pStop, this.document, type, value)
            );
        }
        return params;
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

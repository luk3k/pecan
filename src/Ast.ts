import {MethodDeclaration} from "./MethodDeclaration";
import {ParseTreeWalker} from "antlr4ts/tree";
import {CharStreams, CommonTokenStream} from "antlr4ts";
import {JavaLexer} from "../parsers/java/JavaLexer";
import {JavaParser} from "../parsers/java/JavaParser";
import {JavaAstListener} from "./JavaAstListener";
import {JavaParserListener} from "../parsers/java/JavaParserListener";
import {ClassDeclaration} from "./ClassDeclaration";
import {MethodCall} from "./MethodCall";
import {TextDocument} from "vscode";
import {Python3Lexer} from "../parsers/python/Python3Lexer";
import {Python3Parser} from "../parsers/python/Python3Parser";
import {Python3AstListener} from "./Python3AstListener";
import {Python3Listener} from "../parsers/python/Python3Listener";
import {AbortController} from "abort-controller"

interface Ast {
    document: TextDocument;
    classDeclarations: ClassDeclaration[];
    methodDeclarations: MethodDeclaration[];
    methodCalls: MethodCall[];
}

export class JavaAst implements Ast {
    document: TextDocument;
    private abortController: AbortController;
    classDeclarations: ClassDeclaration[] = [];
    methodDeclarations: MethodDeclaration[] = [];
    methodCalls: MethodCall[] = [];

    /**
     * Initialize the ParseTree object for a given file
     * @param document the vscode document which also includes the text
     */
    constructor(document: TextDocument) {
        this.document = document;
        this.abortController = new AbortController();
    }

    /**
     * Abort parsing the tree
     */
    abortParse() {
        this.abortController.abort();
    }

    /**
     * Initialize this classes. This means walking the parse tree using a custom listener and collecting
     * the relevant data accordingly.
     * @param doc current text document
     */
    parse(doc: TextDocument): Promise<void> {
        this.resetAst(doc);
        return new Promise((resolve, reject) => {
            this.abortController.signal.addEventListener('abort', () => {
                console.log('abort signal received');
                reject(new Error('abort error'));
            }, {once: true});

            const source = doc.getText();
            const chars = CharStreams.fromString(source);
            const lexer = new JavaLexer(chars);
            const tokens = new CommonTokenStream(lexer);
            const parser = new JavaParser(tokens);
            const tree = parser.compilationUnit();

            const astListener: JavaParserListener = new JavaAstListener(this, this.document);
            ParseTreeWalker.DEFAULT.walk(astListener, tree);
            this.setClassDeclarationsForMethods();
            console.log('resolved\n');
            resolve();
        });
    }

    /**
     * Reset all fields for this ast.
     * @param doc current text document
     * @private
     */
    private resetAst(doc: TextDocument) {
        this.abortController = new AbortController();
        this.classDeclarations = [];
        this.methodCalls = [];
        this.methodDeclarations = [];
        this.document = doc;
    }

    private setClassDeclarationsForMethods() {
        for (let c of this.classDeclarations) {
            let filtered = this.methodDeclarations.filter(m => {
                for (let cm of c.methodDeclarations) {
                    if (cm.isEqual(m)) {
                        return true;
                    }
                }
                return false;
            });
            filtered.forEach(m => {
                m.classDeclaration = c;
            });
        }
    }
}

export class Python3Ast implements Ast {
    document: TextDocument;
    private abortController;
    classDeclarations: ClassDeclaration[] = [];
    methodDeclarations: MethodDeclaration[] = [];
    methodCalls: MethodCall[] = [];

    /**
     * Initialize the ParseTree object for a given fil
     * @param document the vscode document which also includes the text
     */
    constructor(document: TextDocument) {
        this.document = document;
        this.abortController = new AbortController();
    }

    /**
     * Abort parsing the tree
     */
    abortParse() {
        if (!this.abortController.signal.aborted) {
            this.abortController.abort();
        }
    }

    /**
     * * Initialize this classes. This means walking the parse tree using a custom listener and collecting
     * the relevant data accordingly.
     * @param doc current text document
     */
    parse(doc: TextDocument): Promise<void> {
        this.resetAst(doc);
        return new Promise((resolve, reject) => {
            this.abortController.signal.addEventListener('abort', () => {
                console.log('abort signal received');
                reject(new Error('abort error'));
            }, {once: true});

            const source = doc.getText();
            const chars = CharStreams.fromString(source);
            const lexer = new Python3Lexer(chars);
            const tokens = new CommonTokenStream(lexer);
            const parser = new Python3Parser(tokens);
            const tree = parser.file_input();

            const astListener: Python3Listener = new Python3AstListener(this, this.document);
            ParseTreeWalker.DEFAULT.walk(astListener, tree);
            this.setClassDeclarationsForMethods();
            console.log('resolved\n');
            resolve();
        });
    }

    /**
     * Reset all fields for this ast.
     * @param doc current text document
     * @private
     */
    private resetAst(doc: TextDocument) {
        this.abortController = new AbortController();
        this.classDeclarations = [];
        this.methodCalls = [];
        this.methodDeclarations = [];
        this.document = doc;
    }

    private setClassDeclarationsForMethods() {
        for (let c of this.classDeclarations) {
            let filtered = this.methodDeclarations.filter(m => {
                for (let cm of c.methodDeclarations) {
                    if (cm.isEqual(m)) {
                        return true;
                    }
                }
                return false;
            });
            filtered.forEach(m => {
                m.classDeclaration = c;
            });
        }
    }
}

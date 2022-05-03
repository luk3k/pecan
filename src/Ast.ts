import {MethodDeclaration} from "./MethodDeclaration";
import {ParseTree, ParseTreeWalker} from "antlr4ts/tree";
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

interface Ast {
    readonly tree: ParseTree;
    readonly document: TextDocument;
    classDeclarations: ClassDeclaration[];
    methodDeclarations: MethodDeclaration[];
    methodCalls: MethodCall[];
}

/**
 * This class represent the abstract syntax tree for the java language.
 */
export class JavaAst implements Ast {
    readonly tree: ParseTree;
    readonly document: TextDocument;
    classDeclarations: ClassDeclaration[] = [];
    methodDeclarations: MethodDeclaration[] = [];
    methodCalls: MethodCall[] = [];

    /**
     * Initialize the ParseTree object for a given fil
     * @param document the vscode document which also includes the text
     */
    constructor(document: TextDocument) {
        this.document = document;
        this.tree = this.parse(document.getText());
        this.init();
    }

    /**
     * Parse the file from the given path and return
     * @param source the source code to be parsed
     * @return ParseTree of the current file
     */
    parse(source: string): ParseTree {
        const chars = CharStreams.fromString(source);
        const lexer = new JavaLexer(chars);
        const tokens = new CommonTokenStream(lexer);
        const parser = new JavaParser(tokens);
        return parser.compilationUnit();
    }

    /**
     * Initialize this classes. This means walking the parse tree using a custom listener and collecting
     * the relevant data accordingly.
     */
    init() {
        const astListener: JavaParserListener = new JavaAstListener(this, this.document);
        ParseTreeWalker.DEFAULT.walk(astListener, this.tree);
        this.setClassDeclarationsForMethods();
    }

    /**
     * Set the correct class for each method declaration in this AST.
     * @private
     */
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


/**
 * This class represent the abstract syntax tree for the python language.
 */
export class Python3Ast implements Ast {
    readonly tree: ParseTree;
    readonly document: TextDocument;
    classDeclarations: ClassDeclaration[] = [];
    methodDeclarations: MethodDeclaration[] = [];
    methodCalls: MethodCall[] = [];

    /**
     * Initialize the ParseTree object for a given fil
     * @param document the vscode document which also includes the text
     */
    constructor(document: TextDocument) {
        this.document = document;
        this.tree = this.parse(document.getText());
        this.init();
    }

    /**
     * Parse the file from the given path and return
     * @param source the source code to be parsed
     * @return ParseTree of the current file
     */
    parse(source: string) {
        const chars = CharStreams.fromString(source);
        const lexer = new Python3Lexer(chars);
        const tokens = new CommonTokenStream(lexer);
        const parser = new Python3Parser(tokens);
        return parser.file_input();
    }

    /**
     * Initialize this classes. This means walking the parse tree using a custom listener and collecting
     * the relevant data accordingly.
     */
    init() {
        const python3Listener: Python3Listener = new Python3AstListener(this, this.document);
        ParseTreeWalker.DEFAULT.walk(python3Listener, this.tree);
        this.setClassDeclarationsForMethods();
    }

    /**
     * Set the correct class for each method declaration in this AST.
     * @private
     */
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

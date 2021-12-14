import {MethodDeclaration} from "./MethodDeclaration";
import {ParseTree, ParseTreeWalker} from "antlr4ts/tree";
import {CharStreams, CommonTokenStream} from "antlr4ts";
import {JavaLexer} from "../parsers/JavaLexer";
import {JavaParser} from "../parsers/JavaParser";
import {JavaAstListener} from "./JavaAstListener";
import {JavaParserListener} from "../parsers/JavaParserListener";
import {ClassDeclaration} from "./ClassDeclaration";
import {MethodCall} from "./MethodCall";
import {TextDocument} from "vscode";
import {Target} from "./Target";

interface Ast {
    readonly tree: ParseTree;
    readonly document: TextDocument;
    classDeclarations: ClassDeclaration[];
    methodDeclarations: MethodDeclaration[];
    methodCalls: MethodCall[];
}

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

    private setClassDeclarationsForMethods() {
        for (let c of this.classDeclarations) {
            let classMethods = c.methodDeclarations;
            console.log(classMethods.map(cm => cm.getIdentifierText()));
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
            console.log(filtered.map(f => f.classDeclaration));
        }
    }
}

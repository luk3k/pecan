import * as fs from 'fs';
import {MethodDeclaration} from "./MethodDeclaration";
import {ParseTree, ParseTreeWalker} from "antlr4ts/tree";
import {CharStreams, CommonTokenStream} from "antlr4ts";
import {JavaLexer} from "../parsers/JavaLexer";
import {JavaParser} from "../parsers/JavaParser";
import {JavaAstListener} from "./JavaAstListener";
import {JavaParserListener} from "../parsers/JavaParserListener";
import {ClassDeclaration} from "./ClassDeclaration";
import {MethodCall} from "./MethodCall";

interface Ast {
    readonly tree: ParseTree;
    classDeclarations: ClassDeclaration[];
    methodDeclarations: MethodDeclaration[];
    methodCalls: MethodCall[];
}

export class JavaAst implements Ast {
    readonly tree: ParseTree;
    classDeclarations: ClassDeclaration[] = [];
    methodDeclarations: MethodDeclaration[] = [];
    methodCalls: MethodCall[] = [];

    /**
     * Initialize the ParseTree object for a given file
     * @param path the path of the file we want to parse
     */
    constructor(path: string) {
        this.tree = this.parse(path);
        this.init();
    }

    /**
     * Parse the file from the given path and return
     * @param path path of the file we want to parse
     * @return ParseTree of the current file
     */
    parse(path: string): ParseTree {
        const source = fs.readFileSync(path).toString();
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
        const astListener: JavaParserListener = new JavaAstListener(this);
        ParseTreeWalker.DEFAULT.walk(astListener, this.tree);
    }
}

// count all method references
let javaAst = new JavaAst('example/Test.java');
for (let m of javaAst.methodDeclarations) {
    let calls = javaAst.methodCalls.filter(x => x.identifier == m.identifier);
    console.log(`Calls for ${m.identifier}: ${calls.length}`);
}
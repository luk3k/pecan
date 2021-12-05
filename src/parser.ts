import {createVisitor, parse, ParseTree, walk} from 'java-ast';
import * as fs from 'fs';

function parseFile(path: string): ParseTree {
    const source = fs.readFileSync(path).toString();
    return parse(source);
}

function countMethods(ast: ParseTree) {
    return createVisitor({
        visitMethodDeclaration: (ctx) => {
            console.log(ctx.IDENTIFIER().text);
            return 1;
        },
        defaultResult: () => 0,
        aggregateResult: (a, b) => a + b
    }).visit(ast);
}

let ast = parseFile('../example/Test.java');
let methodCount = countMethods(ast);
console.log(methodCount);

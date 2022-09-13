# Getting started

The pecan framework allows you to define and show visual augmentations in a declarative manner for your VSCode extension.

First import the pecan framework.
```
import { registerTextEditor, ... } from 'pecan';
```

When your plugin starts with `activate()` pecan needs to initialize a new editor. This can be done by calling `registerTextEditor`.

```typescript
let editor = vscod.window.activeTextEditor;
registerTextEditor(editor);
```
This registers the text editor if it was not registered yet.

All types of decorations are applied to `Target` objects. Targets can either be created manually or are created for you with our AST.
The following snippet creates a `Target` at the start of your document.
```typescript
let t = new Target(new vscode.Range(0,0,0,0), new vscode.Position(0,0), new vscode.Position(0,0), editor.document);
```

Each decorations needs a description of its styling. This is handled by the VSCode [TextEditorDecorationType](https://code.visualstudio.com/api/references/vscode-api#window.createTextEditorDecorationType). For example, we create a style that sets the background color of the target to green and underlines it when applied.
```typescript
const style = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'green',
    textDecoration: 'underline'
});
```

The decoration can be applied like this:
```typescript
t.applyStyle(style);
```

Text documents can also be parsed as an AST. This automatically creates the most common targets for you.  In the example below the content of the editor's document is parsed using the built in python ast.

```typescript
let ast = new Python3Ast(editor.document);
// retrieve the first method of the document
let method0 = ast.methodDeclartions[0];
```

The following example shows how to add the method name after its function in the current file using the specified methodColor.
```typescript
function showDecorations(ast: Python3Ast) {
    for (let m of ast.methodDeclarations) {
		let text: vscode.ThemableDecorationAttachmentRenderOptions = {
        	contentText: `${m.getIdentifierText()} end`,
        	color: methodColor,
			margin: '0 0 0 1.8rem'
    	};
		m.applyTextDecoration(text, 'after');
	}
}
```

When the text editor is changed (e.g. by switching tabs) the new editor needs to be register with the framework. Each editor saves its own state in the background. It might also be necessary to reparse the AST and to update the decorations accordingly. Decorations that might not be needed anymore can be removed by calling the removeAllDecorations function. 
```typescript
let editor = vscod.window.activeTextEditor;

// ...

vscode.window.onDidChangeActiveTextEditor((e) => {
		if (e) {
            removeAllDecorations(editor); // optionally remove old decorations
			registerTextEditor(e);
			editor = e;

			// reparse file and show decorations
			ast = new Python3Ast(e.document);
			showDecorations(ast);
		}
	});
```

The following example shows how to update the AST and decorations with every document change.
```typescript
vscode.workspace.onDidChangeTextDocument(changes => {
		removeAllDecorations(editor);

		// reparse file and show decorations
		ast = new Python3Ast(editor.document);
		showDecorations(ast);
	});
```

Existing decorations of the editor can be removed as follows:
```typescript
removeAllDecorations(editor);
```
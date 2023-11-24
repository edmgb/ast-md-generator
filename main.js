import fs from "fs-extra";
import traverse from "@babel/traverse";
import * as parser from "@babel/parser";
import * as ejs from "ejs";
import * as path from 'path'

const file = fs.readFileSync("./ExampleComponent.js", "utf8");
const ast = parser.parse(file, {
    sourceType: "module",
    strictMode: false,
    plugins: [
        "optionalChaining",
        "classProperties",
        "decorators-legacy",
        "exportDefaultFrom",
        "doExpressions",
        "numericSeparator",
        "dynamicImport",
        "jsx",
        "typescript",
        "flowComments",
    ],
});


const setAttributes = []
const getComponentAttributes = []
const templateNamespaces = []

function traverseFile() {
    traverse.default(ast, {
        enter(path) {
            //console.log(path)
        },
        CallExpression(path) {
            if (path.node.callee.property?.name === "getAttribute") {
                console.log(
                    "name: ",
                    path.node.callee.property?.name,
                    "value: ",
                    path.node.arguments?.[0].value
                );
                getComponentAttributes.push(path.node.arguments?.[0].value)
            }
            
            if (path.node.callee.property?.name === "setAttribute") {
                console.log(
                    "SET name: ",
                    path.node.callee.property?.name,
                    "SET value: ",
                    path.node.arguments?.[0].value
                );
                setAttributes.push(path.node.arguments?.[0].value)
            }
        },
        SwitchStatement: function (path) {
            //getAttribute
            const getAttribute = path.node.discriminant.callee.property.name
            //namespace
            const namespace = path.node.discriminant.arguments[0].value
            // cases - namespace name 
            // TODO: ARR.LOOP
            const oneNamespace = path.node.cases[0].test.value
            const twoNamespace = path.node.cases[1].test.value
            console.log(getAttribute, namespace, oneNamespace)
            templateNamespaces.push(oneNamespace)
            templateNamespaces.push(twoNamespace)
        },
        //   ExportDefaultDeclaration: function (path) {
        //     console.log(path.node.leadingComments[0].value);
        //   },
    });
}

function renderMD() {
    console.log(setAttributes, path.join('/', 'readmeTemplate.md'))
    ejs.renderFile("readmeTemplate.md", 
        { 
            setAttributes: setAttributes.join('\n'), 
            getAttributes: getComponentAttributes.join('\n'), 
            templates: templateNamespaces.join('\n') 
        }, (err, str) => {
        if (err) console.error(err)
        const outputFile = "readme.md"
        fs.ensureFileSync(outputFile)
        fs.outputFileSync(outputFile, str)
    })
}

traverseFile()
renderMD()
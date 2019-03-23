const fs = require('fs')
const path = require('path')

module.exports = {
    "parser": "babel-eslint",
    "extends": ["standard", "standard-react"],
    "plugins": ["graphql"],
    "settings": {
        "react": {
            "version": "16.4.1"
        }
    },
    "rules": {
        //"react/prop-types": "off",
        "graphql/template-strings": ['error', {
            env: 'apollo',
            validators: 'all',
            schemaString: fs.readFileSync(path.resolve(__dirname, './schema.graphql'), 'utf8')
        }]
    },
    overrides: [
        {
            files: [
                "**/*.test.js",
                "**/*.spec.js",
                "**/*.steps.js"
            ],
            env: {
                jest: true // now **/*.test.js files' env has both es6 *and* jest
            },
            // Can't extend in overrides: https://github.com/eslint/eslint/issues/8813
            // "extends": ["plugin:jest/recommended"]
            plugins: ["jest"],
            rules: {
                "jest/no-disabled-tests": "warn",
                "jest/no-focused-tests": "error",
                "jest/no-identical-title": "error",
                "jest/prefer-to-have-length": "warn",
                "jest/valid-expect": "error"
            }
        }
    ],
};
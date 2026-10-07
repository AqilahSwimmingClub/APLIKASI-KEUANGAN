import tseslint from 'typescript-eslint';
export default tseslint.config({ignores:['dist/**','android/**','node_modules/**','coverage/**','playwright-report/**','test-results/**']},...tseslint.configs.recommended,{rules:{'@typescript-eslint/no-explicit-any':'error'}});

// https://github.com/microsoft/monaco-editor/tree/main/src/basic-languages languages
const Languages = [
    { name: 'abap', extensions: ['abap'] },
    { name: 'apex', extensions: ['apex'] },
    { name: 'azcli', extensions: ['azcli'] },
    { name: 'bat', extensions: ['bat'] },
    { name: 'bicep', extensions: ['bicep'] },
    { name: 'cameligo', extensions: ['cameligo'] },
    { name: 'clojure', extensions: ['clj', 'cljs'] },
    { name: 'coffee', extensions: ['coffee', 'cf'] },
    { name: 'cpp', extensions: ['cpp', 'cc', 'cxx', 'hpp', 'h'] },
    { name: 'csharp', extensions: ['cs'] },
    { name: 'csp', extensions: ['csp'] },
    { name: 'css', extensions: ['css'] },
    { name: 'cypher', extensions: ['cypher'] },
    { name: 'dart', extensions: ['dart'] },
    { name: 'dockerfile', extensions: ['dockerfile', 'Dockerfile'] },
    { name: 'ecl', extensions: ['ecl'] },
    { name: 'elixir', extensions: ['ex', 'exs'] },
    { name: 'flow9', extensions: ['flow9'] },
    { name: 'freemarker2', extensions: ['ftl'] },
    { name: 'fsharp', extensions: ['fs', 'fsi', 'fsx', 'fsscript'] },
    { name: 'go', extensions: ['go'] },
    { name: 'graphql', extensions: ['graphql', 'gql'] },
    { name: 'handlebars', extensions: ['handlebars', 'hbs'] },
    { name: 'hcl', extensions: ['hcl'] },
    { name: 'html', extensions: ['html', 'htm'] },
    { name: 'ini', extensions: ['ini'] },
    { name: 'java', extensions: ['java'] },
    { name: 'javascript', extensions: ['js', 'jsx'] },
    { name: 'julia', extensions: ['jl'] },
    { name: 'kotlin', extensions: ['kt', 'kts'] },
    { name: 'less', extensions: ['less'] },
    { name: 'lexon', extensions: ['lexon'] },
    { name: 'liquid', extensions: ['liquid'] },
    { name: 'lua', extensions: ['lua'] },
    { name: 'm3', extensions: ['m3'] },
    { name: 'markdown', extensions: ['md', 'markdown'] },
    { name: 'mdx', extensions: ['mdx'] },
    { name: 'mips', extensions: ['mips'] },
    { name: 'msdax', extensions: ['msdax'] },
    { name: 'mysql', extensions: ['mysql'] },
    { name: 'objective-c', extensions: ['m', 'mm'] },
    { name: 'pascal', extensions: ['pas'] },
    { name: 'pascaligo', extensions: ['ligo'] },
    { name: 'perl', extensions: ['pl', 'pm'] },
    { name: 'pgsql', extensions: ['pgsql', 'sql'] },
    { name: 'php', extensions: ['php', 'phtml'] },
    { name: 'pla', extensions: ['pla'] },
    { name: 'postiats', extensions: ['postiats'] },
    { name: 'powerquery', extensions: ['pq'] },
    { name: 'powershell', extensions: ['ps1', 'psm1'] },
    { name: 'protobuf', extensions: ['proto'] },
    { name: 'pug', extensions: ['pug'] },
    { name: 'python', extensions: ['py'] },
    { name: 'qsharp', extensions: ['qs'] },
    { name: 'r', extensions: ['r'] },
    { name: 'razor', extensions: ['cshtml', 'razor'] },
    { name: 'redis', extensions: ['redis'] },
    { name: 'redshift', extensions: ['redshift'] },
    { name: 'restructuredtext', extensions: ['rst'] },
    { name: 'ruby', extensions: ['rb'] },
    { name: 'rust', extensions: ['rs'] },
    { name: 'sb', extensions: ['sb'] },
    { name: 'scala', extensions: ['scala', 'sc'] },
    { name: 'scheme', extensions: ['scm', 'ss'] },
    { name: 'scss', extensions: ['scss'] },
    { name: 'shell', extensions: ['sh', 'bash'] },
    { name: 'solidity', extensions: ['sol'] },
    { name: 'sophia', extensions: ['sophia'] },
    { name: 'sparql', extensions: ['sparql'] },
    { name: 'sql', extensions: ['sql'] },
    { name: 'st', extensions: ['st'] },
    { name: 'swift', extensions: ['swift'] },
    { name: 'systemverilog', extensions: ['sv', 'svh'] },
    { name: 'tcl', extensions: ['tcl'] },
    { name: 'test', extensions: ['test'] },
    { name: 'twig', extensions: ['twig'] },
    { name: 'typescript', extensions: ['ts', 'tsx'] },
    { name: 'typespec', extensions: ['typespec'] },
    { name: 'vb', extensions: ['vb'] },
    { name: 'wgsl', extensions: ['wgsl'] },
    { name: 'xml', extensions: ['xml'] },
    { name: 'yaml', extensions: ['yaml', 'yml'] },
];

export const getLanguageNameCloseToExtension = (extension: string): string | undefined => { // useful for creating new file, and can allow user to autopick language
    return Languages.find(lang => lang.extensions.some(ext => ext.includes(extension)))?.name;
}

export const getLanguageNameCloseToString = (string: string): {
    name: string;
    extensions: string[];
}[] | undefined => { 
    return Languages.filter(lang => lang.name.includes(string));
}

export const getLanguageNameFromExtension = (extension: string): string | undefined => { // useful for creating new file and allowing monaco to actually work! auto detects language name from extension
  return Languages.find(lang => lang.extensions.includes(extension))?.name;
};

export const getLanguageExtensionsFromName = (name: string): string[] | undefined => { // useful for getting extensions for monaco editor
  return Languages.find(lang => lang.name === name)?.extensions;
};

export default Languages;
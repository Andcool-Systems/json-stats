export type TypeofTypes = 'string' | 'boolean' | 'function' | 'number' | 'object' | 'symbol' | 'undefined' | 'bigint';

export type ConfigType = {
    indent: number,
    colors: {
        main_text: string,
        background: string,
        header: string,
        icon_color: string,
        indent_lines: string,
        line_index: string,
        keys: string
    },
    typeColor: (type: TypeofTypes) => string,
    typeQuotes: (type: TypeofTypes) => string,
    bracketsColors: (depth: number) => string
}
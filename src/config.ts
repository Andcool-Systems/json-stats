import { ConfigType, TypeofTypes } from 'src/config.types';

const config: ConfigType = {
    colors: {
        main_text: '#ffffff',
        background: '#1e1e1e',
        header: '#252526',
        icon_color: '#ffd700',
        indent_lines: '#404040',
        line_index: '#6e7681',
        keys: '#9cdcfe'
    },
    /**
    * Get the color associated with a JavaScript data type.
    *
    * @param {TypeofTypes} type - String-represented JavaScript data type of the current value.
    * @returns {string} Hex color code corresponding to the provided data type.
    */
    typeColor: (type: TypeofTypes): string => {
        switch (type) {
            case 'bigint': return '#b5cea8';
            case 'number': return '#b5cea8';
            case 'object': return '#569cd6';
            case 'undefined': return '#569cd6';
            case 'boolean': return '#569cd6';
            default: return '#ce9178';
        }
    },
    /**
    * Get value quotes if needed.
    *
    * @param {TypeofTypes} type - String-represented JavaScript data type of the current value.
    * @returns {string} Quotes if needed.
    */
    typeQuotes: (type: TypeofTypes): string => {
        const quotesNeeded: TypeofTypes[] = ['string', 'symbol'];
        return quotesNeeded.includes(type) ? '"' : '';
    },
    /**
    * Get the color of brackets depending on the deep nesting of the object.
    *
    * @param {number} depth - Current object depth.
    * @returns {string} Hex color code corresponding to the provided depth.
    */
    bracketsColors: (depth: number): string => {
        const brackets_colors = ['#ffd700', '#da70d6', '#179fff'];
        return brackets_colors[depth % brackets_colors.length];
    }
}

export default config;
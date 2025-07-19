import { ConfigType, TypeofTypes } from 'src/config.types';

const config: ConfigType = {
    indent: 2, // Number of spaces
    colors: {
        main_text: '#ffffff', // Comma, colon color
        background: '#151b23', // Main background color
        keys: '#7ee787' // Color of JSON keys
    },
    /**
     * Get the color associated with a JavaScript data type.
     *
     * @param {TypeofTypes} type - String-represented JavaScript data type of the current value.
     * @returns {string} Hex color code corresponding to the provided data type.
     */
    typeColor: (type: TypeofTypes): string => {
        switch (type) {
            case 'bigint':
            case 'number':
                return '#79c0ff';
            case 'object':
            case 'undefined':
            case 'boolean':
                return '#79c0ff';
            case 'function':
                return '#dcdcaa';
            default:
                return '#a5d6ff';
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bracketsColors: (depth: number): string => {
        return '#ffffff';
    }
};

export default config;

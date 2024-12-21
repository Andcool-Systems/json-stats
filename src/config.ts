type typeofTypes = 'string' | 'boolean' | 'function' | 'number' | 'object' | 'symbol' | 'undefined' | 'bigint';

export const brackets_colors = ['#ffd700', '#da70d6', '#179fff'];

export const typeColors = (type: typeofTypes) => {
    switch (type) {
        case 'bigint': return '#b5cea8';
        case 'number': return '#b5cea8';
        case 'object': return '#569cd6';
        case 'undefined': return '#569cd6';
        case 'boolean': return '#569cd6';
        default: return '#ce9178';
    }
}

export const typeQuotes = (type: typeofTypes) => {
    const quotesNeeded: typeofTypes[] = ['string', 'symbol'];
    return quotesNeeded.includes(type) ? '"' : '';
}

export const colors = {
    main_text: '#ffffff',
    background: '#1e1e1e',
    header: '#252526',
    icon_color: '#ffd700',
    indent_lines: '#404040',
    line_index: '#6e7681',
    keys: '#9cdcfe'
}
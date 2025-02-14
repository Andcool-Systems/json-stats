import { Injectable } from '@nestjs/common';
import config from 'src/config';

type AnyObject = Record<string, any>;

export type ObjectStructureInfo = {
    key: string;
    startLine: number;
    endLine: number;
    depth: number;
};

@Injectable()
export class ParserService {
    normalizeValues = (obj: AnyObject) => {
        const type = typeof obj;
        switch (type) {
            case 'function':
                return '&lt;function&gt;';
            case 'undefined':
                return null;
            default:
                return obj;
        }
    };

    parse(obj: AnyObject, indent: number = 2, depth: number = 0): string {
        const currentIndent = indent * depth;
        const nextIndent = indent * (depth + 1);

        if (typeof obj !== 'object' || obj === null || obj === undefined) {
            const value = this.normalizeValues(obj);
            const quotes = config.typeQuotes(typeof value);
            const color = config.typeColor(typeof value);
            return `<tspan style="fill: ${color};">${quotes}${value}${quotes}</tspan>`;
        }

        let entries = '';
        if (Array.isArray(obj)) {
            entries = obj
                .map((value, index) => {
                    const formattedValue = this.parse(value, indent, depth + 1);
                    const comma = index < obj.length - 1 ? ',' : '';

                    return (
                        `<tspan x="${nextIndent}" dy="19">` +
                        `${formattedValue}${comma}` +
                        `</tspan>`
                    );
                })
                .join(`\n`);
        } else {
            entries = Object.entries(obj)
                .map(([key, value], index, array) => {
                    const formattedValue = this.parse(value, indent, depth + 1);
                    const comma = index < array.length - 1 ? ',' : '';

                    return (
                        `<tspan x="${nextIndent}" dy="19">` +
                        `<tspan style="fill: ${config.colors.keys};">"${key}"</tspan>: ${formattedValue}${comma}` +
                        `</tspan>`
                    );
                })
                .join(`\n`);
        }
        const bracket_color = config.bracketsColors(depth);

        if (currentIndent === 0) {
            return (
                `<tspan x="0" dy="0" style="fill: ${bracket_color};">{</tspan>\n` +
                `${entries}\n` +
                `<tspan x="0" dy="19" style="fill: ${bracket_color};">}</tspan>`
            );
        }

        const brackets = Array.isArray(obj) ? '[]' : '{}';
        return (
            `<tspan style="fill: ${bracket_color};">${brackets[0]}</tspan></tspan>\n` +
            `${entries}\n` +
            `<tspan x="${currentIndent}" dy="19"><tspan style="fill: ${bracket_color};">${brackets[1]}</tspan>`
        );
    }

    parseObjectStructure(
        obj: AnyObject,
        lineIndex: { current: number } = { current: 2 },
        depth: number = 0
    ): ObjectStructureInfo[] {
        if (typeof obj !== 'object' || obj === null) return [];

        const result: ObjectStructureInfo[] = [];

        Object.entries(obj).forEach(([key, value]) => {
            const startLine = lineIndex.current++;

            if (typeof value === 'object' && value !== null) {
                result.push({ key, startLine, endLine: 0, depth });
                result.push(
                    ...this.parseObjectStructure(value, lineIndex, depth + 1)
                );
                const endLinde = lineIndex.current++;
                result.find(
                    (item) => item.key === key && item.startLine === startLine
                )!.endLine = endLinde;
            }
        });
        return result;
    }
}

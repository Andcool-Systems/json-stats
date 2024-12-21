import { Injectable } from '@nestjs/common';
import { brackets_colors, colors, typeColors, typeQuotes } from 'src/config';

type AnyObject = Record<string, any>;

export type ObjectStructureInfo = {
    key: string;
    startLine: number;
    endLine: number;
    depth: number;
};

@Injectable()
export class ParserService {
    parse(
        obj: AnyObject,
        indent: number = 2,
        depth: number = 0
    ): string {
        const currentIndent = indent * depth;
        const nextIndent = indent * (depth + 1);

        if (typeof obj !== "object" || obj === null || obj === undefined) {
            const quotes = typeQuotes(typeof obj);
            const color = typeColors(typeof obj);
            return `<tspan style="fill: ${color};">${quotes}${obj}${quotes}</tspan>`;
        }

        const entries = Object.entries(obj)
            .map(([key, value], index, array) => {
                const formattedValue = this.parse(value, indent, depth + 1);
                const comma = index < array.length - 1 ? ',' : '';

                return `<tspan x="${nextIndent}" dy="19">` +
                    `<tspan style="fill: ${colors.keys};">"${key}"</tspan>: ${formattedValue}${comma}` +
                    `</tspan>`;
            })
            .join(`\n`);

        const bracket_color = brackets_colors[
            depth < brackets_colors.length ?
                depth :
                depth - (Math.floor(depth / brackets_colors.length) * brackets_colors.length)
        ];

        if (currentIndent === 0) {
            return (
                `<tspan x="0" dy="0" style="fill: ${bracket_color};">{</tspan>\n` +
                `${entries}\n` +
                `<tspan x="0" dy="19" style="fill: ${bracket_color};">}</tspan>`
            );
        }

        return (
            `<tspan style="fill: ${bracket_color};">{</tspan></tspan>\n` +
            `${entries}\n` +
            `<tspan x="${currentIndent}" dy="19"><tspan style="fill: ${bracket_color};">}</tspan>`
        );
    }

    parseObjectStructure(
        obj: AnyObject,
        lineIndex: { current: number } = { current: 2 },
        depth: number = 0
    ): ObjectStructureInfo[] {
        if (typeof obj !== 'object' || obj === null) {
            return [];
        }

        const result: ObjectStructureInfo[] = [];
        const keys = Object.keys(obj);

        for (const key of keys) {
            const startLine = lineIndex.current++;

            if (typeof obj[key] === 'object' && obj[key] !== null) {
                result.push({ key, startLine, endLine: 0, depth });
                const children = this.parseObjectStructure(obj[key], lineIndex, depth + 1);
                result.push(...children);
                const endLine = lineIndex.current++;
                result.find(item => item.key === key && item.startLine === startLine)!.endLine = endLine;
            }
        }

        return result;
    }
}
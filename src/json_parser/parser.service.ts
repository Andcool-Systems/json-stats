import { Injectable } from '@nestjs/common';

type AnyObject = Record<string, any>;
const brackets_colors = ['#ffd700', '#da70d6', '#179fff'];

@Injectable()
export class ParserService {
    parse(
        obj: AnyObject,
        indent: number = 2,
        depth: number = 0
    ): string {
        const currentIndent = indent * depth;
        const nextIndent = indent * (depth + 1);

        if (typeof obj !== "object" || obj === null) {
            const quotes = typeof obj === 'number' ? '' : '"';
            const color = typeof obj === 'number' ? '#b5cea8' : '#ce9178';
            return `<tspan style="fill: ${color};">${quotes}${obj}${quotes}</tspan>`;
        }

        // Форматирование объекта
        const entries = Object.entries(obj)
            .map(([key, value], index, array) => {
                const formattedValue = this.parse(value, indent, depth + 1);
                const comma = index < array.length - 1 ? "," : "";

                return `<tspan x="${nextIndent}" dy="19"><tspan class="key">"${key}"</tspan>: ${formattedValue}${comma}</tspan>`;
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
}

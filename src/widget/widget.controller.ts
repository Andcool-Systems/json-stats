import { Get, Controller, Render, Header, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import { WidgetService } from './widget.service';
import { ParserService } from 'src/json_parser/parser.service';
import { colors } from 'src/config';


@Controller()
export class WidgetController {
    constructor(private readonly widgetService: WidgetService,
        private readonly parserService: ParserService
    ) { }

    @Get('/')
    @Render('index')
    @Header('Cache-Control', 'no-cache')
    @Header('Age', '0')
    async widget(
        @Res({ passthrough: true }) res: Response
    ) {
        const json = await this.widgetService.generate();
        const content = this.parserService.parse(json, 30);

        const indents = this.parserService.parseObjectStructure(json);

        const lines_count = content.split('\n').length;
        const indexes = this.widgetService.generate_indexes(lines_count);

        res.header('Content-Type', 'image/svg+xml');
        return {
            json: content,
            indexes: indexes,
            indents: this.widgetService.generateIndentLines(indents, 30),
            height: 52 + (lines_count * 19),
            height_: 60 + (lines_count * 19),
            height_main_line: (lines_count - 2) * 19,

            background_color: colors.background,
            header_color: colors.header,
            icon_color: colors.icon_color,
            indent_color: colors.indent_lines,
            main_color: colors.main_text
        };
    }
}

import { Get, Controller, Render, Header, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import { WidgetService } from './widget.service';
import { ParserService } from 'src/json_parser/parser.service';
import config from 'src/config';


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
        const content = this.parserService.parse(json, config.indent * 7.5);

        const indents = this.parserService.parseObjectStructure(json);
        const lines_count = content.split('\n').length;

        res.header('Content-Type', 'image/svg+xml');
        return {
            json: content,
            indexes: this.widgetService.generateIndexes(lines_count),
            indents: this.widgetService.generateIndentLines(indents, config.indent * 7.5),
            height: 52 + (lines_count * 19),
            height_: 60 + (lines_count * 19),
            height_main_line: (lines_count - 2) * 19,
            indent_x: 40 + config.indent * 7.5,

            background_color: config.colors.background,
            header_color: config.colors.header,
            icon_color: config.colors.icon_color,
            indent_color: config.colors.indent_lines,
            main_color: config.colors.main_text
        };
    }

    @Get('/json')
    async json() {
        return await this.widgetService.generate();
    }
}

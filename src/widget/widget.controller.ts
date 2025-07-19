import { Get, Controller, Render, Header, Res } from '@nestjs/common';
import type { Response } from 'express';
import { WidgetService } from './widget.service';
import { ParserService } from 'src/json_parser/parser.service';
import config from 'src/config';

@Controller()
export class WidgetController {
    constructor(
        private readonly widgetService: WidgetService,
        private readonly parserService: ParserService
    ) {}

    @Get('/')
    @Render('index')
    @Header('Cache-Control', 'no-cache')
    @Header('Age', '0')
    async widget(@Res({ passthrough: true }) res: Response) {
        const json = await this.widgetService.generate();
        const content = this.parserService.parse(json, config.indent * 7.5);
        const lines_count = content.split('\n').length;

        res.header('Content-Type', 'image/svg+xml');
        return {
            json: content,
            height: 52 + lines_count * 19,
            height_: 15 + lines_count * 19,

            background_color: config.colors.background,
            main_color: config.colors.main_text
        };
    }

    @Get('/json')
    async json() {
        return await this.widgetService.generate();
    }
}

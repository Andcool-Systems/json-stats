import { Get, Controller, Render, Header, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import { WidgetService } from './widget.service';


@Controller()
export class WidgetController {
    constructor(private readonly widgetService: WidgetService) { }

    @Get('/')
    @Render('index')
    @Header('Cache-Control', 'no-cache')
    @Header('Age', '0')
    async widget(
        @Res({ passthrough: true }) res: Response
    ) {
        const content = await this.widgetService.generate();

        const lines_count = content.main.split('\n').length;
        const indexes = this.widgetService.generate_indexes(lines_count);

        res.header('Content-Type', 'image/svg+xml');
        return {
            json: content.main,
            indexes: indexes,
            indents: content.indents,
            height: 52 + (lines_count * 19),
            height_: 60 + (lines_count * 19),
            height_main_line: (lines_count - 2) * 19
        };
    }

    /*
    @Get('/user')
    @Render('index')
    @Header('Cache-Control', 'no-cache')
    @Header('Age', '0')
    async widgetUser(
        @Res({ passthrough: true }) res: Response,
        @Query() query: { query: string }
    ) {
        let json = {};
        let content = "";
        let indexes = ""
        let lines_count = 0;

        try {
            if (!query.query || query.query.length > 255) {
                throw Error('Invalid request query');
            }

            json = JSON.parse(query.query);

            content = await this.widgetService.generateUser(json);
            lines_count = content.split('\n').length;
            indexes = this.widgetService.generate_indexes(lines_count);
        } catch (e) {
            console.error(e)
            json = {
                status: 'error',
                message: (e.message ?? "Unknown error. See server console.").slice(0, 60) + (!!e.message && e.message.length > 60 ? '...' : '')
            }

            content = await this.widgetService.generateUser(json);
            lines_count = content.split('\n').length;
            indexes = this.widgetService.generate_indexes(lines_count);
        }

        res.header('Content-Type', 'image/svg+xml');
        return {
            json: content,
            indexes: indexes,
            height: 52 + (lines_count * 19),
            height_: 60 + (lines_count * 19)
        };
    }
    */
}

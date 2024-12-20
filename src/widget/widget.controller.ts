import { Get, Controller, Render, Header, Res } from '@nestjs/common';
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

        const lines_count = content.split('\n').length;
        const indexes = this.widgetService.generate_indexes(lines_count);

        res.header('Content-Type', 'image/svg+xml');
        return {
            json: content,
            indexes: indexes,
            height: 52 + (lines_count * 19),
            height_: 60 + (lines_count * 19)
        };
    }
}

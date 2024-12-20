import { Module } from '@nestjs/common';
import { ParserService } from './json_parser/parser.service';
import { WidgetController } from './widget/widget.controller';
import { WidgetService } from './widget/widget.service';
import { CacheModule } from '@nestjs/cache-manager';
import { APIService } from './apis/apis.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CacheModule.register(), ConfigModule.forRoot()],
  controllers: [WidgetController],
  providers: [ParserService, WidgetService, APIService],
})
export class AppModule { }

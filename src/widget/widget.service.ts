import { Injectable } from '@nestjs/common';
import { APIService } from 'src/apis/apis.service';
import config from 'src/config';
import { ObjectStructureInfo } from 'src/json_parser/parser.service';


@Injectable()
export class WidgetService {
    constructor(
        private readonly apiService: APIService,
    ) { }

    getTime(): string {
        return new Date().toLocaleString('ru-RU', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false,
            timeZone: process.env.DATETIME_TIMEZONE
        });
    }

    getDate(): string {
        return new Date().toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            timeZone: process.env.DATETIME_TIMEZONE
        });
    }

    getTimeDiff(start: Date) {
        const now = Date.now();
        const diff_millis = now - start.getTime();
        const hours = Math.floor(diff_millis / (1000 * 60 * 60));
        const minutes = Math.floor((diff_millis % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff_millis % (1000 * 60)) / 1000);
        if (hours > 0) {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }

    async generate() {
        let json = {};
        try {
            const [
                github_data,
                streak,
                wakatime_global,
                wakatime_last,
                weather,
                activity
            ] = await Promise.all([
                this.apiService.getGithubRepos(process.env.GITHUB_USERNAME),
                this.apiService.getGithubStreak(process.env.GITHUB_USERNAME),
                this.apiService.getWakatimeGlobal(process.env.WAKATIME_GLOBAL),
                this.apiService.getWakatimeLanguages(process.env.WAKATIME_LANGS),
                this.apiService.getWeather(process.env.WEATHER_API, process.env.WEATHER_QUERY),
                this.apiService.getActivity(process.env.ACTIVITY_API, process.env.ACTIVITY_ID)
            ]);

            const top_repos = github_data.data.user?.repositories?.nodes?.reduce((acc, value) => {
                const el = { [value.name]: value.stargazerCount };
                acc = { ...acc, ...el };
                return acc;
            }, {});

            const top_langs = wakatime_last?.data?.slice(0, 3)?.reduce((acc, value) => {
                const el = { [value.name.toLowerCase().replaceAll('+', 'p')]: value.text };
                acc = { ...acc, ...el };
                return acc;
            }, {});

            json = {
                name: github_data.data.user?.name ?? null,
                description: process.env.DESCRIPTION,
                github: {
                    followers: github_data.data.user?.followers?.totalCount ?? null,
                    total_stars: github_data.data.user?.repositories?.totalCount ?? null,
                    top_repos: top_repos ?? null,
                    streak: streak ? {
                        current: streak.streak,
                        longest: streak.longest
                    } : null,
                },
                wakatime: {
                    all_time: wakatime_global?.data?.grand_total?.human_readable_total_including_other_language,
                    top_langs: top_langs
                },
                weather: weather ? {
                    temperature: weather.temp,
                    condition: weather.condition
                } : null,
                datetime: {
                    time: this.getTime(),
                    tz: process.env.DATETIME_TIMEZONE,
                    date: this.getDate(),
                },
                activity: activity && activity.activities.length !== 0 ? {
                    file: activity.activities[0].file ?? 'Idling',
                    workplace: activity.activities[0].workplace ?? 'No workplace',
                    duration: this.getTimeDiff(new Date(activity.activities[0].start_time))
                } : null,
                created_by: "AndcoolSystems"
            }
        } catch (e) {
            console.error(e)
            json = {
                status: 'error',
                message: (e.message ?? "Unknown error. See server console.").slice(0, 60) + (!!e.message && e.message.length > 60 ? '...' : '')
            }
        }
        return json;
    }

    generate_indexes(count: number) {
        const array = [];
        for (let index = 1; index <= count; index++) {
            array.push(`<tspan x="${index < 10 ? '9' : '0'}" dy="${index === 1 ? '0' : '19'}" fill="${config.colors.line_index}">${index}</tspan>`);
        }

        return array.join('\n');
    }

    generateIndentLines(indents: ObjectStructureInfo[], indent_width: number) {
        const array = [];
        for (const indent of indents) {
            array.push(
                `<rect fill="${config.colors.indent_lines}" x="${indent.depth * indent_width}" ` +
                `y="${indent.startLine * 19}" width="1" height="${((indent.endLine - indent.startLine) - 1) * 19}" />`
            );
        }

        return array.join('\n');
    }
}

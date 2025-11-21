import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import axios from 'axios';
import http from 'http';
import https from 'https';

const agentOptions = {
    keepAlive: true,
    timeout: 5000
};

const instance = axios.create({
    timeout: 5000,
    httpAgent: new http.Agent(agentOptions),
    httpsAgent: new https.Agent(agentOptions)
});

@Injectable()
export class APIService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async getGithubRepos(username: string): Promise<GithubRepos | null> {
        try {
            const cache = await this.cacheManager.get<string>(
                `repos:${username}`
            );

            if (cache) return JSON.parse(cache);

            const response = await instance.post(
                'https://api.github.com/graphql',
                {
                    query:
                        'query GetUserDetails($username: String!) { user(login: $username)' +
                        '{ name login followers { totalCount } repositories(first: 100, orderBy: {field: STARGAZERS, direction: DESC})' +
                        '{ nodes { name owner { login } isPrivate stargazerCount } } } }',
                    variables: {
                        username: username
                    }
                },
                {
                    headers: { Authorization: `Bearer ${process.env.GITHUB}` },
                    validateStatus: () => true
                }
            );

            if (response.status !== 200) {
                console.error(response.data);
                return null;
            }
            const data: GithubRepos = response.data;

            data.total_stars = data?.data?.user?.repositories?.nodes?.reduce(
                (acc, node) => acc + node.stargazerCount,
                0
            );

            await this.cacheManager.set(
                `repos:${username}`,
                JSON.stringify(data),
                1000 * 60 * 60
            );
            return data;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async getGithubStreak(username: string): Promise<{
        streak: number;
        longest: number;
        total_contributions: number;
    } | null> {
        try {
            const cache = await this.cacheManager.get<string>(
                `streak:${username}`
            );
            if (cache) return JSON.parse(cache);

            const today = new Date();
            const timezoneOffset = today.getTimezoneOffset();
            today.setMinutes(today.getMinutes() - timezoneOffset);

            const headers = { Authorization: `Bearer ${process.env.GITHUB}` };
            const allDays: { date: string; count: number }[] = [];

            for (let i = 0; i < 5; i++) {
                const from = new Date(today);
                from.setFullYear(today.getFullYear() - i - 1);
                const to = new Date(today);
                to.setFullYear(today.getFullYear() - i);

                const response = await instance.post(
                    'https://api.github.com/graphql',
                    {
                        query: `
                        query GetUserContributions($username: String!, $from: DateTime!, $to: DateTime!) {
                            user(login: $username) {
                                contributionsCollection(from: $from, to: $to) {
                                    contributionCalendar {
                                        weeks {
                                            contributionDays {
                                                date
                                                contributionCount
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    `,
                        variables: {
                            username,
                            from: from.toISOString(),
                            to: to.toISOString()
                        }
                    },
                    {
                        headers,
                        validateStatus: () => true
                    }
                );

                if (
                    response.status !== 200 ||
                    !response.data.data?.user?.contributionsCollection
                ) {
                    return null;
                }

                const weeks =
                    response.data.data.user.contributionsCollection
                        .contributionCalendar.weeks;

                const days = weeks.flatMap((week: any) =>
                    week.contributionDays.map((day: any) => ({
                        date: day.date,
                        count: day.contributionCount
                    }))
                );

                allDays.push(...days);
            }

            allDays.sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            );

            let currentStreak = 0;
            let longestStreak = 0;
            let totalContributions = 0;

            for (const day of allDays) {
                totalContributions += day.count;

                if (day.count > 0) {
                    currentStreak++;
                    longestStreak = Math.max(longestStreak, currentStreak);
                } else {
                    currentStreak = 0;
                }
            }

            let streak = 0;
            for (let i = allDays.length - 2; i >= 0; i--) {
                if (allDays[i].count > 0) {
                    streak++;
                } else {
                    break;
                }
            }

            const result = {
                streak: streak,
                longest: longestStreak,
                total_contributions: totalContributions
            };

            await this.cacheManager.set(
                `streak:${username}`,
                JSON.stringify(result),
                1000 * 60 * 60 * 12
            );

            return result;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async getWakatimeGlobal(path: string): Promise<WakatimeGlobal | null> {
        try {
            const cache = await this.cacheManager.get<string>(
                `waka_global:${path}`
            );

            if (cache) {
                return JSON.parse(cache);
            }

            const response = await instance.get(
                `${process.env.WAKATIME_URL}${path}`,
                { validateStatus: () => true }
            );

            if (response.status !== 200) {
                return null;
            }

            await this.cacheManager.set(
                `waka_global:${path}`,
                JSON.stringify(response.data),
                1000 * 60 * 60
            );
            return response.data;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async getWakatimeLanguages(
        path: string
    ): Promise<WakatimeLanguages | null> {
        try {
            const cache = await this.cacheManager.get<string>(
                `waka_langs:${path}`
            );

            if (cache) {
                return JSON.parse(cache);
            }

            const response = await instance.get(
                `${process.env.WAKATIME_URL}${path}`,
                { validateStatus: () => true }
            );

            if (response.status !== 200) {
                return null;
            }

            await this.cacheManager.set(
                `waka_langs:${path}`,
                JSON.stringify(response.data),
                1000 * 60 * 60
            );
            return response.data;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async getWeather(query: string): Promise<WeatherResponse | null> {
        try {
            const cache = await this.cacheManager.get<string>(
                `weather:${query}`
            );

            if (cache) {
                return JSON.parse(cache);
            }

            const capitalize = (str: string) =>
                String(str).charAt(0).toUpperCase() + String(str).slice(1);

            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather` +
                    `?lat=${process.env.WEATHER_LAT}` +
                    `&lon=${process.env.WEATHER_LON}` +
                    `&appid=${process.env.WEATHER_TOKEN}` +
                    `&units=metric`
            );

            if (response.status !== 200) return null;

            const data = {
                temp: response.data.main.temp,
                condition: capitalize(response.data.weather[0].description)
            };

            await this.cacheManager.set(
                `weather:${query}`,
                JSON.stringify(data),
                1000 * 60 * 30
            );
            return data;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async getActivity(
        api: string,
        id: string
    ): Promise<ActivityResponse | null> {
        try {
            const cache = await this.cacheManager.get<string>(`activity:${id}`);

            if (cache) {
                return JSON.parse(cache);
            }

            const response = await instance.get(`${api}${id}`, {
                validateStatus: () => true
            });

            if (response.status !== 200) {
                return null;
            }

            await this.cacheManager.set(
                `activity:${id}`,
                JSON.stringify(response.data),
                1000 * 60
            );
            return response.data;
        } catch (e) {
            console.log(e);
            return null;
        }
    }
}

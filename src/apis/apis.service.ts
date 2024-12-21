import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import axios from 'axios';


@Injectable()
export class APIService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async getGithubRepos(username: string): Promise<GithubRepos | null> {
        const cache = await this.cacheManager.get<string>(`repos:${username}`);

        if (cache) return JSON.parse(cache);

        const response = await axios.post(
            'https://api.github.com/graphql',
            {
                query: "query GetUserDetails($username: String!) { user(login: $username)" +
                    "{ name login followers { totalCount } repositories(first: 100, orderBy: {field: STARGAZERS, direction: DESC})" +
                    "{ nodes { name stargazerCount } } } } }",
                variables: {
                    username: username
                }
            },
            {
                headers: { Authorization: `Bearer ${process.env.GITHUB}` },
                validateStatus: () => true
            }
        );

        if (response.status !== 200) return null;

        const data: GithubRepos = response.data;
        data.total_stars = data?.data?.user?.repositories?.nodes?.reduce((acc, node) => acc + node.stargazerCount, 0);

        await this.cacheManager.set(`repos:${username}`, JSON.stringify(data), 1000 * 60 * 60);
        return data;
    }


    async getGithubStreak(username: string): Promise<{ streak: number; longest: number; } | null> {
        const cache = await this.cacheManager.get<string>(`streak:${username}`);

        if (cache) return JSON.parse(cache);

        const date = new Date();
        const timezoneOffset = date.getTimezoneOffset();
        const now = date.getTime() - timezoneOffset * 60000;

        const nowISO = new Date(now).toISOString();

        const from = new Date(now);
        from.setFullYear(from.getFullYear() - 1);
        const fromISO = from.toISOString();

        const response = await axios.post(
            'https://api.github.com/graphql',
            {
                query: "query GetUserContributions($username: String!, $from: DateTime!, $to: DateTime!)" +
                    "{ user(login: $username) { contributionsCollection(from: $from, to: $to)" +
                    "{ contributionCalendar { weeks { contributionDays { date contributionCount } } } } } }",
                variables: {
                    username: username,
                    from: fromISO,
                    to: nowISO
                }
            },
            {
                headers: { Authorization: `Bearer ${process.env.GITHUB}` },
                validateStatus: () => true
            }
        );
        if (response.status !== 200 || !response.data.data.user) return null;

        const data = response.data as GithubStreak;
        const days = data.data.user.contributionsCollection.contributionCalendar.weeks.flatMap(week =>
            week.contributionDays.map(val => val.contributionCount)
        );

        let streak_start = -1;
        let streak_end = -1;
        let longest_streak = 0;

        for (let i = 0; i < days.length; i++) {
            const day = days[i];

            if (day !== 0) {
                if (streak_start === -1) {
                    streak_start = i;
                    streak_end = i;
                }
                streak_end = i;
                longest_streak = Math.max(longest_streak, streak_end - streak_start);
            } else {
                if (i !== days.length - 1) {
                    streak_start = -1;
                    streak_end = -1;
                }
            }
        }
        const streak_days = streak_end - streak_start;
        const result = {
            streak: streak_days,
            longest: longest_streak
        }

        await this.cacheManager.set(`streak:${username}`, JSON.stringify(result), 1000 * 60 * 60);
        return result;
    }

    async getWakatimeGlobal(path: string): Promise<WakatimeGlobal | null> {
        const cache = await this.cacheManager.get<string>(`waka_global:${path}`);

        if (cache) {
            return JSON.parse(cache);
        }

        const response = await axios.get(`https://wakatime.com/share${path}`, { validateStatus: () => true });

        if (response.status !== 200) {
            return null;
        }

        await this.cacheManager.set(`waka_global:${path}`, JSON.stringify(response.data), 1000 * 60 * 60);
        return response.data;
    }

    async getWakatimeLanguages(path: string): Promise<WakatimeLanguages | null> {
        const cache = await this.cacheManager.get<string>(`waka_langs:${path}`);

        if (cache) {
            return JSON.parse(cache);
        }

        const response = await axios.get(`https://wakatime.com/share${path}`, { validateStatus: () => true });

        if (response.status !== 200) {
            return null;
        }

        await this.cacheManager.set(`waka_langs:${path}`, JSON.stringify(response.data), 1000 * 60 * 60);
        return response.data;
    }

    async getWeather(api: string, query: string): Promise<WeatherResponse | null> {
        const cache = await this.cacheManager.get<string>(`weather:${query}`);

        if (cache) {
            return JSON.parse(cache);
        }

        const response = await axios.get(`${api}${query}`, { validateStatus: () => true });

        if (response.status !== 200) {
            return null;
        }

        await this.cacheManager.set(`weather:${query}`, JSON.stringify(response.data), 1000 * 60 * 30);
        return response.data;
    }

    async getActivity(api: string, id: string): Promise<ActivityResponse | null> {
        const cache = await this.cacheManager.get<string>(`activity:${id}`);

        if (cache) {
            return JSON.parse(cache);
        }

        const response = await axios.get(`${api}${id}`, { validateStatus: () => true });

        if (response.status !== 200) {
            return null;
        }

        await this.cacheManager.set(`activity:${id}`, JSON.stringify(response.data), 1000 * 60);
        return response.data;
    }
}

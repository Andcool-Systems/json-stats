interface GithubRepos {
    data: {
        user: {
            followers: {
                totalCount: number;
            };
            name: string;
            login: string;
            repositories: {
                nodes: {
                    name: string;
                    owner: {
                        login: string;
                    };
                    stargazerCount: number;
                    isPrivate: boolean;
                }[];
            };
        };
    };
    total_stars: number;
}

interface GithubStreak {
    data: {
        user: {
            contributionsCollection: {
                contributionCalendar: {
                    weeks: {
                        contributionDays: {
                            date: string;
                            contributionCount: number;
                        }[];
                    }[];
                };
            };
        };
    };
}

interface WakatimeGlobal {
    data: {
        best_day: {
            date: string;
            text: string;
            total_seconds: number;
        };
        grand_total: {
            daily_average: number;
            daily_average_including_other_language: number;
            human_readable_daily_average: string;
            human_readable_daily_average_including_other_language: string;
            human_readable_total: string;
            human_readable_total_including_other_language: string;
            total_seconds: number;
            total_seconds_including_other_language: number;
        };
        range: {
            start: string;
            end: string;
            range: string;
            days_including_holidays: number;
            days_minus_holidays: number;
            holidays: number;
        };
    };
}

interface WakatimeLanguages {
    data: {
        name: string;
        percent: string;
        color: string;
        decimal: string;
        digital: string;
        hours: string;
        minutes: string;
        text: string;
        total_seconds: number;
    }[];
}

interface WeatherResponse {
    temp: number;
    condition: string;
}

interface ActivityResponse {
    statusCode: number;
    activities: {
        id: number;
        workplace: string | null;
        file: string | null;
        editor: string;
        editor_code: string;
        debugging: boolean;
        start_time: Date;
    }[];
}

interface UserReg {
    data: {
        user: {
            createdAt: Date;
        };
    };
}

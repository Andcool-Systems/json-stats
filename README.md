# JSON Stats Widget
Виджет для профиля GitHub, выполненный в стиле редактора кода VSCode.

## Конфигурация
Так как объем настроек слишком большой, на данный момент не предоставляется возможности публичного использования, поэтому если вы хотите настроить такое виджет под себя, то вам придется размещать его на своем сервере.    

Все параметры находятся в `.env` файле в корне проекта.

```DockerFile
GITHUB="<github_token>"
GITHUB_USERNAME="<github_username>"

DESCRIPTION="Your description"

WAKATIME_GLOBAL="/@AndcoolSystems/c20041f4-a965-47c3-ac36-7234e622a980.json" // WakaTime Global stats
WAKATIME_LANGS="/@AndcoolSystems/eaa20c39-4e68-49d3-8760-93e93fbf1ff5.json" // WakaTime Langs stats

WEATHER_API="https://weather.andcool.ru/api" // Path for weather API
WEATHER_QUERY="/?place=andcool&language=en&json=true"  // Query for weather API

ACTIVITY_API="https://activity.andcool.ru/" // Path for activity API
ACTIVITY_ID="t9mdtk" // ID of activity

DATETIME_TIMEZONE="Etc/GMT-3" // Yours timezone
```

`GITHUB` – По этому ключу располагается access токен GitHub. Его можно получить [здесь](https://github.com/settings/tokens); Токен должен иметь права `read:org, repo`.  
`GITHUB_USERNAME` – Имя пользователя в GitHub. Можно найти в адресной строке или под ником GitHub на вашей странице.  
`DESCRIPTION` – Описание виджета. Будет добавлено ключу `description` в json.  
`WAKATIME_GLOBAL`, `WAKATIME_LANGS` – Статистика WakaTime. Можно получить [тут](https://wakatime.com/share/embed). Сгенерируйте типы чартов `Coding Activity` и `Languages` соответственно в формате JSON и вставьте их в соответствующие ключи в конфиге (исключая `https://wakatime.com/share`).

`WEATHER_API`, `WEATHER_QUERY` – URL и запрос для API погоды. Используется проект [weather.andcool.ru](https://weather.andcool.ru)  
`ACTIVITY_API`, `ACTIVITY_ID` – URL и ID для API активности. Используется проект [activity.andcool.ru](https://github.com/Andcool-Systems/Andcool-Activity)

`DATETIME_TIMEZONE` – Часовой пояс в формате JavaScript Date.

## Быстрый старт
Для начала работы клонируйте этот репозиторий, создайте `.env` файл с конфигурацией и запустите Docker контейнер.
```bash
git clone https://github.com/Andcool-Systems/json-stats.git
cd json-stats

docker compose build
docker compose up -d
```

## Пример
<a href="https://github.com/Andcool-Systems/json-stats">
<img src="https://json-stats.andcool.ru" alt="JSON Stats" />
</a>

---
**by AndcoolSystems, 19 December, 2024**
export const MONITORING_INTERVAL_MS = 5 * 60 * 1000;
export const MONITORING_JITTER_MS = 60 * 1000;
export const INTER_ACCOUNT_DELAY_MS = 2000;
export const STORAGE_FILE_PATH = './data/storage.json';

export const INSTA_STORIES_BASE_URL = 'https://insta-stories.io/content.php';
export const INSTA_STORIES_HEADERS = {
  accept: '*/*',
  'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
  referer: 'https://insta-stories.io/en/',
  'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
};

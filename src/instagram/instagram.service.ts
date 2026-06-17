import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { StoryItem } from '../common/interfaces/types';
import { INSTA_STORIES_BASE_URL, INSTA_STORIES_HEADERS } from '../common/constants';

interface InstaStoriesResponse {
  status: string;
  html?: string;
  username?: string;
  full_name?: string;
  source?: string;
  msg?: string;
}

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  async fetchStories(username: string): Promise<StoryItem[]> {
    try {
      const requestConfig = {
        params: { url: username, method: 'allstories' },
        headers: INSTA_STORIES_HEADERS,
        timeout: 30000,
      };

      let response = await axios.get<InstaStoriesResponse>(
        INSTA_STORIES_BASE_URL,
        requestConfig,
      );

      let data = response.data;

      if (data.status === 'ok' && data.source !== 'GetAllStories') {
        this.logger.log(`Got ${data.source} for @${username}, retrying for stories...`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        response = await axios.get<InstaStoriesResponse>(
          INSTA_STORIES_BASE_URL,
          requestConfig,
        );
        data = response.data;
      }

      if (data.status !== 'ok' || !data.html) {
        return [];
      }

      if (data.source && data.source !== 'GetAllStories') {
        this.logger.warn(`Still got ${data.source} for @${username} after retry, skipping`);
        return [];
      }

      return this.parseStoriesHtml(data.html, username);
    } catch (err) {
      this.logger.error(`Failed to fetch stories for @${username}: ${(err as Error).message}`);
      return [];
    }
  }

  async downloadMedia(mediaUrl: string): Promise<Buffer> {
    if (!mediaUrl || (!mediaUrl.startsWith('http://') && !mediaUrl.startsWith('https://'))) {
      throw new Error(`Invalid media URL: "${mediaUrl}"`);
    }

    const response = await axios.get<ArrayBuffer>(mediaUrl, {
      headers: INSTA_STORIES_HEADERS,
      responseType: 'arraybuffer',
      timeout: 60000,
    });
    return Buffer.from(response.data);
  }

  private parseStoriesHtml(html: string, username: string): StoryItem[] {
    const $ = cheerio.load(html);
    const stories: StoryItem[] = [];
    const seenIds = new Set<string>();

    $('a#download-video, a[id="download-video"]').each((_, el) => {
      const downloadHref = $(el).attr('href') || '';
      if (!downloadHref) return;

      const storyId = this.extractStoryId(downloadHref, username);
      if (!storyId || seenIds.has(storyId)) return;
      seenIds.add(storyId);

      const container = $(el).closest('.col-md-4, [class*="col-md"]');

      const imgSrc = container.find('.load img').attr('src') || '';
      const videoSrc = container.find('video').attr('src') || '';

      const mediaUrl = downloadHref || videoSrc || imgSrc;
      if (!mediaUrl) return;

      const decodedUrl = decodeURIComponent(downloadHref || mediaUrl);
      const isVideo = decodedUrl.toLowerCase().includes('.mp4');

      const timestamp = container.find('small').first().text().trim() || undefined;

      stories.push({
        storyId,
        mediaUrl,
        mediaType: isVideo ? 'video' : 'photo',
        username,
        timestamp,
      });
    });

    return stories;
  }

  private extractStoryId(downloadHref: string, username: string): string | null {
    if (!downloadHref) return null;
    try {
      const url = new URL(downloadHref.startsWith('http') ? downloadHref : `https://insta-stories.io${downloadHref}`);
      const nameParam = url.searchParams.get('name');
      if (nameParam) {
        const parts = nameParam.split('_');
        const id = parts[parts.length - 1];
        if (id && /^\d+$/.test(id)) return id;
      }
    } catch {
      const match = /name=insta-stories\.io_Instagram_[^_]+_(\d+)/.exec(downloadHref);
      if (match) return match[1];
    }
    return null;
  }
}

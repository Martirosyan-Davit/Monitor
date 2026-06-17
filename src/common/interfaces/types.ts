export interface StoryItem {
  storyId: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  username: string;
  timestamp?: string;
}

export interface StorageData {
  chatId: number | null;
  monitoredAccounts: string[];
  sentStoryIds: Record<string, string[]>;
}

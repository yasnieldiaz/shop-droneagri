import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const NEWSLETTER_FILE = path.join(DATA_DIR, 'newsletter-subscribers.json');

export interface NewsletterSubscriber {
  id: string;
  email: string;
  locale: string;
  active: boolean;
  createdAt: string;
}

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(NEWSLETTER_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeSubscribers(subscribers: NewsletterSubscriber[]) {
  await ensureDataDir();
  await fs.writeFile(NEWSLETTER_FILE, JSON.stringify(subscribers, null, 2));
}

export async function subscribeToNewsletter(
  email: string,
  locale: string = 'pl'
): Promise<{ success: boolean; message: string; isNew: boolean }> {
  const subscribers = await readSubscribers();

  const existingIndex = subscribers.findIndex(
    (s) => s.email.toLowerCase() === email.toLowerCase()
  );

  if (existingIndex !== -1) {
    const existing = subscribers[existingIndex];
    if (existing.active) {
      return {
        success: true,
        message: 'already_subscribed',
        isNew: false,
      };
    } else {
      // Reactivate subscription
      subscribers[existingIndex].active = true;
      subscribers[existingIndex].locale = locale;
      await writeSubscribers(subscribers);
      return {
        success: true,
        message: 'reactivated',
        isNew: false,
      };
    }
  }

  // New subscription
  const newSubscriber: NewsletterSubscriber = {
    id: `nl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    email: email.toLowerCase(),
    locale,
    active: true,
    createdAt: new Date().toISOString(),
  };

  subscribers.push(newSubscriber);
  await writeSubscribers(subscribers);

  return {
    success: true,
    message: 'subscribed',
    isNew: true,
  };
}

export async function unsubscribeFromNewsletter(
  email: string
): Promise<{ success: boolean; message: string }> {
  const subscribers = await readSubscribers();

  const existingIndex = subscribers.findIndex(
    (s) => s.email.toLowerCase() === email.toLowerCase()
  );

  if (existingIndex === -1) {
    return {
      success: false,
      message: 'not_found',
    };
  }

  subscribers[existingIndex].active = false;
  await writeSubscribers(subscribers);

  return {
    success: true,
    message: 'unsubscribed',
  };
}

export async function getAllSubscribers(): Promise<NewsletterSubscriber[]> {
  return readSubscribers();
}

export async function getActiveSubscribers(): Promise<NewsletterSubscriber[]> {
  const subscribers = await readSubscribers();
  return subscribers.filter((s) => s.active);
}

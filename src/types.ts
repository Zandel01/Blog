export type SectionType = 'text' | 'image' | 'video';
export type Alignment = 'left' | 'center' | 'right';
export type LayoutMode = 'standard' | 'side-by-side';

export interface BlogItem {
  id: string;
  type: SectionType;
  content: string; // text content, image URL, or video URL
  title?: string;
  subheading?: string; // New field for images/videos
  description?: string; // New field for images/videos
  secondaryContent?: string; // for side-by-side layout
  isHidden?: boolean;
  size: number; // 0-100
  fontSize?: number; // 0-100 for text sections
  alignment: Alignment;
  layout: LayoutMode;
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'tiktok' | 'instagram' | 'twitter' | 'github';
  url: string;
}

export interface BlogTheme {
  backgroundColor: string;
  backgroundImage?: string;
  profileImage: string;
  profileCoverImage?: string;
  profileName: string;
  profileDesignation: string;
  profileBio: string;
  fontFamily: string;
  hue: number;
  typewriterColor?: string;
  logoText: string;
  bannerMessages: string[];
  bannerBgColor: string;
  footerText: string;
}

export const DEFAULT_THEME: BlogTheme = {
  backgroundColor: '#FFFDF0',
  profileImage: 'https://picsum.photos/seed/zandel/500/500',
  profileCoverImage: 'https://picsum.photos/seed/cover/1200/400',
  profileName: 'Zandel Ragay',
  profileDesignation: 'BTVTED-ELEXT 3C',
  profileBio: 'Passionately exploring the intersections of electronics, pedagogy, and modern design within the BTVTED-ELEXT course.',
  fontFamily: 'font-sans',
  hue: 0,
  typewriterColor: '#ffffff',
  logoText: 'Z.R',
  bannerMessages: [
    "Hello everyone, welcome to my blog!",
    "Explore my latest design projects.",
    "Stay tuned for BTVTED-ELEXT updates!"
  ],
  bannerBgColor: '#40E0D0', // Secondary color
  footerText: 'Blog by Zandel Ragay © 2026'
};

export const DEFAULT_BLOG_DATA: BlogItem[] = [
  {
    id: '1',
    type: 'text',
    title: 'About Me',
    content: 'Hi! I am Zandel, a passionate student and explorer. Welcome to my personal space where I share my journey.',
    size: 100,
    fontSize: 50,
    alignment: 'center',
    layout: 'standard',
  },
  {
    id: '2',
    type: 'image',
    title: 'My Workspace',
    content: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop',
    size: 80,
    alignment: 'center',
    layout: 'standard',
  },
];

export const DEFAULT_SOCIALS: SocialLink[] = [
  { id: 's1', platform: 'facebook', url: 'https://facebook.com' },
  { id: 's2', platform: 'tiktok', url: 'https://tiktok.com' },
];

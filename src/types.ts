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

export interface BlogSite {
  id: string;
  name: string;
  blogData: BlogItem[];
  theme: BlogTheme;
  socials: SocialLink[];
  updatedAt: number;
}

export interface AppData {
  sites: BlogSite[];
  currentSiteId: string;
}

export const DEFAULT_THEME: BlogTheme = {
  backgroundColor: '#FFFDF0',
  profileImage: 'input_file_0.png',
  profileCoverImage: 'input_file_1.png',
  profileName: 'Zandel Ragay',
  profileDesignation: 'group member',
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
    title: 'The impact of ICT (Information and Communication Technology) in terms of communication',
    content: 'The impact of ICT (Information and Communication Technology) in terms of communication has been significant and transformative. ICT has made communication faster, easier, and more accessible across the world. Through tools like smartphones, social media platforms, emails, and messaging apps, people can instantly connect with others regardless of distance. This has improved both personal and professional communication by allowing real-time interaction, quick sharing of information, and collaboration. In addition, ICT has expanded the ways people communicate by introducing multimedia formats such as video calls, voice messages, and interactive content. This makes communication more engaging and effective compared to traditional methods. It has also helped businesses, schools, and organizations operate more efficiently by enabling virtual meetings, online learning, and remote work. However, ICT also has some challenges. Miscommunication can happen due to lack of face-to-face interaction, and overreliance on technology may reduce personal connections. There are also concerns about privacy, security, and the spread of misinformation. Overall, ICT plays a vital role in modern communication by improving speed, reach, and convenience, while also presenting new challenges that need to be managed responsibly.',
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
  {
    id: 'ict-positive',
    type: 'image',
    title: 'Positive Impact of ICT',
    subheading: 'Revolutionizing Communication',
    content: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop',
    description: 'ICT has bridged geographical gaps, allowing instant connection through video conferencing, social media, and messaging apps. It facilitates global collaboration and real-time information sharing.',
    size: 90,
    alignment: 'center',
    layout: 'side-by-side',
    secondaryContent: 'Enhanced connectivity and collaboration through digital platforms have transformed how we interact personally and professionally.',
  },
    {
    id: 'ict-negative',
    type: 'image',
    title: 'Negative Impact of ICT',
    subheading: 'Digital Divide & Risks',
    content: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
    description: 'Despite its benefits, ICT contributes to social isolation, privacy concerns, and the spread of misinformation. The digital divide remains a challenge, leaving some populations without essential access.',
    size: 90,
    alignment: 'center',
    layout: 'side-by-side',
    secondaryContent: 'Challenges such as cyberbullying, data breaches, and reduced face-to-face interaction require careful navigation in the digital age.',
  },
];

export const DEFAULT_SOCIALS: SocialLink[] = [
  { id: 's1', platform: 'facebook', url: 'https://facebook.com' },
  { id: 's2', platform: 'tiktok', url: 'https://tiktok.com' },
];

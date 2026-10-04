/** Typed content model. JSON in /content/{locale} must match these shapes. */

export interface Link { text: string; href: string }
export interface RichText { text: string; links?: Link[] }
export interface Img { src: string; alt: string; width: number; height: number }
export interface Video { src: string; poster?: Img | null }

export interface Seo { title: string; description: string; ogImage?: string }

export interface Hero {
  title: string;
  eyebrow?: string;
  lead?: string | null;
  intro?: RichText[];
  image?: Img;
  video?: Video;
  cta?: Link;
}

export interface Section {
  heading: string;
  paragraphs: RichText[];
  images?: Img[];
  layout?: 'gallery';
}

export interface FaqItem { question: string; answer: RichText[] }

interface PageBase {
  slug: string;
  seo: Seo;
  hero: Hero;
  sections?: Section[];
  faq?: FaqItem[];
}

export interface ContentPage extends PageBase { template: 'content' | 'legal' }

export interface Fact { icon: IconName; label: string; value: string; sub?: string }
export type IconName = 'age' | 'clock' | 'depth' | 'sun' | 'group' | 'wave';

export interface ExperiencePage extends PageBase {
  template: 'experience';
  experience: {
    activityId: string;
    booking: import('@/config/links').BookingKey;
    priceIds: string[];
    facts: Fact[];
    youtube?: string;
    priceNote?: string;
    phoneHours?: string;
    goodToKnow: string[]; // FAQ questions promoted to callouts
    documents: Link[];
    idNote?: string;
    related: string[];
    primaryBookingText?: string;
    secondaryBooking?: { text: string; booking: import('@/config/links').BookingKey };
  };
}

export interface EventsPage extends PageBase {
  template: 'events';
  albums: { title: string; href: string; cover?: Img }[];
  galleryLink: Link;
}

export interface MapPage extends PageBase {
  template: 'map';
  map: { image: Img; instructions: string; hotspots: { id: number; label: string; title: string; xPct: number; yPct: number; popup: Img | null }[] };
}

export interface MenuItem { name: string; description: string; price: string }
export interface MenuGroup { title: string; items: MenuItem[]; notes?: string[]; list?: string[] }
export interface MenuPage extends PageBase {
  template: 'menu';
  menu: { sections: { id: string; title: string; note?: string; image?: Img; groups: MenuGroup[] }[]; footer: string[] };
}

export interface HomeCard {
  slug: string;
  title: string;
  text: string;
  image: Img;
  chips?: { icon: IconName; text: string }[];
  priceIds?: string[];
  booking?: import('@/config/links').BookingKey;
}

export interface HomePage extends PageBase {
  template: 'home';
  facts: { label: string; value?: string; priceIds?: string[]; note: string }[];
  experiences: { heading: string; cards: HomeCard[] };
  about: { heading: string; text: string; link: Link; image: Img };
  more: HomeCard[];
  visit: { notice: string; image: Img };
}

export type Page = ContentPage | ExperiencePage | EventsPage | MapPage | MenuPage | HomePage;

export interface NavItem { label: string; href: string; parent?: string }
export interface Site {
  name: string;
  logo: Img;
  nav: NavItem[];
  footer: { columns: { titleKey: string; items: string[] }[]; phoneLabel: string; privacyLabel: string };
  organization: Record<string, unknown> & { geo?: { latitude: number; longitude: number } };
}

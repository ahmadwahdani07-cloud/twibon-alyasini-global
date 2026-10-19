import './globals.css';
import type { Metadata } from 'next';
import { SantriMediaAssistant } from './santri-media-assistant';
export const metadata: Metadata = { title: 'Al-Yasini Twibbon Center', description: 'Pusat twibbon resmi Pondok Pesantren Terpadu Al-Yasini.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="id"><body>{children}<SantriMediaAssistant /></body></html>; }

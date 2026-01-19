import fs from 'fs';
import path from 'path';
import BrabantRenderer from '@/components/BrabantRenderer';

export default function Page() {
  // Adjust the filename if your HTML file is named differently or located elsewhere (e.g. 'data/brabant.html')
  const filePath = path.join(process.cwd(), 'public', 'www.brabantsedelta.nl/index.html');
  let htmlContent = '';

  if (fs.existsSync(filePath)) {
    htmlContent = fs.readFileSync(filePath, 'utf8');

    // Remove scripts to prevent hydration errors and DOM manipulation
    htmlContent = htmlContent.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
  }

  return (
    <main style={{ width: '100vw', minHeight: '100vh', overflowX: 'hidden' }}>
      <BrabantRenderer htmlContent={htmlContent} />
    </main>
  );
}
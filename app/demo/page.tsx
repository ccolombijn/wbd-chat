import fs from 'fs';
import path from 'path';
import BrabantRenderer from '@/components/BrabantRenderer';

export default function Page() {

  const filePath = path.join(process.cwd(), 'public', 'www.brabantsedelta.nl/index.html');
  let htmlContent = '';

  if (fs.existsSync(filePath)) {
    htmlContent = fs.readFileSync(filePath, 'utf8');


    htmlContent = htmlContent.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
  }

  return (
    <main style={{ width: '100vw', minHeight: '100vh', overflowX: 'hidden' }}>
      <BrabantRenderer htmlContent={htmlContent} />
    </main>
  );
}
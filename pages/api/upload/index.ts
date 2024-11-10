import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// 업로드 디렉토리가 없으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFiles: 10,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const fileArray = files.file;
    if (!fileArray) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
    const fileName = path.basename(file.filepath);
    const fileUrl = `/uploads/${fileName}`;

    res.status(200).json({ 
      urls: [fileUrl],
      message: 'File uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Upload failed',
      error: error instanceof Error ? error.message : error 
    });
  }
} 
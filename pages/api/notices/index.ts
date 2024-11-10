import { NextApiRequest, NextApiResponse } from 'next';
import { queryDatabase } from '@/lib/db';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { exposureType } = req.query;

      let query = `
        SELECT id, title, content, exposure_type, board_ids, 
        DATE_FORMAT(expire_date, '%Y-%m-%d') as expire_date,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at 
        FROM notices 
        WHERE 1=1
      `;

      const params: (string | number | null)[] = [];

      if (exposureType) {
        if (exposureType === 'NONE') {
          query += ` AND exposure_type = 'NONE'`;
        } else if (exposureType === 'ALL') {
          query += ` AND exposure_type = 'ALL'`;
        } else {
          // 특정 게시판이 선택된 경우
          const boardId = await queryDatabase(
            'SELECT id FROM boards WHERE name = ? AND is_deleted = 0',
            [exposureType]
          );
          
          if (boardId && boardId.length > 0) {
            query += ` AND (exposure_type = 'ALL' OR (exposure_type = 'SELECTED' AND JSON_CONTAINS(board_ids, ?)))`;
            params.push(JSON.stringify([boardId[0].id]));
          }
        }
      }

      query += ' ORDER BY created_at DESC';

      const notices = await queryDatabase(query, params);
      
      res.status(200).json(notices);
    } catch (error) {
      console.error('Error fetching notices:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFiles: 10,
        maxFileSize: 10 * 1024 * 1024,
        multiples: true,
      });

      const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      const fileUrls = [];
      if (files.files) {
        const fileArray = Array.isArray(files.files) ? files.files : [files.files];
        for (const file of fileArray) {
          const fileName = path.basename(file.filepath);
          fileUrls.push(`/uploads/${fileName}`);
        }
      }

      const result = await queryDatabase<{ insertId: number }>(
        `INSERT INTO notices (
          title, content, exposure_type, board_ids, 
          expire_date, file_urls, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          fields.title?.toString() || '',
          fields.content?.toString() || '',
          fields.exposure_type?.toString() || 'NONE',
          fields.board_ids ? fields.board_ids.toString() : null,
          fields.expire_date?.toString() || null,
          JSON.stringify(fileUrls)
        ]
      );

      const insertId = result[0]?.insertId;

      if (!insertId) {
        throw new Error('Failed to create notice');
      }

      res.status(201).json({ 
        message: 'Notice created successfully',
        id: insertId,
        fileUrls 
      });
    } catch (error) {
      console.error('Error creating notice:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 
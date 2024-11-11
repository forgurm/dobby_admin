import { NextApiRequest, NextApiResponse } from 'next';
import { queryDatabase, QueryResult, querySingleResult } from '@/lib/db';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

interface Notice extends QueryResult {
  id: number;
  title: string;
  content: string;
  exposure_type: string;
  board_ids: string | null;
  file_urls: string | null;
  expire_date: string | null;
  created_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const noticeId = Array.isArray(id) ? id[0] : id;

  if (!noticeId) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  if (req.method === 'GET') {
    try {
      const result = await queryDatabase<Notice>(
        `SELECT n.id, n.title, n.content, n.exposure_type, n.board_ids, 
         n.file_urls,
         DATE_FORMAT(n.expire_date, '%Y-%m-%d') as expire_date,
         DATE_FORMAT(n.created_at, '%Y-%m-%d %H:%i:%s') as created_at 
         FROM notices n WHERE n.id = ?`,
        [noticeId]
      );
      
      if (!result || result.length === 0) {
        return res.status(404).json({ message: 'Notice not found' });
      }
      
      const notice = result[0];
      if (notice.file_urls && typeof notice.file_urls === 'string') {
        notice.file_urls = JSON.parse(notice.file_urls);
      }
      
      res.status(200).json(notice);
    } catch (error) {
      console.error('Error fetching notice:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : error 
      });
    }
  } else if (req.method === 'PUT') {
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

      const newFileUrls = [];
      if (files.files) {
        const fileArray = Array.isArray(files.files) ? files.files : [files.files];
        for (const file of fileArray) {
          const fileName = path.basename(file.filepath);
          newFileUrls.push(`/uploads/${fileName}`);
        }
      }

      let existingFileUrls: string[] = [];
      if (fields.existing_files) {
        try {
          existingFileUrls = JSON.parse(fields.existing_files.toString());
        } catch (error) {
          console.error('Error parsing existing files:', error);
        }
      }

      const combinedFileUrls = [...existingFileUrls, ...newFileUrls];

      const title = fields.title?.toString() || '';
      const content = fields.content?.toString() || '';
      const exposure_type = fields.exposure_type?.toString() || '';
      const board_ids = fields.board_ids ? JSON.parse(fields.board_ids.toString()) : null;
      const expire_date = fields.expire_date?.toString() || null;

      const result = await queryDatabase(
        `UPDATE notices 
         SET title = ?, 
             content = ?, 
             exposure_type = ?,
             board_ids = ?,
             expire_date = ?,
             file_urls = ?,
             updated_at = NOW() 
         WHERE id = ?`,
        [
          title,
          content,
          exposure_type,
          board_ids ? JSON.stringify(board_ids) : null,
          expire_date,
          JSON.stringify(combinedFileUrls),
          noticeId
        ]
      );

      res.status(200).json({ 
        message: 'Notice updated successfully',
        fileUrls: combinedFileUrls
      });
    } catch (error) {
      console.error('Error updating notice:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : error 
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      const result = await querySingleResult<QueryResult>(
        'DELETE FROM notices WHERE id = ?',
        [noticeId]
      );
      console.log(result);
      res.status(200).json({ message: '공지사항 삭제 성공' });
    } catch (error) {
      console.error('Error deleting notice:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : error 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'forgurm.iptime.org',
  user: 'forgurm',
  password: 'asdfqwer1!',
  database: 'tpsl',
  charset: 'utf8mb4'
});

export type User = {
  no: number;
  emailid: string;
  name: string;
  phone: string;
  add1: string;
  add2: string | null;
  referral_exchange: string | null;
  referral_code: string | null;
  lv: number;
  status: string;
  memo: string | null;
  creat_dt: Date;
  update_dt: Date;
  password?: string;
};
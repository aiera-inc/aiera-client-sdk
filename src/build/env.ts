import path from 'path';
import dotenv from 'dotenv';
dotenv.config({
    path: path.join(process.cwd(), `${process.env.NODE_ENV || 'development'}.env`),
});

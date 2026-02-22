import dotenv from 'dotenv';

dotenv.config();

export default {
    port:           process.env.PORT || 3000,

    dbPassword:     process.env.DB_PASSWORD,
    dbUsername:     process.env.DB_USERNAME,
    dbHost:         process.env.DB_HOST || 'localhost'
}
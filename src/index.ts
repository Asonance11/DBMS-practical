import cors from 'cors';
import express from 'express';
import apiRoute from './routes/api';

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use('/api', apiRoute);

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});

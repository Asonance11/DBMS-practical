import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { Certification } from '../models/certification';

export const getAllCertifications = async (
	_req: Request,
	res: Response
): Promise<void> => {
	try {
		const [rows] = await pool.query<RowDataPacket[]>(
			'SELECT * FROM Certifications'
		);
		res.json(rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export const getCertificationById = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { id } = req.params;
	try {
		const [rows] = await pool.query<RowDataPacket[]>(
			'SELECT * FROM Certifications WHERE certification_id = ?',
			[id]
		);
		if (rows.length === 0) {
			res.status(404).json({ error: 'Certification not found' });
		} else {
			res.json(rows[0]);
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export const createCertification = async (
	req: Request,
	res: Response
): Promise<void> => {
	const certification: Certification = req.body;
	try {
		const [result] = await pool.query<ResultSetHeader>(
			'INSERT INTO Certifications SET ?',
			[certification]
		);
		certification.certification_id = result.insertId!;
		res.status(201).json(certification);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export const updateCertification = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { id } = req.params;
	const updatedCertification: Certification = req.body;
	try {
		const [result] = await pool.query<ResultSetHeader>(
			'UPDATE Certifications SET ? WHERE certification_id = ?',
			[updatedCertification, id]
		);
		if (result.affectedRows === 0) {
			res.status(404).json({ error: 'Certification not found' });
			return;
		}

		try {
			await pool.query<ResultSetHeader>(
				'UPDATE CareerCertifications SET certification_id = ? WHERE certification_id = ?',
				[updatedCertification.certification_id, id]
			);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}
		res.json(updatedCertification);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export const deleteCertification = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { id } = req.params;
	try {
		const [result] = await pool.query<ResultSetHeader>(
			'DELETE FROM Certifications WHERE certification_id = ?',
			[id]
		);
		if (result.affectedRows === 0) {
			res.status(404).json({ error: 'Certification not found' });
		} else {
			res.status(204).send();
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

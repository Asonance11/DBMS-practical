import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { Career } from '../models/career';

export const getAllCareers = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Careers');
		res.json(rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export const getCareerById = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { id } = req.params;
	try {
		const [careerRows] = await pool.query<RowDataPacket[]>(
			'SELECT * FROM Careers WHERE career_id = ?',
			[id]
		);

		if (careerRows.length === 0) {
			res.status(404).json({ error: 'Career not found' });
			return;
		}

		const career = careerRows[0];

		const [skillRows] = await pool.query<RowDataPacket[]>(
			'SELECT s.* FROM Skills s INNER JOIN CareerSkills cs ON s.skill_id = cs.skill_id WHERE cs.career_id = ?',
			[id]
		);

		const [certificationRows] = await pool.query<RowDataPacket[]>(
			'SELECT c.* FROM Certifications c INNER JOIN CareerCertifications cc ON c.certification_id = cc.certification_id WHERE cc.career_id = ?',
			[id]
		);

		const careerWithSkillsAndCertifications = {
			...career,
			skills: skillRows,
			certifications: certificationRows,
		};

		res.json(careerWithSkillsAndCertifications);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export const createCareer = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Extract career information from the request body
		const {
			title,
			description,
			salary_range,
			education_requirement,
			skills,
			certifications,
		} = req.body;

		// Start a MySQL transaction
		const connection = await pool.getConnection();
		await connection.beginTransaction();

		try {
			// Insert career information into the Careers table
			const [careerResult] = await connection.execute<ResultSetHeader>(
				'INSERT INTO Careers (title, description, salary_range, education_requirement) VALUES (?, ?, ?, ?)',
				[title, description, salary_range, education_requirement]
			);

			// Get the career_id of the newly inserted career
			const careerId = careerResult.insertId;

			// Insert skills into the CareerSkills table
			if (skills && skills.length > 0) {
				for (const skillId of skills) {
					await connection.execute<ResultSetHeader>(
						'INSERT INTO CareerSkills (career_id, skill_id) VALUES (?, ?)',
						[careerId, skillId]
					);
				}
			}

			// Insert certifications into the CareerCertifications table
			if (certifications && certifications.length > 0) {
				for (const certificationId of certifications) {
					await connection.execute<ResultSetHeader>(
						'INSERT INTO CareerCertifications (career_id, certification_id) VALUES (?, ?)',
						[careerId, certificationId]
					);
				}
			}

			// Commit the transaction
			await connection.commit();

			// Send a success response
			res
				.status(201)
				.json({ success: true, message: 'Career created successfully' });
		} catch (error) {
			// Rollback the transaction in case of an error
			await connection.rollback();
			throw error;
		} finally {
			// Release the MySQL connection
			connection.release();
		}
	} catch (error: any) {
		// Send an error response
		res.status(500).json({ success: false, error: error.message as string });
	}
};

export const updateCareer = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { id } = req.params;
	const updatedCareer: Career = req.body;
	try {
		const [result] = await pool.query<ResultSetHeader>(
			'UPDATE Careers SET ? WHERE career_id = ?',
			[updatedCareer, id]
		);
		if (result.affectedRows === 0) {
			res.status(404).json({ error: 'Career not found' });
		} else {
			res.json(updatedCareer);
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export const deleteCareer = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { id } = req.params;
	try {
		const [result] = await pool.query<ResultSetHeader>(
			'DELETE FROM Careers WHERE career_id = ?',
			[id]
		);
		if (result.affectedRows === 0) {
			res.status(404).json({ error: 'Career not found' });
		} else {
			res.status(204).send();
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

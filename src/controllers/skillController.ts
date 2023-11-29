import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { Skill } from '../models/skill';

export const getAllSkills = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Skills');
		res.json(rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export const getSkillById = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { id } = req.params;
	try {
		const [rows] = await pool.query<RowDataPacket[]>(
			'SELECT * FROM Skills WHERE skill_id = ?',
			[id]
		);
		if (rows.length === 0) {
			res.status(404).json({ error: 'Skill not found' });
		} else {
			res.json(rows[0]);
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export const createSkill = async (
	req: Request,
	res: Response
): Promise<void> => {
	const skill: Skill = req.body;
	try {
		const [result] = await pool.query<ResultSetHeader>(
			'INSERT INTO Skills SET ?',
			[skill]
		);
		skill.skill_id = result.insertId!;
		res.status(201).json(skill);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export const updateSkill = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { id } = req.params;
	const updatedSkill: Skill = req.body;
	try {
		const [result] = await pool.query<ResultSetHeader>(
			'UPDATE Skills SET ? WHERE skill_id = ?',
			[updatedSkill, id]
		);
		if (result.affectedRows === 0) {
			res.status(404).json({ error: 'Skill not found' });
			return;
		}
		try {
			await pool.query<ResultSetHeader>(
				'UPDATE CareerSkills SET skill_id = ? WHERE skill_id = ?',
				[updatedSkill.skill_id, id]
			);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}
		res.json(updatedSkill);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export const deleteSkill = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { id } = req.params;
	try {
		const [result] = await pool.query<ResultSetHeader>(
			'DELETE FROM Skills WHERE skill_id = ?',
			[id]
		);
		if (result.affectedRows === 0) {
			res.status(404).json({ error: 'Skill not found' });
		} else {
			res.status(204).send();
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

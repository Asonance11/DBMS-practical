// models/Career.ts

export interface Career {
	career_id?: number;
	title: string;
	description?: string;
	salary_range?: string;
	education_requirement?: string;
	skills?: number[]; // Array of skill IDs associated with the career
	certifications?: number[]; // Array of certification IDs associated with the career
}

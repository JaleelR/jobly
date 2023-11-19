"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be { title, salary, equity, company_handle  }
     *
     * Returns {  title, salary, equity, company_handle }
     *
     * Throws BadRequestError if company already in database.
     * */

    static async create({ title, salary, equity, company_handle }) {
        const result = await db.query(
            `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle`,
            [
                title,
                salary,
                equity,
                company_handle
            ],
        );
        const job = result.rows[0];

        return job;
    }

    /** Find all jobs with no arguments provided 
     * 
     ** Finds specific jobs based on title, and salary amount 
     * if arguments string, min and/or max are included. (optional)
     * 
     * throws badRequest if min is greater than max 
     * 
     * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
     * */


    static async findAll(string, min, max) {
        let query = `SELECT title,
                  salary,
                  equity,
                  company_handle FROM jobs`;

        let array = [];
        if (string) {
            query += ` WHERE title ILIKE $1`;
            array.push(`%${string}%`)
        };
        if (min > max) throw new BadRequestError(`No job with the amount of ${min}`, 400);

        if (min) {
            query += ` AND salary >= $2`;
            array.push(min);
        };
        if (max) {
            query += ` AND salary <= $3`;
            array.push(max);
        };
        let jobRes = await db.query(query, array);
        return jobRes.rows;
    };


    /** Given a job title, return data about job.
     *
     * Returns { title, salary, equity, company_handle  }
     *   
     * Throws NotFoundError if not found.
     **/

    static async get(title) {
        const jobRes = await db.query(
            `SELECT title,
            salary, equity,
            company_handle 
           FROM jobs
           WHERE title = $1`,
            [title]);

        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No title named: ${title}`);
        return job;
    }

    /** Update company data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: {title, salary, equity, company_handle }
     *
     * Returns {title, salary, equity, company_handle }
     *
     * Throws NotFoundError if not found.
     */

    static async update(title, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
              
            });
        const handleVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs
                      SET ${setCols} 
                      WHERE title = ${handleVarIdx} 
                      RETURNING title, 
                                salary, 
                                equity, 
                                company_handle`;
        const result = await db.query(querySql, [...values, title]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job title: ${title}`);

        return job;
    }

    /** Delete given job from database; returns undefined.
     *
     * Throws NotFoundError if job not found.
     **/

    static async remove(title) {
        const result = await db.query(
            `DELETE
           FROM jobs
           WHERE title = $1
           RETURNING title`,
            [title]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No company: ${title}`);
    }
}


module.exports = Job;

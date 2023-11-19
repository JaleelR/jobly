"use strict";

/** Routes for companies. */
const jsonschema = require("jsonschema");



const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Job = require("../models/job");

const jobUschema = require("../schemas/jobUpdate.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");


const router = new express.Router();


/** POST / { job } =>  { job}
 *
 * company should be { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
    try {
   
        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
    try {
        const { string, min, hasEquity } = req.query;
        const jobs = await Job.findAll(string, min, hasEquity);
        return res.json({ jobs });
    } catch (err) {
        return next(err);
    }
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:title", async function (req, res, next) {
    try {
        const job = await Job.get(req.params.title);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:title", ensureLoggedIn, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUschema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.title, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:title", ensureLoggedIn, async function (req, res, next) {
    try {
        await Job.remove(req.params.title);
        return res.json({ deleted: req.params.title });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;

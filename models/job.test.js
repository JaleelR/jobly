"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "SE",
        salary: 100000,
        equity: 0,
        company_handle: "c1",
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual({
               title: "SE",
            salary: 100000,
            equity: "0",
            company_handle: "c1",
        });
        const result = await db.query(
            `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'SE'`);
        expect(result.rows).toEqual([
            {
                title: "SE",
                salary: 100000,
                equity: "0",
                company_handle: "c1",
            },
        ]);
    });

});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let jobs = await Job.findAll();
       
        expect(jobs).toEqual([
            {
                title: 'Job1',
                salary: 10000,
                equity: "0",
                company_handle: "c1"
            },
            {
                title: "Job2",
                salary: 90000,
                equity: "0",
                company_handle: "c2"
            },
            {
                title: "Job3",
                salary: 300000,
                equity: '0',
                company_handle: "c3"
            },
        ]);
    })
    test("works: with filter, string only  ", async () => {
        let jobs = await Job.findAll("3");

        expect(jobs).toEqual([

            {
                title: "Job3",
                salary: 300000,
                equity: "0",
                company_handle: "c3"
            }
        ])
    })

    test("works: with filter, string and min and max", async () => {
        let jobs = await Job.findAll("J", 10005);

        expect(jobs).toEqual([
            {
                title: "Job2",
                salary: 90000,
                equity: "0",
                company_handle: "c2"
            },
            {
                title: "Job3",
                salary: 300000,
                equity: "0",
                company_handle: "c3"
            }
        
        ])
    })
    test(" Min too big of number, fail", async () => {
      
        const job = await Job.findAll("c", 4, false);
            
        expect(job).toEqual([]);
    })
});




/************************************** get */

describe("get", function () {
    test("works", async function () {
        let job = await Job.get("Job1");
        expect(job).toEqual({
            title: 'Job1',
            salary: 10000,
            equity: "0",
            company_handle: "c1"
        });
    });

    test("not found if no such company", async function () {
        try {
            await Job.get("nope");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});


/************************************** update */

describe("update", function () {
    const updateData = {
        title: "Job3",
        salary: 300000,
        equity: "0",
        company_handle: "c3"
        
    };
    test("works", async function () {
    await Job.update("Job3", updateData);
    const result = await db.query(
        `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'Job3'`)
    expect(result.rows).toEqual([{
        title: "Job3",
        salary: 300000,
        equity: "0",
        company_handle: "c3"
    }]);
    });
    
    test("works: null fields", async function () {
        const updateDataSetNulls = {
            title: "Job3",
            salary: null,
            equity: null,
            company_handle: "c3"
        };
        await Job.update("Job3", updateDataSetNulls);
        const result = await db.query(
            `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'Job3'`)
        expect(result.rows).toEqual([{
            title: "Job3",
            salary: null,
            equity: null,
            company_handle: "c3"
        }]);
    });


    test("not found if no such company", async function () {
        try {
            await Job.update("nope", updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async function () {
        try {
            await Job.update("c1", {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("remove", function () {
    test("works", async function () {
        await Job.remove("Job3");
         const res = await db.query(
            "SELECT title FROM jobs WHERE title='Job3'");
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such jobs", async function () {
        try {
            await Job.remove("nope"); fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token, u1Token2
} = require("./_testCommon");
const { UnauthorizedError } = require("../expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /jobs", function () {
    const newJob = {
        title: "Software Engineer",
        salary: 100000,
        equity: 0,
        company_handle: "c1"
    };

    test("bad for users with no admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob).set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("ok for users with admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u1Token2}`);
        expect(resp.statusCode).toEqual(201);
    });

    test("bad request with missing data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                handle: "new",
                numEmployees: 10,
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("bad request with invalid data", async function () {
        const resp = await request(app)
            .post("/companies")
            .send({
                ...newJob,

            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });
});

/************************************** GET /companies */

describe("GET /jobs", function () {
    test("ok for anon", async function () {
        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        title: "Software Engineer",
                        salary: 10000,
                        equity: "0",
                        company_handle: "c1"
                    },
                    {
                        title: "Product manager",
                        salary: 90000,
                        equity: "0",
                        company_handle: "c2"
                    },
                    {
                        title: "Podcaster",
                        salary: 1000000,
                        equity: "0",
                        company_handle: "c3"
                    },
                    {
                        title: "j1",
                        salary: 500,
                        equity: "0",
                        company_handle: "c3"
                    }
                ],
        });
    });
    test("filtered by name", async function () {
        const resp = await request(app).get("/jobs?string=Pod&min=1000000")
        expect(resp.body).toEqual({
            jobs:
                [{
                    title: "Podcaster",
                    salary: 1000000,
                    equity: "0",
                    company_handle: "c3"
                }
                ],
        });
    });
    test("ok for anon", async function () {
        const resp = await request(app).get("/jobs?string=@");
        expect(resp.body).toEqual({
            jobs:
                [],
        });
    });






    test("fails: test next() handler", async function () {
        // there's no normal failure event which will cause this route to fail ---
        // thus making it hard to test that the error-handler works with it. This
        // should cause an error, all right :)
        await db.query("DROP TABLE jobs CASCADE");
        const resp = await request(app)
            .get("/jobs")
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(500);
    });
});

/************************************** GET /companies/:handle */

describe("GET /jobs/:title", function () {
    test("works for anon", async function () {
        const resp = await request(app).get(`/jobs/j1`);
        expect(resp.body).toEqual({
            job: {
                title: "j1",
                salary: 500,
                equity: "0",
                company_handle: "c3"
            },
        });
    });

    test("works", async function () {
        const resp = await request(app).get(`/jobs/Podcaster`);
        expect(resp.body).toEqual({
            job: {
                title: "Podcaster",
                salary: 1000000,
                equity: "0",
                company_handle: "c3"
            },
        });
    });

    test("not found for no such company", async function () {
        const resp = await request(app).get(`/jobs/nope`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {
    test("Doesn't work for users with no admin", async function () {
        try {
            await request(app)
                .patch(`/jobs/j1`)
                .send({
                    salary: "3000000",
                })
                .set("authorization", `Bearer ${u1Token}`);
        } catch (e) {
            expect(e instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("works for users", async function () {
        const resp = await request(app)
            .patch(`/jobs/j1`)
            .send({
                title: "c1",
            })
            .set("authorization", `Bearer ${u1Token2}`);
        expect(resp.body).toEqual({
            job: {
                title: "c1",
                salary: 500,
                equity: "0",
                company_handle: "c3"
            },
        });
    });


    test("unauth for anon", async function () {
        const resp = await request(app)
            .patch(`/jobs/j1`)
            .send({
                title: "C1-new",
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("not found on no such company", async function () {
        const resp = await request(app)
            .patch(`/jobs/nope`)
            .send({
                salary: "new nope",
            })
            .set("authorization", `Bearer ${u1Token2}`);
        expect(resp.statusCode).toEqual(400);
    });



    test("bad request on invalid data", async function () {
        const resp = await request(app)
            .patch('/jobs/j1')
            .send({
                salary: 100000.12233444,
            })
            .set("authorization", `Bearer ${u1Token2}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /jobs/:title", function () {
    test("works for users", async function () {
        const resp = await request(app)
            .delete(`/jobs/j1`)
            .set("authorization", `Bearer ${u1Token2}`);
        expect(resp.statusCode).toEqual(200);
    });

    test("unauth for anon", async function () {
        try {
            await request(app)
                .delete(`/jobs/j1`);
        } catch (e) {
            expect(e instanceof UnauthorizedError).toBeTruthy()
        }
    });

    test("not found for no such company", async function () {
        const resp = await request(app)
            .delete(`/jobs/nope`)
            .set("authorization", `Bearer ${u1Token2}`);
        expect(resp.statusCode).toEqual(404);
    });
});

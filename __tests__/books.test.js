process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testBook;

beforeEach(async () => {
    //create a book and insert into the DB, set test variable to the inserted.
    let bookRes = await db.query(
        "INSERT INTO allbooks (isbn, amazon_url, author, language, pages, publisher, title, year) VALUES ('12341234', 'amazon.ca/thisis-thebest-book-ever','TestAuthor','English','69','Publishit!','The Best Book Ever','1999') RETURNING *"
    );

    testBook = bookRes.rows[0];
});

afterEach(async () => {
    // delete from the test DB
    await db.query("DELETE FROM allbooks");
});

afterAll(async () => {
    // close the connection
    await db.end();
});

describe("books /GET works", () => {
    test("it should get the books in the DB", async () => {
        const resp = await request(app).get("/books");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ books: [testBook] });
    });

    test("it should get a specific book by ISBN code", async () => {
        const resp = await request(app).get(`/books/${testBook.isbn}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ book: testBook });
    });

    test("it should throw an error if a book doesn't exist", async () => {
        const resp = await request(app).get(`/books/123dfg2342343`);
        expect(resp.statusCode).toBe(404);
    });
});

describe("books /POST works", () => {
    test("it should add a book to the DB", async () => {
        const resp = await request(app).post("/books").send({
            isbn: "1111111",
            amazon_url: "https://www.testurl.com",
            author: "Test1",
            language: "English",
            pages: 10,
            publisher: "publishing house",
            title: "How I write test code - a lesson in awesome",
            year: 1200,
        });
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            books: {
                isbn: "1111111",
                amazon_url: "https://www.testurl.com",
                author: "Test1",
                language: "English",
                pages: 10,
                publisher: "publishing house",
                title: "How I write test code - a lesson in awesome",
                year: 1200,
            },
        });
    });

    test("it should error out if there is missing data", async () => {
        const resp = await request(app).post("/books").send({
            isbn: "1111111",
            author: "Test1",
            language: "English",
            pages: "10",
            publisher: "publishing house",
            title: "How I write test code - a lesson in awesome",
            year: 1200,
        });
        expect(resp.statusCode).toBe(400);
    });
});

describe("books /PUT works", () => {
    test("it should update a book's data", async () => {
        const resp = await request(app).put(`/books/${testBook.isbn}`).send({
            title: "Updated Title",
            pages: 68,
            year: 12345,
        });
        expect(resp.body.book).toHaveProperty("title");
        expect(resp.body.book.year).toBe(12345);
    });
});

describe("books /DELETE works", () => {
    test("it should remove the book by ISBN", async () => {
        const resp = await request(app).delete(`/books/${testBook.isbn}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            message: "Book deleted",
        });
    });
});

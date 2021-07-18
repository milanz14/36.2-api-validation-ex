const express = require("express");
const Book = require("../models/book");
const router = new express.Router();
const bookSchema = require("../schemas/bookSchema.json");
const jsonschema = require("jsonschema");
const ExpressError = require("../expressError");

/** GET / => {books: [book, ...]}  */

router.get("/", async (req, res, next) => {
    try {
        const books = await Book.findAll();
        return res.json({ books });
    } catch (err) {
        return next(err);
    }
});

/** GET /[id]  => {book: book} */

router.get("/:isbn", async (req, res, next) => {
    try {
        const book = await Book.findOne(req.params.isbn);
        return res.json({ book });
    } catch (err) {
        return next(err);
    }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async (req, res, next) => {
    const result = jsonschema.validate(req.body, bookSchema);
    if (!result.valid) {
        let listOfErrors = result.errors.map((e) => e.stack);
        let err = new ExpressError(listOfErrors, 400);
        return next(err);
    }
    const book = await Book.create(req.body);
    return res.status(201).json({ books: book });
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async (req, res, next) => {
    try {
        const book = await Book.update(req.params.isbn, req.body);
        return res.json({ book });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async (req, res, next) => {
    try {
        await Book.remove(req.params.isbn);
        return res.json({ message: "Book deleted" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;

\c books-test

DROP TABLE IF EXISTS allbooks;


CREATE TABLE allbooks (
  isbn TEXT PRIMARY KEY,
  amazon_url TEXT,
  author TEXT,
  language TEXT, 
  pages INTEGER,
  publisher TEXT,
  title TEXT, 
  year INTEGER
);

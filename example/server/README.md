# maktabah server

Before run the server and after installing dependencies. You must create
the database first.

Follow these steps:

  1. Install the schema with:

     `maktabah schema > schema.sql`
     `sqlite3 db.sqlite3 < schema.sql>`

  2. Download some `bok` files from [Shamela](http://shamela.ws)

  3. Install the `bok` file with:

     `maktabah install path/to/book.bok -c > bookname.sql`
     `sqlite3 db.sqlite3 < bookname.sql`

  4. Then run the server with:

     `node index.js`

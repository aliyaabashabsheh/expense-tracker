# Phase 2 - Frontend

The page, connected to the Phase 1 API with fetch. There is no sample data in
the browser: everything comes from PostgreSQL through the server.

## Run it

1. Create the database and run `schema.sql` as in Phase 1.
2. Start the API:

```
cd ..\phase1-backend
npm install
npm start
```

3. Open `index.html` with Live Server (right click the file, "Open with Live Server").
   The page is served from port 5500 and the API from port 3000, which is why
   the server needs CORS.

4. If you have never done this before, the table stays empty until you add an
   expense or run `schema.sql` again for the sample data.

## What the page does

- Shows the total, the number of expenses and the highest one. These count
  every expense, not only the ones left by the filter.
- Adds an expense, checks the fields first, then sends a POST.
- Edits an expense in a modal and sends a PUT.
- Deletes an expense and sends a DELETE.
- Filters the table by category, with an "All" option.
- Shows a spinner while loading and an alert for every error.

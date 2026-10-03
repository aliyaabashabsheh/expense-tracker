# Phase 1 - Backend

The API that stores the expenses in PostgreSQL.

## Run it

1. Create a database called `expense_tracker` in pgAdmin.
2. Open that database and run `schema.sql` (it creates the table and the sample data).
3. Copy `.env.example` to a new file called `.env` and put your PostgreSQL password in `DB_PASSWORD`.
4. `npm install`
5. `npm start`

The server answers at `http://localhost:3000`. Keep the terminal open while you work.

## Endpoints

| Method | Path                  | What it does   | Success | Errors     |
| ------ | --------------------- | -------------- | ------- | ---------- |
| GET    | `/api/expenses`       | All expenses   | 200     | -          |
| GET    | `/api/expenses/:id`   | One expense    | 200     | 404        |
| POST   | `/api/expenses`       | Adds one       | 201     | 400        |
| PUT    | `/api/expenses/:id`   | Updates one    | 200     | 400, 404   |
| DELETE | `/api/expenses/:id`   | Deletes one    | 200     | 404        |

A new expense looks like this:

```json
{
  "title": "Lunch",
  "amount": 4.5,
  "category": "Food",
  "date": "2026-01-15"
}
```

Categories: `Food`, `Transport`, `Bills`, `Entertainment`, `Other`.

## Test it

Open Thunder Client, press New Request, pick the method and the URL. For POST and PUT
use the Body tab with JSON. Take a screenshot of every test, both the success and the
error ones, for the Day 5 submission.

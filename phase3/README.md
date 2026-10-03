#  GitHub link :https://github.com/aliyaabashabsheh/expense-tracker

# Expense Tracker

A web app to keep track of personal expenses. You add an expense, see all of
them in a table, filter them by category, and see the total, the number of
expenses and the highest one. The data lives in PostgreSQL and the page gets
everything from a Node.js and Express API through fetch.

## What it does

- Add an expense: title, amount, category and date, with the fields checked
  before anything is sent.
- Show every expense in a table with the category as a coloured badge.
- Edit an expense in a modal, delete one with a confirmation.
- Filter by category, with an "All" option.
- Search by title, sort by any column, export what you see as a CSV file.
- Three cards for the total, the number of expenses and the highest one, and
  a chart of the spending per category.
- Spinner while loading and a clear message for every error.

## Before you start

You need Node.js, PostgreSQL, and the Live Server extension in VS Code.

## Run it from zero

1. Open pgAdmin and create a database called `expense_tracker`.

2. Open that database, right click, and run `backend/schema.sql`. It creates the
   `expenses` table and adds eight sample expenses. Careful: the file starts by
   deleting the table, so running it again clears what you have.

3. Go to the `backend` folder, copy `.env.example` to a new file called `.env`,
   and put your own PostgreSQL password in `DB_PASSWORD`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=expense_tracker
```

4. Install the packages and start the server:

```
cd backend
npm install
npm start
```

It answers at `http://localhost:3000`. Leave that terminal open.

5. Open `frontend/index.html` with Live Server. The page is on port 5500 and the
   API is on port 3000, which is why the server allows CORS.

## Structure

```
expense-tracker/
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── schema.sql
│   └── .env.example
├── screenshots/
└── README.md
```

## The API

| Method | Path                | What it does | Success | Errors   |
| ------ | ------------------- | ------------ | ------- | -------- |
| GET    | `/api/expenses`     | All expenses | 200     | -        |
| GET    | `/api/expenses/:id` | One expense  | 200     | 404      |
| POST   | `/api/expenses`     | Adds one     | 201     | 400      |
| PUT    | `/api/expenses/:id` | Updates one  | 200     | 400, 404 |
| DELETE | `/api/expenses/:id` | Deletes one  | 200     | 404      |

An expense is:

```json
{
  "id": 1,
  "title": "Lunch",
  "amount": 4.5,
  "category": "Food",
  "date": "2026-01-15"
}
```

The categories are `Food`, `Transport`, `Bills`, `Entertainment` and `Other`.

## Screenshots

Put your screenshots in the `screenshots` folder: the page on a desktop width,
the page on a phone width, the edit modal, and the chart.

## The hardest part

> Replace this with your own experience, and be ready to talk about it in the
> demo. Something honest about where you got stuck and what you did to solve
> it is worth more than a polished paragraph.

Two things were the hardest in this project:

The values coming back from PostgreSQL were not what the page expected. `pg`
gives a `NUMERIC` column back as text, so the total was adding strings and the
chart was broken, and a `DATE` came back as a JavaScript `Date`, which can
change the day. Both are fixed in the query instead of in the page, with
`amount::float8` and `to_char(date, 'YYYY-MM-DD')`.

The other one was knowing when the table is really up to date. Adding a row to
the table by hand after a save looks fine until two people add at the same time
or a request fails halfway. Every add, edit and delete now ends with one
function that asks the server for the list again, so the page can only show
what is really in the database.

## Delivery

Zip the project **without** `node_modules` and **without** `.env`. Both are in
`.gitignore`. Anyone who follows the steps above can run it from the zip alone.

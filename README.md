# 🇹🇷 Türkçe Kurdu

An interactive Turkish language learning app for foreigners, inspired by Duolingo.

## Features

- Vocabulary spelling exercises
- Matching games
- Fill-in-the-blank sentences
- Dialogue completion
- Text-to-Speech pronunciation support
- XP & lives system
- Admin panel for content management (Google Sheets integration)

## Tech Stack

React · TypeScript · Vite · Tailwind CSS

## Getting Started

### 1. Clone the repository
\```bash
git clone https://github.com/dece-0/turkcekurdu.git
cd turkcekurdu
\```

### 2. Install dependencies
\```bash
npm install
\```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:
\```
VITE_ADMIN_USER=your_admin_username
VITE_ADMIN_PASS=your_admin_password
VITE_GOOGLE_SCRIPT_URL=your_google_apps_script_url
VITE_GOOGLE_CSV_URL=your_google_sheets_csv_url
\```

### 4. Start the development server
\```bash
npm run dev
\```

App runs at `http://localhost:3000`

## Contributing

Issues and pull requests are welcome.
Please create a new branch before submitting a PR.

## License

MIT
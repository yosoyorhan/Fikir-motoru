<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Cerevo - AI Chat Application

This is a web-based chat application powered by Google Gemini and Supabase.

## Running the Project Locally

Follow these steps to get your local development environment set up.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

Install the project's dependencies using npm:

```bash
npm install
```

### 3. Set Up Environment Variables

The project requires several environment variables to connect to backend services.

1.  Create a `.env` file in the root of the project by copying the example file:

    ```bash
    cp .env.example .env
    ```

2.  Open the newly created `.env` file and add your credentials for the following services:

    -   `VITE_SUPABASE_URL`: Your Supabase project URL.
    -   `VITE_SUPABASE_ANON_KEY`: Your Supabase project's anonymous (public) key.
    -   `VITE_GEMINI_API_KEY`: Your API key for the Google Gemini API.

    Your `.env` file should look like this:

    ```
    # Supabase
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

    # Google Gemini
    VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```

### 4. Run the Development Server

Once the dependencies are installed and the environment variables are set, you can start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

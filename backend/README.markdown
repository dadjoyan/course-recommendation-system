# Course Recommendation Backend

This is the backend for a course recommendation system designed to help students select courses based on their program, term, previously failed courses, and available time slots. The backend uses FastAPI, LangChain, and Google Gemini AI to process curriculum data and provide course suggestions.

## Project Structure
- `api.py`: Main FastAPI application handling course recommendation logic.
- `curriculum_rag.jsonl`: Curriculum data with course details (e.g., prerequisites, corequisites).
- `rag_ready.json`: Class schedule data used for time-based filtering.
- `requirements.txt`: List of Python dependencies.
- `.env`: Environment variables (e.g., Google API key). *Not tracked in Git*.
- `.gitignore`: Specifies files and directories to ignore in Git.

## Prerequisites
- Python 3.8+
- A Google API key for Gemini AI (set in `.env`).

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the root directory with the following content:
   ```
   GOOGLE_API_KEY=<your-google-api-key>
   JSONL_FILE=curriculum_rag.jsonl
   RAG_FILE=rag_ready.json
   ```

## Running the Server
To start the FastAPI server with hot-reloading for development:
```bash
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

- The server will be available at `http://localhost:8000`.
- API documentation is available at `http://localhost:8000/docs` (Swagger UI).

## API Endpoints
- **POST /get_courses**: Suggests courses based on input data.
  - **Request Body**:
    ```json
    {
      "program": "مهندسی برق",
      "term": 1,
      "course": ["ریاضی 1"],
      "time": {"شنبه": ["08:00-10:00"]}
    }
    ```
  - **Response**: JSON array of recommended courses with details (e.g., course ID, name, units, prerequisites, corequisites, and time).
  - **Example Response**:
    ```json
    [
      {
        "id": "ترم ۱_course_1",
        "name": "برنامه سازی کامپیوتر",
        "units_number": 3,
        "type": "پایه",
        "prerequisites": [],
        "corequisites": [],
        "time": "شنبه 08:00-10:00"
      }
    ]
    ```

## Notes
- Ensure the `.env` file is properly configured with a valid Google API key.
- The `curriculum_rag.jsonl` and `rag_ready.json` files must be present in the root directory.
- For production, remove the `--reload` flag from the `uvicorn` command to improve performance.
- Sensitive data (e.g., `.env`) is ignored by `.gitignore` to prevent accidental exposure on GitHub.

## Troubleshooting
- **Missing dependencies**: Run `pip install -r requirements.txt` to ensure all packages are installed.
- **API key issues**: Verify the `GOOGLE_API_KEY` in `.env` is valid.
- **CORS errors**: The backend allows CORS for `http://localhost:8080`. Update `allow_origins` in `api.py` if the frontend runs on a different port.
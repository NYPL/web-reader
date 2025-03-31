# PDF Server Backend

A simple Flask backend that serves PDF files.

## Setup

1. Create a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Place your PDF files in the `pdfs` directory (it will be created automatically when you run the server)

## Running the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

- `GET /pdf`: Serves the first PDF file found in the `pdfs` directory

## Notes

- The server will automatically create a `pdfs` directory if it doesn't exist
- Place your PDF files in the `pdfs` directory
- The server will serve the first PDF file it finds in the directory

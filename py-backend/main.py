# main.py - FastAPI Backend with .env support
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import google.generativeai as genai
import pandas as pd
import json
import os
import shutil
import zipfile
from typing import List, Optional
from pathlib import Path
import uuid
import io

try:
    # reportlab is optional; if missing, the endpoint will return JSON error asking to install it
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    REPORTLAB_AVAILABLE = True
except Exception:
    REPORTLAB_AVAILABLE = False

# Load environment variables from .env file
load_dotenv()

# Configuration using Pydantic Settings
class Settings(BaseSettings):
    gemini_api_key: str
    gemini_model: str = "gemini-flash-latest"
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Load settings
settings = Settings()

# Initialize FastAPI
app = FastAPI(
    title="EY Data Integration API",
    description="AI-powered data integration using Gemini API",
    version="1.0.0",
    debug=settings.debug
)

# Enable CORS
origins = settings.cors_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel(settings.gemini_model)

# Storage directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Session storage (in production, use Redis or database)
sessions = {}
# Job storage for background merges
jobs = {}

# Job structure example:
# jobs[job_id] = {
#   "status": "queued" | "running" | "success" | "failed",
#   "session_id": session_id,
#   "result": {...},
#   "error": "..."
# }


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "EY Data Integration API",
        "version": "1.0.0",
        "model": settings.gemini_model
    }


@app.post("/api/upload-bundle1")
async def upload_bundle1(files: List[UploadFile] = File(...)):
    """Upload multiple files for Bundle 1"""
    session_id = str(uuid.uuid4())
    session_dir = UPLOAD_DIR / session_id / "bundle1"
    session_dir.mkdir(parents=True, exist_ok=True)
    
    uploaded_files = []
    for file in files:
        file_path = session_dir / file.filename
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        uploaded_files.append(str(file_path))
    
    # Initialize session
    if session_id not in sessions:
        sessions[session_id] = {"bundle1": [], "bundle2": []}
    sessions[session_id]["bundle1"] = uploaded_files
    
    return {
        "status": "success",
        "session_id": session_id,
        "message": f"Uploaded {len(files)} Bundle 1 files",
        "files": [f.filename for f in files]
    }


@app.post("/api/upload-bundle2")
async def upload_bundle2(session_id: str, files: List[UploadFile] = File(...)):
    """Upload multiple files for Bundle 2"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_dir = UPLOAD_DIR / session_id / "bundle2"
    session_dir.mkdir(parents=True, exist_ok=True)
    
    uploaded_files = []
    for file in files:
        file_path = session_dir / file.filename
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        uploaded_files.append(str(file_path))
    
    sessions[session_id]["bundle2"] = uploaded_files
    
    return {
        "status": "success",
        "session_id": session_id,
        "message": f"Uploaded {len(files)} Bundle 2 files",
        "files": [f.filename for f in files]
    }


@app.post("/api/upload-schema1")
async def upload_schema1(session_id: str, files: List[UploadFile] = File(...)):
    """Upload optional schema/documentation files for Bundle 1 (Excel/CSV)."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session_dir = UPLOAD_DIR / session_id / "schema1"
    session_dir.mkdir(parents=True, exist_ok=True)

    uploaded_files = []
    for file in files:
        file_path = session_dir / file.filename
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        uploaded_files.append(str(file_path))

    # attach schema paths to session
    sessions[session_id]["schema1"] = uploaded_files

    return {"status": "success", "session_id": session_id, "files": [f.filename for f in files]}


@app.post("/api/upload-schema2")
async def upload_schema2(session_id: str, files: List[UploadFile] = File(...)):
    """Upload optional schema/documentation files for Bundle 2 (Excel/CSV)."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session_dir = UPLOAD_DIR / session_id / "schema2"
    session_dir.mkdir(parents=True, exist_ok=True)

    uploaded_files = []
    for file in files:
        file_path = session_dir / file.filename
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        uploaded_files.append(str(file_path))

    sessions[session_id]["schema2"] = uploaded_files

    return {"status": "success", "session_id": session_id, "files": [f.filename for f in files]}


def load_tables(file_paths: List[str], bundle_name: str):
    """Load all CSV/Excel files into dictionary of DataFrames"""
    tables = {}
    for file_path in file_paths:
        try:
            filename = Path(file_path).name
            if filename.endswith('.csv'):
                df = pd.read_csv(file_path)
            elif filename.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(file_path)
            else:
                continue
            
            # Use filename (without extension) as table name
            table_name = filename.rsplit('.', 1)[0]
            tables[table_name] = df
            print(f"  ✓ {table_name}: {len(df)} rows, {len(df.columns)} columns")
        except Exception as e:
            print(f"  ✗ Error loading {filename}: {e}")
    
    return tables


def analyze_all_schemas(bundle1_tables, bundle2_tables):
    """Get comprehensive schema for all tables"""
    
    def convert_timestamps_to_strings(obj):
        """Recursively convert Timestamp objects to strings"""
        if isinstance(obj, dict):
            return {k: convert_timestamps_to_strings(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_timestamps_to_strings(elem) for elem in obj]
        elif isinstance(obj, pd.Timestamp):
            return str(obj)
        else:
            return obj
    
    # Build schema summary for Bundle 1
    b1_schema = {}
    for table_name, df in bundle1_tables.items():
        b1_schema[table_name] = {
            "columns": list(df.columns),
            "sample": convert_timestamps_to_strings(df.head(2).to_dict('records')),
            "row_count": len(df)
        }
    
    # Build schema summary for Bundle 2
    b2_schema = {}
    for table_name, df in bundle2_tables.items():
        b2_schema[table_name] = {
            "columns": list(df.columns),
            "sample": convert_timestamps_to_strings(df.head(2).to_dict('records')),
            "row_count": len(df)
        }
    
    return b1_schema, b2_schema


def generate_mappings(b1_schema, b2_schema, schema_doc1: Optional[str] = None, schema_doc2: Optional[str] = None):
    """Use Gemini to create intelligent mappings. Optionally include textual schema documentation to improve mapping quality."""

    schema1_block = f"\n\nBUNDLE 1 SCHEMA DOCUMENTATION:\n{schema_doc1}" if schema_doc1 else ""
    schema2_block = f"\n\nBUNDLE 2 SCHEMA DOCUMENTATION:\n{schema_doc2}" if schema_doc2 else ""

    prompt = f"""
You are a data integration expert. Analyze these two data bundles and create mappings.

BUNDLE 1 SCHEMA:
{json.dumps(b1_schema, indent=2)}
{schema1_block}

BUNDLE 2 SCHEMA:
{json.dumps(b2_schema, indent=2)}
{schema2_block}

TASK: Create field-level mappings from Bundle 1 to Bundle 2.

RULES:
- One Bundle 1 table can map to MULTIPLE Bundle 2 tables (1-to-many)
- Multiple Bundle 1 tables can map to ONE Bundle 2 table (many-to-1)
- One Bundle 1 table can map to ONE Bundle 2 table (one-to-one)
- Map based on semantic meaning, not just column names
- For unmapped columns in Bundle 1, suggest which Bundle 2 table should receive them

Return JSON in this EXACT format:
{{
    "table_mappings": [
        {{
            "source_table": "bundle1_table_name",
            "target_table": "bundle2_table_name",
            "field_mappings": [
                {{
                    "source_field": "column_from_bundle1",
                    "target_field": "column_in_bundle2",
                    "confidence": 0.95,
                    "reasoning": "why this mapping makes sense"
                }}
            ]
        }}
    ],
    "summary": "brief explanation of mapping strategy"
}}
"""

    print("🤖 Asking Gemini to analyze schemas and create mappings...")
    response = model.generate_content(prompt)

    # Extract JSON from response
    response_text = response.text
    json_start = response_text.find('{')
    json_end = response_text.rfind('}') + 1
    json_string = response_text[json_start:json_end]

    mappings = json.loads(json_string)
    return mappings


def apply_mappings(bundle1_tables, bundle2_tables, mappings):
    """Transform Bundle 1 data and merge into Bundle 2"""
    
    merged_tables = {}
    
    # Start with copies of Bundle 2 tables
    for table_name, df in bundle2_tables.items():
        merged_tables[table_name] = df.copy()
    
    # Process each table mapping
    for mapping in mappings['table_mappings']:
        source_table = mapping['source_table']
        target_table = mapping['target_table']
        field_mappings = mapping['field_mappings']
        
        if source_table not in bundle1_tables:
            print(f"⚠️  Source table '{source_table}' not found, skipping...")
            continue
        
        if target_table not in merged_tables:
            print(f"⚠️  Target table '{target_table}' not found, creating new...")
            merged_tables[target_table] = pd.DataFrame()
        
        print(f"\n🔄 Mapping: {source_table} → {target_table}")
        
        # Transform source data
        source_df = bundle1_tables[source_table]
        transformed = pd.DataFrame()
        
        for field_map in field_mappings:
            source_field = field_map['source_field']
            target_field = field_map['target_field']
            
            if source_field in source_df.columns:
                transformed[target_field] = source_df[source_field]
                print(f"  ✓ {source_field} → {target_field} ({field_map.get('confidence', 'N/A')})")
        
        # Add missing columns from target with null values
        target_df = merged_tables[target_table]
        for col in target_df.columns:
            if col not in transformed.columns:
                transformed[col] = None
        
        # Reorder to match target schema
        if len(target_df.columns) > 0:
            transformed = transformed[target_df.columns]
        
        # Merge
        merged_tables[target_table] = pd.concat(
            [target_df, transformed], 
            ignore_index=True
        )
        
        print(f"  📊 Added {len(transformed)} rows to {target_table}")
    
    return merged_tables


@app.post("/api/merge/{session_id}")
async def merge_data(session_id: str, background_tasks: BackgroundTasks):
    """Start the AI-powered merge as a background job and return a job id immediately."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    bundle1_paths = sessions[session_id].get("bundle1", [])
    bundle2_paths = sessions[session_id].get("bundle2", [])

    if not bundle1_paths or not bundle2_paths:
        raise HTTPException(status_code=400, detail="Both bundles must be uploaded")

    # Create job
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "queued", "session_id": session_id, "result": None, "error": None}

    def run_merge(job_id: str, session_id: str):
        try:
            jobs[job_id]["status"] = "running"

            # Load tables
            print("📊 Loading Bundle 1 tables:")
            bundle1_tables = load_tables(bundle1_paths, "Bundle 1")

            print("\n📊 Loading Bundle 2 tables:")
            bundle2_tables = load_tables(bundle2_paths, "Bundle 2")

            # Analyze schemas
            print("\n🔍 Analyzing schemas...")
            b1_schema, b2_schema = analyze_all_schemas(bundle1_tables, bundle2_tables)

            # Read optional schema documentation files (if uploaded) and include their text in the Gemini prompt
            schema_doc1 = None
            schema_doc2 = None
            try:
                s1_paths = sessions[session_id].get("schema1", [])
                if s1_paths:
                    parts = []
                    for p in s1_paths:
                        pth = Path(p)
                        try:
                            if pth.suffix.lower() == ".csv":
                                parts.append(open(pth, "r", encoding="utf-8").read())
                            elif pth.suffix.lower() in (".xls", ".xlsx"):
                                # Read all sheets and serialize each sheet fully to CSV
                                xls = pd.read_excel(pth, sheet_name=None)
                                for sheet_name, df_sheet in xls.items():
                                    parts.append(f"--- SHEET: {sheet_name} ---")
                                    parts.append(df_sheet.to_csv(index=False))
                            else:
                                parts.append(open(pth, "r", encoding="utf-8").read())
                        except Exception as e:
                            parts.append(f"(could not read {pth.name}: {e})")
                    schema_doc1 = "\n".join(parts)
            except Exception:
                schema_doc1 = None

            try:
                s2_paths = sessions[session_id].get("schema2", [])
                if s2_paths:
                    parts = []
                    for p in s2_paths:
                        pth = Path(p)
                        try:
                            if pth.suffix.lower() == ".csv":
                                parts.append(open(pth, "r", encoding="utf-8").read())
                            elif pth.suffix.lower() in (".xls", ".xlsx"):
                                # Read all sheets and serialize each sheet fully to CSV
                                xls = pd.read_excel(pth, sheet_name=None)
                                for sheet_name, df_sheet in xls.items():
                                    parts.append(f"--- SHEET: {sheet_name} ---")
                                    parts.append(df_sheet.to_csv(index=False))
                            else:
                                parts.append(open(pth, "r", encoding="utf-8").read())
                        except Exception as e:
                            parts.append(f"(could not read {pth.name}: {e})")
                    schema_doc2 = "\n".join(parts)
            except Exception:
                schema_doc2 = None

            # Generate mappings with Gemini (include schema docs when available)
            print("\n🤖 Generating mappings...")
            mappings = generate_mappings(b1_schema, b2_schema, schema_doc1=schema_doc1, schema_doc2=schema_doc2)

            # Apply mappings and merge
            print("\n🔄 Applying transformations...")
            merged_tables = apply_mappings(bundle1_tables, bundle2_tables, mappings)

            # Save results
            output_dir = OUTPUT_DIR / session_id
            output_dir.mkdir(parents=True, exist_ok=True)

            # Save mapping documentation
            mapping_doc_path = output_dir / "mapping_documentation.json"
            with open(mapping_doc_path, "w") as f:
                json.dump(mappings, f, indent=2)

            # Save merged tables
            output_files = []
            for table_name, df in merged_tables.items():
                output_path = output_dir / f"merged_{table_name}.csv"
                df.to_csv(output_path, index=False)
                output_files.append(output_path.name)

            # Create zip file
            zip_path = output_dir / "merged_output.zip"
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                zipf.write(mapping_doc_path, "mapping_documentation.json")
                for table_name, df in merged_tables.items():
                    csv_path = output_dir / f"merged_{table_name}.csv"
                    zipf.write(csv_path, f"merged_{table_name}.csv")

            # Generate summary statistics
            summary = {
                "total_tables": len(merged_tables),
                "table_details": {}
            }

            for table_name, df in merged_tables.items():
                original_size = len(bundle2_tables.get(table_name, pd.DataFrame()))
                added = len(df) - original_size
                summary["table_details"][table_name] = {
                    "total_rows": len(df),
                    "rows_from_bundle1": added,
                    "columns": len(df.columns)
                }

            result = {
                "status": "success",
                "session_id": session_id,
                "mappings": mappings,
                "summary": summary,
                "output_files": output_files,
                "download_url": f"/api/download/{session_id}/merged_output.zip",
                "message": f"Successfully merged {len(merged_tables)} tables"
            }

            jobs[job_id]["status"] = "success"
            jobs[job_id]["result"] = result

        except Exception as e:
            jobs[job_id]["status"] = "failed"
            jobs[job_id]["error"] = str(e)
            print(f"Job {job_id} failed: {e}")

    # Schedule the background job
    background_tasks.add_task(run_merge, job_id, session_id)

    return {"status": "queued", "job_id": job_id}


@app.get("/api/download/{session_id}/{filename}")
async def download_file(session_id: str, filename: str):
    """Download merged results"""
    file_path = OUTPUT_DIR / session_id / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        file_path,
        filename=filename,
        media_type="application/octet-stream"
    )


@app.get("/api/session/{session_id}/status")
async def get_session_status(session_id: str):
    """Get current session status"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    return {
        "session_id": session_id,
        "bundle1_files": len(session.get("bundle1", [])),
        "bundle2_files": len(session.get("bundle2", [])),
        "ready_to_merge": len(session.get("bundle1", [])) > 0 and len(session.get("bundle2", [])) > 0
    }


@app.get("/api/job/{job_id}")
async def get_job_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    job = jobs[job_id]
    return {
        "job_id": job_id,
        "status": job.get("status"),
        "result": job.get("result"),
        "error": job.get("error")
    }


@app.get("/api/mapping_pdf/{session_id}")
async def get_mapping_pdf(session_id: str):
    """Generate a PDF from mapping_documentation.json and return it for download."""
    output_dir = OUTPUT_DIR / session_id
    mapping_doc_path = output_dir / "mapping_documentation.json"
    if not mapping_doc_path.exists():
        raise HTTPException(status_code=404, detail="Mapping documentation not found")

    if not REPORTLAB_AVAILABLE:
        return JSONResponse({"error": "reportlab is not installed on the server. Install it with 'pip install reportlab' to enable PDF generation."}, status_code=500)

    # Load mapping JSON
    with open(mapping_doc_path, 'r', encoding='utf-8') as f:
        mapping = json.load(f)

    # Create PDF in memory
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    width, height = letter
    margin = 40
    y = height - margin

    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(margin, y, f"Mapping Documentation: {session_id}")
    y -= 24

    # Summary if present
    summary = mapping.get('summary')
    if summary:
        c.setFont("Helvetica", 10)
        text = c.beginText(margin, y)
        text.textLines(f"Summary: {summary}")
        c.drawText(text)
        y -= 18 + (12 * (str(summary).count('\n') + 1))

    # Table mappings
    table_mappings = mapping.get('table_mappings', [])
    c.setFont("Helvetica-Bold", 12)
    for tm in table_mappings:
        if y < margin + 80:
            c.showPage()
            y = height - margin
            c.setFont("Helvetica-Bold", 12)
        src = tm.get('source_table')
        tgt = tm.get('target_table')
        c.drawString(margin, y, f"{src} → {tgt}")
        y -= 16
        c.setFont("Helvetica", 9)
        # headers
        c.drawString(margin + 8, y, "Source Field")
        c.drawString(margin + 200, y, "Target Field")
        c.drawString(margin + 360, y, "Confidence")
        y -= 12
        for fm in tm.get('field_mappings', []):
            if y < margin + 40:
                c.showPage()
                y = height - margin
            sf = str(fm.get('source_field', ''))
            tf = str(fm.get('target_field', ''))
            conf = fm.get('confidence', '')
            reasoning = fm.get('reasoning', '')
            c.drawString(margin + 8, y, sf[:28])
            c.drawString(margin + 200, y, tf[:28])
            c.drawString(margin + 360, y, f"{conf}")
            y -= 12
            if reasoning:
                # reasoning may be long; wrap it
                rt = c.beginText(margin + 12, y)
                rt.setFont("Helvetica-Oblique", 8)
                for line in str(reasoning).splitlines():
                    rt.textLine(line[:90])
                    y -= 10
                c.drawText(rt)
                y -= 4
        y -= 10

    c.save()
    buf.seek(0)

    # Write to a temp file and return as FileResponse (FileResponse needs a path)
    tmp_path = output_dir / "mapping_documentation.pdf"
    with open(tmp_path, 'wb') as out_f:
        out_f.write(buf.read())

    return FileResponse(tmp_path, filename="mapping_documentation.pdf", media_type="application/pdf")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",  # Changed from app to "main:app" (import string)
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )

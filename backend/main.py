from fastapi import FastAPI

app = FastAPI()

@app.get("/jobs")
def get_jobs():
    return {"jobs": ["JOB 1", "JOB 2"]}

@app.post("/jobs")
def create_job(job: str):
    return {"message", f"JOB '{job}' created."}

@app.delete("/job/{job_id}")
def delete_job(job_id: int):
    return {"message": f"Job: {job_id} deleted"}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"USER ID", user_id}

@app.get("/search")
def search_jobs(query: str, location: str = "remote"):
    return {"query": query, "location":location}

@app.get("/")
def read_root():
    return {"message", "Welcome to fast API"}
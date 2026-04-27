import cv2
import numpy as np
import io
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from insightface.app import FaceAnalysis

app = FastAPI(title="Tapowan InsightFace API")

# Allow CORS for the frontend to communicate with this server directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Initializing InsightFace model (this may take a moment to download models the first time)...")
# 'buffalo_l' is the default and most accurate model pack for InsightFace (ArcFace, RetinaFace)
face_app = FaceAnalysis(name='buffalo_l')
face_app.prepare(ctx_id=0, det_size=(640, 640)) # ctx_id=0 means GPU if available, else CPU.
print("InsightFace model initialized.")

@app.post("/extract")
async def extract_face(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image.")
    
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image data.")
        
        # InsightFace expects BGR image (OpenCV default)
        faces = face_app.get(img)
        
        if len(faces) == 0:
            return {"faces": []}
            
        results = []
        for face in faces:
            # We only return faces with a decent detection score
            if face.det_score < 0.5:
                continue
                
            bbox = face.bbox.astype(int).tolist() # [x1, y1, x2, y2]
            
            # Convert [x1,y1,x2,y2] to [x,y,w,h] to match the frontend expectations
            x, y, w, h = bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]
            
            embedding = face.embedding.tolist() # 512-dimensional vector
            
            results.append({
                "box": [x, y, w, h],
                "score": float(face.det_score),
                "embedding": embedding
            })
            
        # Sort by bounding box area (largest face first)
        results.sort(key=lambda x: x["box"][2] * x["box"][3], reverse=True)
            
        return {"faces": results}
        
    except Exception as e:
        print(f"Extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status")
def status():
    return {"status": "running", "model": "buffalo_l"}

if __name__ == "__main__":
    import uvicorn
    # Run on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)

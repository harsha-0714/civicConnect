"""
YOLOV11 TRAINING SCRIPT

Training Steps:
1. pip install ultralytics
2. Download and annotate dataset (use Roboflow)
3. Export in YOLOv8 format (compatible with YOLOv11)
4. Run this script
5. Model saved to runs/detect/civicconnect/weights/best.pt
"""

from ultralytics import YOLO

def train_model(
    dataset_yaml: str,
    model_size: str = 'n',  # n=nano, s=small, m=medium, l=large, x=extra-large
    epochs: int = 100,
    imgsz: int = 640,
    batch: int = 16,
    device: str = 'cpu'  # Use 'cuda' if GPU available
):
    """
    Train YOLOv11 on civic issue dataset.
    
    Recommended: Start with yolov11n.pt (nano) for free-tier deployment.
    Free GPU: Google Colab (T4, 15GB VRAM), Kaggle (P100, 16GB VRAM)
    
    Expected training time:
    - yolov11n: ~30 min on T4 GPU for 100 epochs
    - yolov11s: ~60 min on T4 GPU for 100 epochs
    """
    
    # Load pretrained YOLOv11
    model = YOLO(f'yolov11{model_size}.pt')
    
    results = model.train(
        data=dataset_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device=device,
        project='runs/detect',
        name='civicconnect',
        
        # Augmentation
        flipud=0.3,
        fliplr=0.5,
        mosaic=0.8,
        degrees=15.0,
        translate=0.1,
        scale=0.5,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        
        # Optimization
        optimizer='AdamW',
        lr0=0.001,
        weight_decay=0.0005,
        warmup_epochs=3,
        
        # Saving
        save_period=10,
        patience=20,  # Early stopping
        
        # Logging
        plots=True,
        val=True,
        verbose=True
    )
    
    print(f"✅ Training complete!")
    print(f"📊 mAP50: {results.box.map50:.4f}")
    print(f"📊 mAP50-95: {results.box.map:.4f}")
    print(f"💾 Best model: runs/detect/civicconnect/weights/best.pt")
    
    return results


def evaluate_model(model_path: str, test_yaml: str):
    """Evaluate trained model on test set"""
    model = YOLO(model_path)
    metrics = model.val(data=test_yaml, split='test')
    
    print("\n📊 Per-class AP50:")
    classes = ['pothole', 'garbage_dump', 'broken_streetlight', 'water_leakage', 'open_manhole']
    for i, cls in enumerate(classes):
        ap = metrics.box.ap50[i] if i < len(metrics.box.ap50) else 0
        print(f"  {cls}: {ap:.4f}")
    
    return metrics


if __name__ == '__main__':
    # ── Step 1: Create dataset YAML ──
    DATASET_PATH = './datasets/civic_issues'
    yaml_path = create_dataset_yaml(DATASET_PATH)
    verify_dataset_structure(DATASET_PATH)
    
    # ── Step 2: Train ──
    results = train_model(
        dataset_yaml=yaml_path,
        model_size='n',  # Start with nano for speed
        epochs=100,
        device='0' if __import__('torch').cuda.is_available() else 'cpu'
    )
    
    # ── Step 3: Evaluate ──
    evaluate_model('runs/detect/civicconnect/weights/best.pt', yaml_path)

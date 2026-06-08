"""
DATASET PREPARATION FOR YOLOV11 TRAINING

Dataset Sources:
1. Pothole Detection:
   - https://www.kaggle.com/datasets/sovitrath/pothole-detection-dataset (4,000+ images)
   - https://www.kaggle.com/datasets/atulyakumar98/pothole-detection-dataset

2. Garbage/Waste Detection:
   - https://www.kaggle.com/datasets/asdasdasasdas/garbage-classification (15,150 images)
   - TACO Dataset: http://tacodataset.org (1,500+ images, COCO format)

3. Streetlight Detection:
   - Custom scraping from Google Open Images (class: 'Street light')
   - Roboflow Universe: https://universe.roboflow.com/search?q=streetlight

4. Water Leakage:
   - https://www.kaggle.com/datasets/salmanrizwansaeed/water-leakage-detection
   - Roboflow Universe: https://universe.roboflow.com/search?q=water+leak

5. Manhole Detection:
   - https://www.kaggle.com/datasets/roboflow100/manhole-detection
   - Custom collection from Google Street View imagery

Total Target: 500+ images per class = 2,500+ images minimum

Tools: Roboflow (free tier) for annotation, augmentation, and YOLO format export
"""

import os
import yaml
from pathlib import Path

def create_dataset_yaml(dataset_path: str):
    """Create YOLO-format dataset.yaml"""
    config = {
        'path': dataset_path,
        'train': 'images/train',
        'val': 'images/val',
        'test': 'images/test',
        'nc': 5,
        'names': [
            'pothole',
            'garbage_dump',
            'broken_streetlight',
            'water_leakage',
            'open_manhole'
        ]
    }
    
    yaml_path = os.path.join(dataset_path, 'dataset.yaml')
    with open(yaml_path, 'w') as f:
        yaml.dump(config, f, default_flow_style=False)
    
    print(f"✅ dataset.yaml created at {yaml_path}")
    return yaml_path


def verify_dataset_structure(dataset_path: str):
    """Verify correct folder structure"""
    required_dirs = [
        'images/train', 'images/val', 'images/test',
        'labels/train', 'labels/val', 'labels/test'
    ]
    
    for d in required_dirs:
        path = Path(dataset_path) / d
        if not path.exists():
            print(f"⚠️ Missing: {path}")
        else:
            count = len(list(path.glob('*')))
            print(f"✅ {d}: {count} files")

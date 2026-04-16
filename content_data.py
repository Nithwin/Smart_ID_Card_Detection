# content_data.py
# Contains all the text and slide structure content to decouple it from presentation logic

SLIDES_CONTENT = [
    {
        "type": "title",
        "title": "Smart ID Card Detection and Authentication",
        "content": [
            "Using Deep Learning and Computer Vision",
            "IEEE Conference Presentation\n\n",
            "Authors: Vinoparkavi D, Mythily V, Dharun Raj R, Deepika Y, Nithwin V M",
            "Nandha Engineering College, Erode, India"
        ],
        "image": None
    },
    {
        "type": "content",
        "title": "Background & Introduction",
        "content": [
            "• Identity verification is a critical security checkpoint in banking and education.",
            "• Manual verification is the standard protocol for checking identities.",
            "• As populations grow, the need for efficient automated systems increases.",
            "• Rapid progress in AI and Convolutional Neural Networks (CNN) opens new doors."
        ],
        "image": None
    },
    {
        "type": "content",
        "title": "The Challenge: Manual ID Verification",
        "content": [
            "• Time Bottlenecks: Verification takes 2-5 minutes per individual.",
            "• High Error Rates: Under high volume, human error reaches 15-20%.",
            "• Inconsistency: Variations in human judgment and fatigue impact accuracy.",
            "• False Rejections & Acceptances: Fake ID pass-throughs introduce security risks."
        ],
        "image": None
    },
    {
        "type": "content",
        "title": "Limitations of Commercial Approaches",
        "content": [
            "• Cloud Dependency: Most solutions require continuous internet connections.",
            "• High Costs: Requires specialized hardware and expensive APIs.",
            "• Poor Adaptability: ID cards have no universal standard format or material.",
            "• Environmental Instability: Severe performance drop under varying lighting and bad webcam angles."
        ],
        "image": None
    },
    {
        "type": "content",
        "title": "Proposed Solution Overview",
        "content": [
            "• Fully Offline AI Pipeline: Integrated multi-stage ID verification system.",
            "• Lightweight Processing: Functions perfectly on standard computing hardware.",
            "• Speed & Accuracy: Processes verifications in 1.5 to 2 seconds securely.",
            "• Adaptable Framework: Handles twelve different formats and fluctuating lighting effortlessly."
        ],
        "image": "/home/shadow/.gemini/antigravity/brain/ad925e9c-6010-436d-9765-055f24e05bc7/yolo_id_card_1775276953932.png"
    },
    {
        "type": "content",
        "title": "System Architecture & Workflow",
        "content": [
            "1. Scene Analysis: Live video stream analyzed.",
            "2. Card Detection: YOLOv5 tracks and extracts ID cards.",
            "3. Geometric Correction: Fixes perspective and enhances image quality.",
            "4. Parallel Processing: Template-OCR runs simultaneously with FaceNet recognition.",
            "5. Verdict Delivery: Instant GUI feedback on validation."
        ],
        "image": None
    },
    {
        "type": "content",
        "title": "Methodology: Deep Learning Dataset",
        "content": [
            "• Large-Scale Dataset: 15,000 diverse images successfully collected.",
            "• Data Variation: 8,000 synthetic templates, 7,000 real-world campus captures.",
            "• Advanced Augmentation: Random rotations (±15°), zooming, and brightness scaling.",
            "• Mosaic Techniques: Used during training for improved generalization against complex backgrounds."
        ],
        "image": None
    },
    {
        "type": "content",
        "title": "Methodology: Card Detection (YOLOv5)",
        "content": [
            "• Why YOLOv5?: Perfect balance of extreme real-time speed and precision.",
            "• Training Specifications: 100 epochs, 640x640 resolution optimizations.",
            "• Convergence Profile: Stable validation loss avoiding overfitting characteristics.",
            "• Success Rate: Achieved a robust 96.8% mAP@0.5 and 94.7% precision."
        ],
        "image": None
    },
    {
        "type": "content",
        "title": "Methodology: Template-Based OCR",
        "content": [
            "• Extensibility: Utilizes an innovative extensible JSON configuration system.",
            "• Field Coordinates: Replaces hardcoded regions with dynamic region of interests.",
            "• Validation: Checks inputs automatically via complex regular expression patterns.",
            "• Tesseract 4.1: Supported by LSTM Neural network upgrades for high character accuracy."
        ],
        "image": "/home/shadow/.gemini/antigravity/brain/ad925e9c-6010-436d-9765-055f24e05bc7/ocr_extraction_1775276975776.png"
    },
    {
        "type": "content",
        "title": "Methodology: Facial Recognition",
        "content": [
            "• Architecture: Deployed FaceNet architecture embedded systematically.",
            "• Multi-dimensional Space: Converts distinct facial features into 128-D mathematical embeddings.",
            "• Threshold Optimization: Standardized on a 0.6 similarity limit to balance strict security and user comfort.",
            "• Independent Verification: Eliminates dependency on external or commercial API dependencies."
        ],
        "image": "/home/shadow/.gemini/antigravity/brain/ad925e9c-6010-436d-9765-055f24e05bc7/face_matching_1775276992948.png"
    },
    {
        "type": "content",
        "title": "Security: Anti-Spoofing Operations",
        "content": [
            "• Defending against High-resolution Print Attacks:",
            "  1. Texture Analysis: Uses Fourier Transforms mapping frequency profiles.",
            "  - Detects half-tone and artificial grid prints specific to 2D spoofs.",
            "  2. Passive Liveness Detection: Identifies micro-textures utilizing Local Binary Patterns.",
            "• Overall Anti-spoofing Efficacy sits reliably at an 85.8% success rating."
        ],
        "image": None
    },
    {
        "type": "content",
        "title": "Experimental Setup & Constraints",
        "content": [
            "• Python Ecosystem: Utilizing PyTorch 1.10, OpenCV 4.5, and NumPy.",
            "• Hardware Deployment Target: Affordable setups with standard i5 CPU hardware scopes.",
            "• Test Groups: Monitored through variables like indoor control, reflections, and outdoor lighting.",
            "• Metric Standardization: Testing specifically aligned around False Accept Rates / False Reject Rates."
        ],
        "image": None
    },
    {
        "type": "content",
        "title": "Results: Detection & Processing Speeds",
        "content": [
            "• Live Feedback Consistency: Consistent tracking mapping from 25–30 Frames Per Second.",
            "• YOLO Accuracy Variables:",
            "  - Indoor Scenarios: 98.4%",
            "  - Outdoor / Complex Environments: 92.0%",
            "• Rapid Judgment Pipeline ensures a clear verification outcome under 2 metric seconds."
        ],
        "image": None
    },
    {
        "type": "content",
        "title": "Validation: Real-world Field Deployment",
        "content": [
            "• Supervised Pilot Project: Two-week live collegiate deployment testing phase.",
            "• Test Environment Volume: Assessed across 847 distinct student ID validations.",
            "• Success Output: Resulted in an automated verification completion of 92.3%.",
            "• Error Flagging: Manual reviews cleanly caught extreme damage or alien ID parameters smoothly."
        ],
        "image": None
    },
    {
        "type": "content",
        "title": "Conclusion & Future Enhancements",
        "content": [
            "• Impact Overview: Modernized ID checks offline dropping processing to fractionary timespans.",
            "• System Extensibility: JSON templates empower users to scale card databases rapidly.",
            "• Future Scope:",
            "  - Transitioning text interpretation paradigms to modern Transformer models.",
            "  - Implementing deeper 3D analytical countermeasures beyond generic textures."
        ],
        "image": None
    }
]

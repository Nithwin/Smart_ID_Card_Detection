# Viva Role Guide — Smart ID Card Detection (CA-YOLOv8)

**Team Members:** Nithwin, Dharun Raj, Deepika

---

## Nithwin — AI/ML Core and Architecture Lead

### What to say in the viva

"I was primarily responsible for designing and building the deep learning core of this project. My main contribution was architecting the CA-YOLOv8 model, which is our custom version of YOLOv8 enhanced with two attention mechanisms: CBAM and Coordinate Attention.

I personally wrote the attention.py module, which contains the full PyTorch implementations of Channel Attention, Spatial Attention, the combined CBAM block, and the Coordinate Attention module. I also designed both YAML architecture configuration files, ca_yolov8.yaml and ca_yolov8_p2.yaml, which define exactly where each attention block is inserted into the backbone and neck of the model.

Beyond the model itself, I built the entire interactive frontend visualizer using Next.js. This is the application that animates the YOLO architecture stage by stage, showing how data flows through convolutional layers, C2f blocks, SPPF, CBAM, and the Coordinate Attention neck. I built this to make the model explainable and easy to demonstrate during presentations.

I also integrated the loss function improvement. We replaced the standard CIoU loss with Wise-IoU, which uses a dynamic non-monotonic focusing mechanism. This helps the model handle low-quality bounding boxes better during training, especially for occluded or partially visible ID cards.

On top of all that, I was the one who set up the Google Colab training notebook, configured the training hyperparameters such as learning rate, batch size, and augmentation settings, and ran the final training that produced our best.pt model weights."

### Technical reference

| Topic | Details |
|-------|---------|
| CBAM | Channel Attention uses a shared MLP on average-pooled and max-pooled features. Spatial Attention applies a 7x7 convolution on concatenated pooling outputs. Placed after every C2f block in the backbone. |
| Coordinate Attention | Uses directional 1D pooling along height and width separately in the neck. Preserves precise positional information, unlike CBAM which uses global pooling. |
| Why use both | CBAM focuses on what features matter. Coordinate Attention focuses on where the card is relative to the person. Together they give the model both feature-level and position-level awareness. |
| P2 Detection Head | A fourth detection head at stride 4, giving 160x160 resolution feature maps. Designed for detecting tiny ID cards that can be as small as 16x16 pixels. |
| Wise-IoU Loss | Reduces harmful gradients from hard or low-quality training examples. Results in more stable training and better convergence. |
| Frontend Visualizer | Built with Next.js and Framer Motion. Animates all six stages of the CA-YOLOv8 architecture with cinematic transitions. |
| Training | Google Colab with GPU. Custom YAML configuration fed into the Ultralytics YOLO training pipeline. |

---

## Dharun Raj — Backend Systems and Pipeline Engineer

### What to say in the viva

"My role was building the complete backend system that powers the real-time detection pipeline. I developed the FastAPI backend, which is the server that receives camera frames, runs the CA-YOLOv8 model on them, and returns detection results to the frontend dashboard.

I implemented the full end-to-end inference pipeline. The YOLO model runs first to detect persons and ID cards in each frame. Then a compliance logic layer checks whether each detected card is actually being worn by the person. Specifically, it verifies whether the card's center point falls within the upper seventy percent of the person's bounding box. If someone fails this compliance check, the system automatically triggers a face recognition scan to identify the violator.

I integrated InsightFace for face recognition, which uses the ArcFace embedding model to generate normalized face embeddings and compare them against our database of known faces using cosine similarity with a threshold of 0.4. I also used MediaPipe for lightweight initial face detection.

I built the real-time MJPEG camera streaming endpoint that allows the frontend to display a live annotated video feed. To keep the system responsive, the backend processes every third frame and reuses the last annotated result for skipped frames. I also implemented an alert deduplication system with a thirty-second cooldown window so the same person does not get flagged repeatedly across consecutive frames.

All violation alerts are stored in an SQLite database with timestamps, face images, bounding box coordinates, and similarity scores.

On the dataset side, I wrote the prepare_dataset.py script that handles splitting raw annotated images into eighty-ten-ten train-validation-test splits in YOLO format, and validates every label file to catch issues like out-of-range coordinates, wrong class IDs, or malformed annotation lines before training begins.

I also wrote the model export script to convert our trained model to ONNX and TensorRT formats for faster deployment in production environments."

### Technical reference

| Topic | Details |
|-------|---------|
| FastAPI Backend | Located in backend/main.py. Exposes 17 REST API endpoints covering image detection, video detection, camera control, alerts, statistics, and face registration. |
| Compliance Logic | Checks whether the card's center coordinates (cx, cy) fall inside the person's bounding box and within the upper 70 percent of the person's height. |
| Face Recognition | InsightFace with the buffalo_l model. Generates normalized embeddings and matches against stored faces using cosine similarity. Threshold is 0.4. |
| Camera Streaming | MJPEG stream served at /api/camera/feed. Processes every third frame to maintain performance. |
| Alert Deduplication | Uses a 30-second cooldown window per identified person. Prevents the same violator from generating multiple consecutive alerts. |
| Dataset Splitting | 80 percent training, 10 percent validation, 10 percent testing. YOLO format with normalized coordinates. |
| Dataset Validation | Checks every label file for correct class IDs (0 or 1), values within 0 to 1 range, and exactly five values per annotation line. |
| Database | SQLite database (detections.db). Stores alerts with face images, timestamps, person bounding boxes, identified names, and similarity scores. |
| Model Export | export_model.py converts best.pt to ONNX and TensorRT formats for deployment. |

---

## Deepika — Data Engineering and Research

### What to say in the viva

"My role in this project covered two main areas: data preparation and research documentation.

On the data side, I was responsible for collecting, cleaning, and annotating the dataset we used to train the model. We needed images of people both wearing and not wearing ID cards in a variety of real-world conditions, including different lighting, camera angles, and levels of occlusion. I worked on curating this dataset by removing bad or mislabeled images and organizing all annotations in YOLO format. In YOLO format, each bounding box is represented as five values: the class number, center x, center y, width, and height, with all spatial values normalized between zero and one.

I also handled the augmentation strategy for training. We applied mosaic augmentation, which combines four images into a single training sample. This is particularly helpful for small object detection because it increases the number of ID card instances the model sees per batch. We also used MixUp augmentation for regularization, which blends two images together to prevent overfitting, and copy-paste augmentation, which takes ID card instances from one image and pastes them onto others to artificially increase card density in training samples.

I was also involved in testing the final system by running it through different scenarios to verify that detection and face recognition worked correctly. I tested edge cases like partially visible cards, people facing away from the camera, crowded scenes with multiple people, and low-light conditions.

On the research side, I studied the academic papers behind our architecture choices. These include the CBAM paper by Woo et al. from ECCV 2018, the Coordinate Attention paper by Hou et al. from CVPR 2021, the Wise-IoU paper by Tong et al. from 2023, and the ArcFace paper by Deng et al. from CVPR 2019. I documented how each technique specifically addresses the challenges of detecting small ID cards in surveillance footage. I also contributed to writing the project report and preparing the IEEE presentation material."

### Technical reference

| Topic | Details |
|-------|---------|
| Dataset Format | YOLO format. Each annotation line contains: class_id, x_center, y_center, width, height. All spatial values are normalized between 0 and 1. |
| Classes | Two classes. Class 0 is ID card. Class 1 is person. |
| Why Annotation Quality Matters | Incorrect labels produce wrong gradients during backpropagation, leading to poor model performance. Clean annotations are the foundation of a good model. |
| Mosaic Augmentation | Combines four training images into one composite image. Exposes the model to more small objects per training batch and improves small object detection. |
| MixUp Augmentation | Blends two images together with weighted transparency. Acts as a regularization technique to prevent overfitting. |
| Copy-Paste Augmentation | Copies ID card bounding box regions from one image and pastes them onto other images. Increases the number of card instances per training sample. |
| Dataset Validation | The prepare_dataset.py script validates every label file for correct class IDs, coordinate values within the valid range, and proper formatting. |
| Dataset Configuration | Defined in configs/dataset.yaml, which specifies training, validation, and test paths along with class names. |
| Research Papers | CBAM by Woo et al. (ECCV 2018), Coordinate Attention by Hou et al. (CVPR 2021), ArcFace by Deng et al. (CVPR 2019), Wise-IoU by Tong et al. (2023). |
| System Testing | Tested edge cases including occlusion, low-light conditions, partial card visibility, and multi-person scenarios. |

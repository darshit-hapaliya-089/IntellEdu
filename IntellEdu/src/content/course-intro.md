# Today's Featured Lesson: Introduction to Artificial Intelligence

Welcome to **Module 1: Foundations of AI & Machine Learning**. In this interactive lesson, you will learn the core concepts that power modern intelligent applications.

---

### 💡 What is Artificial Intelligence?

Artificial Intelligence (AI) refers to computer systems capable of performing tasks that historically required human intelligence, such as:
- **Natural Language Processing (NLP):** Understanding human speech and text.
- **Computer Vision:** Recognizing objects and scenes in photos and video.
- **Pattern Recognition:** Predicting outcomes based on historical data.

---

### 🔑 Key Terminology Checklist

- [x] **Supervised Learning:** Training models using labeled data inputs and expected target outputs.
- [x] **Neural Networks:** Computational graphs inspired by biological brain neurons.
- [ ] **Transformer Architecture:** The core structure behind Large Language Models (LLMs).
- [ ] **Prompt Engineering:** Structuring queries to guide AI responses effectively.

---

### 💻 Code Example: Simple Linear Regression Model

Here is how a basic machine learning model is structured using Python:

```python
import numpy as np
from sklearn.linear_model import LinearRegression

# 1. Prepare sample study hours vs test score data
study_hours = np.array([[1], [2], [3], [4], [5], [6]])
test_scores = np.array([55, 62, 70, 78, 85, 93])

# 2. Initialize & train model
model = LinearRegression()
model.fit(study_hours, test_scores)

# 3. Predict score for 7.5 hours of study
predicted_score = model.predict([[7.5]])
print(f"Predicted Test Score: {predicted_score[0]:.1f}%")
```

---

### 📝 Key Takeaways & Self-Quiz
- **Question 1:** What is the primary difference between Supervised and Unsupervised Learning?
- **Pro Tip:** Keep your daily streak active by taking the 3-minute quiz at the end of this module!


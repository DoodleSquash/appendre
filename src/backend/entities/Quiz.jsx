{
  "name": "Quiz",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Quiz title"
    },
    "description": {
      "type": "string",
      "description": "Quiz description"
    },
    "category": {
      "type": "string",
      "enum": [
        "general",
        "science",
        "history",
        "technology",
        "arts",
        "sports",
        "business",
        "education",
        "custom"
      ],
      "default": "general"
    },
    "difficulty": {
      "type": "string",
      "enum": [
        "easy",
        "medium",
        "hard",
        "adaptive"
      ],
      "default": "medium"
    },
    "questions": {
      "type": "array",
      "description": "Array of quiz questions",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "question": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "multiple_choice",
              "true_false"
            ]
          },
          "options": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "correct_answer": {
            "type": "number"
          },
          "time_limit": {
            "type": "number"
          },
          "points": {
            "type": "number"
          }
        }
      }
    },
    "cover_image": {
      "type": "string",
      "description": "Cover image URL"
    },
    "time_per_question": {
      "type": "number",
      "default": 20,
      "description": "Default seconds per question"
    },
    "is_public": {
      "type": "boolean",
      "default": false
    },
    "play_count": {
      "type": "number",
      "default": 0
    },
    "source_type": {
      "type": "string",
      "enum": [
        "manual",
        "ai_topic",
        "ai_text",
        "ai_pdf"
      ],
      "default": "manual"
    }
  },
  "required": [
    "title",
    "questions"
  ]
}
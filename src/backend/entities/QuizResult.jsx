{
  "name": "QuizResult",
  "type": "object",
  "properties": {
    "session_id": {
      "type": "string",
      "description": "Reference to game session"
    },
    "quiz_id": {
      "type": "string",
      "description": "Reference to quiz"
    },
    "player_email": {
      "type": "string"
    },
    "player_name": {
      "type": "string"
    },
    "total_score": {
      "type": "number"
    },
    "correct_answers": {
      "type": "number"
    },
    "total_questions": {
      "type": "number"
    },
    "accuracy_percentage": {
      "type": "number"
    },
    "average_response_time": {
      "type": "number",
      "description": "In milliseconds"
    },
    "rank": {
      "type": "number"
    },
    "answers": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "question_index": {
            "type": "number"
          },
          "selected_answer": {
            "type": "number"
          },
          "is_correct": {
            "type": "boolean"
          },
          "response_time": {
            "type": "number"
          },
          "points_earned": {
            "type": "number"
          }
        }
      }
    }
  },
  "required": [
    "session_id",
    "quiz_id",
    "player_email",
    "total_score"
  ]
}
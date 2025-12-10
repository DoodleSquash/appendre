{
  "name": "GameSession",
  "type": "object",
  "properties": {
    "quiz_id": {
      "type": "string",
      "description": "Reference to the quiz"
    },
    "host_email": {
      "type": "string",
      "description": "Host user email"
    },
    "game_code": {
      "type": "string",
      "description": "6-digit game code for joining"
    },
    "status": {
      "type": "string",
      "enum": [
        "waiting",
        "active",
        "question",
        "results",
        "finished"
      ],
      "default": "waiting"
    },
    "current_question_index": {
      "type": "number",
      "default": 0
    },
    "question_start_time": {
      "type": "string",
      "format": "date-time"
    },
    "players": {
      "type": "array",
      "description": "List of players",
      "items": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "avatar": {
            "type": "string"
          },
          "score": {
            "type": "number"
          },
          "answers": {
            "type": "array",
            "items": {
              "type": "object"
            }
          },
          "streak": {
            "type": "number"
          }
        }
      }
    },
    "settings": {
      "type": "object",
      "properties": {
        "shuffle_questions": {
          "type": "boolean"
        },
        "shuffle_answers": {
          "type": "boolean"
        },
        "show_leaderboard": {
          "type": "boolean"
        }
      }
    }
  },
  "required": [
    "quiz_id",
    "game_code"
  ]
}
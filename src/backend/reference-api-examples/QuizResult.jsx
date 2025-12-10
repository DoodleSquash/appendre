// JavaScript Example: Reading Entities
// Filterable fields: session_id, quiz_id, player_email, player_name, total_score, correct_answers, total_questions, accuracy_percentage, average_response_time, rank, answers
async function fetchQuizResultEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/69359960bf354976c1596d10/entities/QuizResult`, {
        headers: {
            'api_key': '7f9f0ce51f294c0f91b4a47d170f07bf', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: session_id, quiz_id, player_email, player_name, total_score, correct_answers, total_questions, accuracy_percentage, average_response_time, rank, answers
async function updateQuizResultEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/69359960bf354976c1596d10/entities/QuizResult/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': '7f9f0ce51f294c0f91b4a47d170f07bf', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    const data = await response.json();
    console.log(data);
}
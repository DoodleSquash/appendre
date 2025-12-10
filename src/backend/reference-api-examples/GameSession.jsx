// JavaScript Example: Reading Entities
// Filterable fields: quiz_id, host_email, game_code, status, current_question_index, question_start_time, players, settings
async function fetchGameSessionEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/69359960bf354976c1596d10/entities/GameSession`, {
        headers: {
            'api_key': '7f9f0ce51f294c0f91b4a47d170f07bf', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: quiz_id, host_email, game_code, status, current_question_index, question_start_time, players, settings
async function updateGameSessionEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/69359960bf354976c1596d10/entities/GameSession/${entityId}`, {
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
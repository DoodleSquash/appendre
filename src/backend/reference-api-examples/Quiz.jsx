// JavaScript Example: Reading Entities
// Filterable fields: title, description, category, difficulty, questions, cover_image, time_per_question, is_public, play_count, source_type
async function fetchQuizEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/69359960bf354976c1596d10/entities/Quiz`, {
        headers: {
            'api_key': '7f9f0ce51f294c0f91b4a47d170f07bf', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: title, description, category, difficulty, questions, cover_image, time_per_question, is_public, play_count, source_type
async function updateQuizEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/69359960bf354976c1596d10/entities/Quiz/${entityId}`, {
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
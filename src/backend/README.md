# Backend Integration (Future)

This folder is reserved for backend integration code when ready.

## What Will Go Here

- **API Client**: Base44 API integration with real fetch() calls
- **Entity Schemas**: Database entity definitions for Base44
- **Service Modules**: Backend service layer for API communication
- **Authentication**: Real authentication logic

## Current Status

The frontend is using **placeholder mock functions** located in `/src/lib/api/`:

- `quizApi.js` - Mock quiz data and operations
- `gameSessionApi.js` - Mock game session management
- `quizResultApi.js` - Mock quiz results storage
- `userApi.js` - Mock user authentication

## When Integrating Backend

1. Replace the mock functions in `/src/lib/api/` with real API calls
2. Use the Base44 API endpoint: `https://app.base44.com/api/apps/69359960bf354976c1596d10`
3. Add the API key: `7f9f0ce51f294c0f91b4a47d170f07bf`
4. Follow the entity schemas (Quiz, GameSession, QuizResult)
5. Test each endpoint individually
6. Keep the same function signatures so no frontend changes are needed

## Notes

- Frontend is **100% functional** with mock data
- All pages work without network calls
- UI/UX development can continue independently
- Backend integration can be done incrementally

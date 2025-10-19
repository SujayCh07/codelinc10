import {
  getUserData,
  addChatSession,
  getChatSession,
  getUserProfile,
  updateUserProfile
} from "./index.mjs";

// Main Lambda handler
export const handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path;
  const userId = event.pathParameters?.userId;

  try {
    // ----------- GET USER PROFILE -----------
    if (method === "GET" && path.startsWith("/user/")) {
      const data = await getUserProfile(userId, "user_profiles");
      return sendResponse(200, data);
    }

    // ----------- UPDATE USER PROFILE -----------
    if (method === "POST" && path.startsWith("/user/")) {
      const body = JSON.parse(event.body);
      await updateUserProfile(userId, body, "user_profiles");
      return sendResponse(200, { message: "User profile updated" });
    }

    // ----------- GET CHAT SESSION -----------
    if (method === "GET" && path.startsWith("/session/")) {
      const data = await getChatSession(userId, "user_chat_sessions");
      return sendResponse(200, data);
    }

    // ----------- ADD CHAT SESSION MESSAGE -----------
    if (method === "POST" && path.startsWith("/session/")) {
      const body = JSON.parse(event.body);
      const sessionMessage = body.sessionMessage;

      await addChatSession(userId, sessionMessage, "user_chat_sessions");
      return sendResponse(200, { message: "Chat session updated" });
    }

    // ----------- NO MATCHING ROUTE -----------
    return sendResponse(404, { error: "Route not found" });

  } catch (error) {
    console.error("Handler Error:", error);
    return sendResponse(500, { error: "Internal server error" });
  }
};

// Standard API Gateway Response
function sendResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

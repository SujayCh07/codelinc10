const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB();

const sessionTableName = "user_chat_sessions";
const userTableName = "user_profiles";

// Get full user record from user profile table
async function getUserData(userId, tableName) {
  const params = {
    Statement: `SELECT * FROM "${tableName}" WHERE user_id = ?`,
    Parameters: [{ S: userId }]
  };

  try {
    const result = await dynamoDB.executeStatement(params).promise();
    // Unmarshall DynamoDB format to clean JSON
    return result.Items.map(item => AWS.DynamoDB.Converter.unmarshall(item)) || [];
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw new Error("Could not fetch user data");
  }
}

// Append a string to session_history list
async function addChatSession(userId, sessionHistory, tableName) {
  const params = {
    Statement: `
      UPDATE "${tableName}"
      SET session_history = session_history || ?
      WHERE user_id = ?
    `,
    Parameters: [
      { L: [{ S: sessionHistory }] },
      { S: userId }
    ]
  };

  try {
    await dynamoDB.executeStatement(params).promise();
  } catch (error) {
    console.error("Error adding chat session:", error);
    throw new Error("Could not add chat session");
  }
}

// Get session_history from session table
async function getChatSession(userId, tableName) {
  const params = {
    Statement: `SELECT session_history FROM "${tableName}" WHERE user_id = ?`,
    Parameters: [{ S: userId }]
  };

  try {
    const result = await dynamoDB.executeStatement(params).promise();
    return result.Items.map(item => AWS.DynamoDB.Converter.unmarshall(item)) || [];
  } catch (error) {
    console.error("Error fetching chat session:", error);
    throw new Error("Could not fetch chat session");
  }
}

// Get full user profile
async function getUserProfile(userId, tableName) {
  const params = {
    Statement: `SELECT * FROM "${tableName}" WHERE user_id = ?`,
    Parameters: [{ S: userId }]
  };

  try {
    const result = await dynamoDB.executeStatement(params).promise();
    return result.Items.map(item => AWS.DynamoDB.Converter.unmarshall(item)) || [];
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Could not fetch user profile");
  }
}

// Update profile_data map field in profile table
async function updateUserProfile(userId, profileData, tableName) {
  const params = {
    Statement: `
      UPDATE "${tableName}"
      SET profile_data = ?
      WHERE user_id = ?
    `,
    Parameters: [
      { M: AWS.DynamoDB.Converter.marshall(profileData) },
      { S: userId }
    ]
  };

  try {
    await dynamoDB.executeStatement(params).promise();
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Could not update user profile");
  }
}

module.exports = { 
  getUserData, 
  addChatSession, 
  getChatSession, 
  getUserProfile, 
  updateUserProfile 
};

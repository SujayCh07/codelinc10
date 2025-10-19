import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LandingScreen from "./src/components/landing-screen";
import DynamicQuiz from "./src/components/DynamicQuiz";
import InsightsDashboard from "./src/components/insights-dashboard";
import LearningHub from "./src/components/learning-hub";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Quiz" component={DynamicQuiz} />
        <Stack.Screen name="Dashboard" component={InsightsDashboard} />
        <Stack.Screen name="LearningHub" component={LearningHub} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { testApiEndpoint, runApiHealthCheck } from "../utils/apiTester";
import { COLORS, SPACING, FONT } from "../utils/theme";

const ApiTestScreen = () => {
  const [endpoint, setEndpoint] = useState<string>(
    "https://tnovv4gbcf.execute-api.us-west-1.amazonaws.com/dev"
  );
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">(
    "GET"
  );
  const [requestBody, setRequestBody] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Test the API with the selected method
  const handleTestApi = async () => {
    setLoading(true);
    setResponse("");

    try {
      let body = undefined;

      if (requestBody && (method === "POST" || method === "PUT")) {
        try {
          body = JSON.parse(requestBody);
        } catch (error) {
          setResponse("Error: Invalid JSON in request body");
          setLoading(false);
          return;
        }
      }

      const result = await testApiEndpoint(endpoint, method, body);
      setResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      setResponse(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick health check (GET request)
  const handleHealthCheck = async () => {
    setLoading(true);
    try {
      await runApiHealthCheck(endpoint);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>API Test Utility</Text>

        <Text style={styles.label}>API Endpoint</Text>
        <TextInput
          style={styles.input}
          value={endpoint}
          onChangeText={setEndpoint}
          placeholder="Enter API endpoint URL"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>HTTP Method</Text>
        <View style={styles.methodButtons}>
          {(["GET", "POST", "PUT", "DELETE"] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.methodButton, method === m && styles.activeMethod]}
              onPress={() => setMethod(m)}
            >
              <Text
                style={
                  method === m ? styles.activeMethodText : styles.methodText
                }
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {(method === "POST" || method === "PUT") && (
          <>
            <Text style={styles.label}>Request Body (JSON)</Text>
            <TextInput
              style={[styles.input, styles.bodyInput]}
              value={requestBody}
              onChangeText={setRequestBody}
              placeholder="Enter JSON request body"
              multiline
              autoCapitalize="none"
              autoCorrect={false}
            />
          </>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleTestApi}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Test API</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.healthButton]}
            onPress={handleHealthCheck}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Quick Health Check</Text>
          </TouchableOpacity>
        </View>

        {response ? (
          <>
            <Text style={styles.responseLabel}>Response:</Text>
            <ScrollView style={styles.responseContainer}>
              <Text style={styles.responseText}>{response}</Text>
            </ScrollView>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: SPACING.l,
  },
  title: {
    fontSize: FONT.sizes.xl,
    fontWeight: "bold",
    marginBottom: SPACING.l,
    color: COLORS.text,
    textAlign: "center",
  },
  label: {
    fontSize: FONT.sizes.m,
    fontWeight: "600",
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    color: COLORS.text,
  },
  bodyInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  methodButtons: {
    flexDirection: "row",
    marginBottom: SPACING.m,
  },
  methodButton: {
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: 8,
    marginRight: SPACING.s,
    backgroundColor: COLORS.border,
  },
  activeMethod: {
    backgroundColor: COLORS.primary,
  },
  methodText: {
    color: COLORS.text,
  },
  activeMethodText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: SPACING.m,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: SPACING.s,
  },
  healthButton: {
    backgroundColor: COLORS.secondary,
    marginRight: 0,
    marginLeft: SPACING.s,
  },
  buttonText: {
    color: "white",
    fontSize: FONT.sizes.m,
    fontWeight: "bold",
  },
  responseLabel: {
    fontSize: FONT.sizes.m,
    fontWeight: "600",
    marginTop: SPACING.m,
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  responseContainer: {
    backgroundColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.m,
    maxHeight: 300,
  },
  responseText: {
    fontFamily: "monospace",
    fontSize: FONT.sizes.s,
    color: COLORS.text,
  },
});

export default ApiTestScreen;

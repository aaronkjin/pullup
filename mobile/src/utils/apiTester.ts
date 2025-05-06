import { Alert } from 'react-native';

/**
 * Utility to test the AWS API endpoint
 * @param endpoint The API endpoint URL to test
 * @param method HTTP method to use (default: GET)
 * @param body Optional request body for POST/PUT requests
 * @returns Promise with the response data
 */
export const testApiEndpoint = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    console.log(`Testing endpoint: ${endpoint} with method: ${method}`);
    
    const response = await fetch(endpoint, options);
    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Request failed with status ${response.status}`,
        data
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('API test error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Runs a basic health check on the API endpoint
 * @param endpoint The API endpoint URL to test
 * @returns Promise with health check result
 */
export const runApiHealthCheck = async (endpoint: string): Promise<void> => {
  try {
    // Test basic GET request
    const getResult = await testApiEndpoint(endpoint);
    
    if (getResult.success) {
      Alert.alert(
        'API Test Successful',
        `The endpoint is working correctly! Response: ${JSON.stringify(getResult.data, null, 2)}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'API Test Failed',
        `The endpoint returned an error: ${getResult.error}`,
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    Alert.alert(
      'API Test Error',
      `Failed to test API: ${error instanceof Error ? error.message : String(error)}`,
      [{ text: 'OK' }]
    );
  }
}; 
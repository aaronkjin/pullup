declare module '@react-navigation/native' {
  export const NavigationContainer: React.ComponentType<any>;
  export type NavigationProp<T> = any;
  export type RouteProp<T, K extends keyof T> = any;
  export function useNavigation<T = any>(): T;
  export function useRoute<T = any>(): T;
  
  export interface TabBarIconProps {
    focused: boolean;
    color: string;
    size: number;
  }
}

declare module '@react-navigation/native-stack' {
  export function createNativeStackNavigator(): any;
  export type NativeStackNavigationProp<T, K extends keyof T = any> = any;
  export type NativeStackScreenProps<T, K extends keyof T = any> = any;
}

declare module '@react-navigation/bottom-tabs' {
  export function createBottomTabNavigator(): any;
  export type BottomTabNavigationProp<T, K extends keyof T = any> = any;
  export type BottomTabScreenProps<T, K extends keyof T = any> = any;
  
  export interface BottomTabBarProps {
    state: any;
    descriptors: any;
    navigation: any;
  }
  
  export interface TabBarIconProps {
    focused: boolean;
    color: string;
    size: number;
  }
}

declare module '@react-navigation/stack' {
  export function createStackNavigator(): any;
  export type StackNavigationProp<T, K extends keyof T = any> = any;
  export type StackScreenProps<T, K extends keyof T = any> = any;
} 
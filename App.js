import React, { Component } from "react";
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from "react-navigation-stack";
import SplashScreen from "./src/pages/SplashScreen";
import LoginScreen from "./src/pages/LoginScreen";
import HomeScreen from "./src/pages/HomeScreen";
import ChatScreen from "./src/pages/ChatScreen";
import ChatChildScreen from "./src/pages/ChatChildScreen";
import EditScreen from "./src/pages/EditScreen";
import { createBottomTabNavigator } from "react-navigation-tabs";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Text } from 'react-native';

const AuthNavigator = createStackNavigator({
  Login: {
    screen: LoginScreen
  },
  // Register: {   screen: RegisterScreen }
}, { headerMode: 'none' });

const SplashNavigator = createStackNavigator({
  Splash: {
    screen: SplashScreen
  }
}, { headerMode: 'none' })

const ChatStack = createStackNavigator({
  ChatChildScreen,
  ChatScreen,
  EditScreen
}, { headerMode: 'none', initialRouteName: "ChatScreen" })

ChatStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible
  }
}

const activeTintLabelColor = '#18a4e0';
const inactiveTintLabelColor = '#043353';

const HomeNavigator = createBottomTabNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      tabBarLabel: ({ focused }) => <Text
        style={{
          fontSize: 10,
          color: focused
            ? activeTintLabelColor
            : inactiveTintLabelColor,
          alignSelf: "center"
        }}>
        Home
      </Text>,
      tabBarIcon: ({ focused }) => (<Icon
        name='home'
        color={focused
          ? activeTintLabelColor
          : inactiveTintLabelColor}
        size={24} />)
    }
  },
  Chat: {
    screen: ChatStack,
    navigationOptions: {
      tabBarLabel: ({ focused }) => <Text
        style={{
          fontSize: 10,
          color: focused
            ? activeTintLabelColor
            : inactiveTintLabelColor,
          alignSelf: "center"
        }}>
        Chat
      </Text>,
      tabBarIcon: ({ focused }) => (<Icon
        name='comment'
        color={focused
          ? activeTintLabelColor
          : inactiveTintLabelColor}
        size={24} />)
    }
  }
}, {
  activeTintColor: activeTintLabelColor,
  inactiveTintColor: inactiveTintLabelColor,
  barStyle: {
    backgroundColor: '#fff'
  }
})



const MainNavigator = createSwitchNavigator({
  Splash: {
    screen: SplashNavigator
  },
  Auth: {
    screen: AuthNavigator
  },
  Home: {
    screen: HomeNavigator
  }
})

const Navigation = createAppContainer(MainNavigator);

export default class App extends Component {
  render() {
    return (<Navigation />)
  }
};
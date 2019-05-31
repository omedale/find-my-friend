import React, {Component} from 'react';
import { createStackNavigator, createAppContainer } from "react-navigation";
import Home from './Components/Home';
import CustomHeader from './Components/CustomHeader'

const ACTIVE_TAB_COLOR = '#07748c'
const INACTIVE_TAB_COLOR = '#aaa'

const headerStyles = {
  headerTintColor: '#fff',
  headerStyle: {
    borderBottomWidth: 0,
    backgroundColor: ACTIVE_TAB_COLOR,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 }
  }
}

const RootStack = createStackNavigator({
  Home: { screen: Home, 
    navigationOptions: {
      title: 'Home',
      header: props =><CustomHeader {...props} title="Hello" subtitle="World" />,
      ...headerStyles
    }
   },
});

const App = createAppContainer(RootStack);

export default App;


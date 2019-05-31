import React from "react";
import { View, Header, Text, Container, Icon, Button, Title } from 'native-base';
import {
  StyleSheet,
  Platform
} from 'react-native';

const CustomHeader = ({ title, subtitle }) => (
  <Header>
    <Text style={styles.title}>{title}</Text>
  </Header>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fc0',
    flex: 1,
    flexDirection: 'row'
  },
  title: {
    fontSize: 20,
    color: 'blue',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'purple',
    fontWeight: 'bold',
  },
});


export default CustomHeader;
import React, {Component} from 'react';
import { REACT_APP_SCALEDRONE_CHANNEL_ID } from 'react-native-dotenv';
const Scaledrone = require('scaledrone-react-native');
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  PermissionsAndroid,
  Platform
} from 'react-native';
import { SwipeRow, Button, Text, Icon, Container, Content, Header, Title } from 'native-base';
import prompt from 'react-native-prompt-android';
import MapView, {Marker, AnimatedRegion, PROVIDER_GOOGLE} from 'react-native-maps';

const screen = Dimensions.get('window');

const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;



async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        'title': 'Location Permission',
        'message': 'This App needs access to your location ' +
                   'so we can know where you are.'
      }
    )
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use locations ")
    } else {
      console.log("Location permission denied")
    }
  } catch (err) {
    console.warn(err)
  }
}


export default class Home extends Component {

  constructor() {
    super();
    this.state = {
      members: [],
      locations: []
    };
  }

  componentWillMount() {
    requestLocationPermission()
  }

  getName() {
    prompt(
      'Please insert your name',
      null,
      [
        {text: 'Cancel', onPress: () => console.log('Error'), style: 'cancel'},
        {text: 'OK', onPress: name => console.log(name)},
       ],
       {
           cancelable: false,
           defaultValue: 'test',
           placeholder: 'placeholder'
       }
    );
  }

  updateLocation(data, clientId) {
    this.setState({ locations: [...this.state.locations, {data, clientId}] }) 
    console.log(this.state.locations)
  }

  getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
      //Will give you the current location
       (position) => {
         console.log(position.coords.longitude)
         console.log(position.coords.latitude)
       },
       (error) => alert(error.message),
       { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
       )
  }

  componentDidMount() {
    this.getCurrentLocation()
  }

  startLocationTracking(callback) {
    navigator.geolocation.watchPosition(
      callback,
      error => console.error(error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000
      }
    );
  }
  
  createMarkers() {
    const {members} = this.state;
    const location = { latitude: 6.4550575, longitude: 3.3941795};
    const membersWithLocations = members.filter(m => !!m.id);
    console.log(membersWithLocations)
    return membersWithLocations.map(member => {
      const {id, authData} = member;
      const {name, color} = authData;
      return (
        <Marker.Animated
          key={id}
          identifier={id}
          coordinate={location}
          pinColor={color}
          title={name}
        />
      );
    });
  }

  fitToMarkersToMap() {
    const {members} = this.state;
    this.map.fitToSuppliedMarkers(members.map(m => m.id), true);
  }

  rowOpen() {
    console.log('on open rows')
    this.component._root.closeRow()
  }

  render() {
    return (
      <Container style={styles.container}>
        <MapView
            zoomEnabled={true}
            zoomControlEnabled={true}
            style={styles.map}
            ref={ref => {this.map = ref;}}
            initialRegion={{
              latitude: 6.4550575,
              longitude: 3.3941783333333326,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
          >
        </MapView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => this.fitToMarkersToMap()}
            style={[styles.bubble, styles.button]}
          >
            <Text>Fit Markers Onto Map</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabBarInfoContainer}>
          <Text style={styles.tabBarInfoText}>This is a tab bar. You can edit it in:</Text>
          <SwipeRow
            style={styles.swiperContainer}
            ref={(c) => { this.component = c }}
            leftOpenValue={75}
            onRowOpen={() => this.rowOpen()}
            disableLeftSwipe = {true}
            body={
                <View style={[{flexDirection: 'row'}]}>
                  <Button style={styles.roundButtonWrapper} rounded success>
                    <Text style={styles.roundSlideButton}>fem</Text>
                  </Button>
                </View>
            }
          />
        </View>
    </Container>
    );
  }
}

const styles = StyleSheet.create({
  roundSlideButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  roundButtonWrapper: {
    flex: 1,
    backgroundColor: '#07748c'
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 20,
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  navigationFilename: {
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
    marginBottom: 400,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  members: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 10,
  },
  member: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,1)',
    borderRadius: 20,
    height: 30,
    marginTop: 10,
  },
  memberName: {
    marginHorizontal: 10,
  },
  avatar: {
    height: 30,
    width: 30,
    borderRadius: 15,
  },
  swiperContainer: {
    // borderColor: 'red',
    // borderWidth: 2,
    flex: 1,
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0
  },
  tabBarInfoContainer: {
    paddingHorizontal: 10,
    position: 'absolute',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
});
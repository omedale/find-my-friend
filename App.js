import React, {Component} from 'react';
import { REACT_APP_SCALEDRONE_CHANNEL_ID } from 'react-native-dotenv';
const Scaledrone = require('scaledrone-react-native');
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  PermissionsAndroid,
} from 'react-native';
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

function doAuthRequest(clientId, name) {
  let status;
  return fetch('http://10.0.2.2:3000/auth', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({clientId, name}),
  }).then(res => {
    status = res.status;
    return res.text();
  }).then(text => {
    if (status === 200) {
      return text;
    } else {
      alert(text);
    }
  }).catch(error => console.error(error));
}

export default class App extends Component {

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

  updateLocation(data, clientId) {
    this.setState({ locations: [...this.state.locations, {data, clientId}] }) 
    console.log(this.state.locations)
  }

  componentDidMount() {
    console.log(REACT_APP_SCALEDRONE_CHANNEL_ID)
    const drone = new Scaledrone(REACT_APP_SCALEDRONE_CHANNEL_ID);
    drone.on('error', error => console.error(error));
    drone.on('close', reason => console.error(reason));
    drone.on('open', error => {
      if (error) {
        return console.error(error);
      }
      prompt(
        'Please insert your name',
        null,
        [
          {text: 'Cancel', onPress: () => console.log('Error'), style: 'cancel'},
          {text: 'OK', onPress: name => doAuthRequest(drone.clientId, name).then(
            jwt => drone.authenticate(jwt)
          )},
         ],
         {
             cancelable: false,
             defaultValue: 'test',
             placeholder: 'placeholder'
         }
      );
    });
    const room = drone.subscribe('observable-locations', {
      historyCount: 50 // load 50 past messages
    });
    room.on('open', error => {
      if (error) {
        return console.error(error);
      }
      this.startLocationTracking(position => {
        const {latitude, longitude} = position.coords;
        // publish device's new location
        drone.publish({
          room: 'observable-locations',
          message: {latitude, longitude}
        });
      });
    });
    // received past message
    room.on('history_message', message =>
      this.updateLocation(message.data, message.clientId)
    );
    // received new message
    room.on('data', (data, member) =>
      this.updateLocation(data, member.id)
    );
    // array of all connected members
    room.on('members', members =>
      this.setState({members})
    );
    // new member joined room
    room.on('member_join', member => {
      const members = this.state.members.slice(0);
      members.push(member);
      this.setState({members});
    });
    // member left room
    room.on('member_leave', member => {
      const members = this.state.members.slice(0);
      const index = members.findIndex(m => m.id === member.id);
      if (index !== -1) {
        members.splice(index, 1);
        this.setState({members});
      }
    });
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
    const location = { latitude: 37.421998333333335, longitude: -122.08400000000002};
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

  createMembers() {
    const {members} = this.state;
    return members.map(member => {
      const {name, color} = member.authData;
      return (
        <View key={member.id} style={styles.member}>
          <View style={[styles.avatar, {backgroundColor: color}]}/>
          <Text style={styles.memberName}>{name}</Text>
        </View>
      );
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          ref={ref => {this.map = ref;}}
          initialRegion={{
            latitude: 37.421998333333335,
            longitude: -122.08400000000002,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
        >
          {this.createMarkers()}
        </MapView>
        <View pointerEvents="none" style={styles.members}>
          {this.createMembers()}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => this.fitToMarkersToMap()}
            style={[styles.bubble, styles.button]}
          >
            <Text>Fit Markers Onto Map</Text>
          </TouchableOpacity>
        </View>
    </View>
    );
  }
}

const styles = StyleSheet.create({
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
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
    marginBottom: 400,
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
  }
});
import React, { Component } from "react";
import {
  Text,
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  PermissionsAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback
} from "react-native";
import MapView from "react-native-maps";
import Modal from "react-native-modal";
import Dropdown from "react-native-modal-dropdown";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as ip_server from './server_ip';
import * as Location from 'expo-location';

import * as SecureStore from 'expo-secure-store';


import * as theme from "../theme";
async function log_out() {
  await SecureStore.deleteItemAsync('token');
}

const { Marker } = MapView;
const { height, width } = Dimensions.get("screen");


class ParkingMap extends Component {
  ws = {}
  firstTime = 0;
  refreshTime = 0;
  state = {
    hours: {},
    Location: {
      latitude: 44.80591232649438,
      longitude: -0.6054219633020543
    },
    parking: [],
    active: null,
    parkingsSpots: [],
    activeModal: null
  };

  UNSAFE_componentWillMount() {

    const { parkings } = this.props;
    const hours = {};

    parkings.map(parking => {
      hours[parking.id] = 1;
    });

    this.setState({ hours });
  }

  handleHours = (id, value) => {
    const { hours } = this.state;
    hours[id] = value;

    this.setState({ hours });
  };

  renderHeader() {
    return (
      <View style={styles.header}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.headerTitle}>Localisation :</Text>
          <Text style={styles.headerLocation}>Bordeaux-INP, FR</Text>
        </View>
        <TouchableWithoutFeedback >
          <Ionicons name="ios-stats-chart-sharp" style={{ marginRight: 15, marginTop: 13 }} size={theme.SIZES.icon * 2}
            onPress={() => {
              this.props.navigation.navigate('Statistics');

            }
            }
          />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback >
          <Ionicons name="ios-people-sharp" style={{ marginRight: 15, marginTop: 13 }} size={theme.SIZES.icon * 2}
            onPress={() => {
              this.props.navigation.navigate('User');

            }
            }
          />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback >
          <Ionicons name="create-outline" style={{ marginRight: 15, marginTop: 13 }} size={theme.SIZES.icon * 2}
            onPress={() => {
              this.props.navigation.navigate('Parking');

            }
            }
          />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
          <Ionicons name="ios-log-out" style={{ marginTop: 13 }} size={theme.SIZES.icon * 2}
            onPress={() => {
              log_out()
              this.props.navigation.navigate('LoginScreen')
            }
            }
          />
        </TouchableWithoutFeedback>

      </View>
    );
  }

  renderParking = item => {
    return (
      <TouchableWithoutFeedback
        key={`parking-${item.id}`}
        onPress={() => this.setState({ active: item.id })}
      >
        <View style={[styles.parking, styles.shadow]}>
          <View style={styles.hours}>
            <Text style={styles.hoursTitle}>
              {"Nom : " + item.title}{"\n"}
              {"Disponibilité : "}{item.free + " places\n"}
              {"Type : "} {item.type}
            </Text>
          </View>
          <View style={styles.parkingInfoContainer}>
            <TouchableOpacity
              style={styles.buy}
              onPress={() => this.setState({ activeModal: item })}
            >
              <View style={styles.buyTotal}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.buyTotalPrice}>details ici</Text>
                </View>
              </View>
              <View style={styles.buyBtn}>
                <FontAwesome
                  name="angle-right"
                  size={theme.SIZES.icon * 1.75}
                  color={theme.COLORS.white}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  renderParkings = () => {
    return (
      <FlatList
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        snapToAlignment="center"
        style={styles.parkings}
        data={this.state.parking}
        extraData={this.state}
        keyExtractor={(item, index) => `${item.id}`}
        renderItem={({ item }) => this.renderParking(item)}
      />
    );
  };

  renderHours(id) {
    const { hours } = this.state;
    const availableHours = [1, 2, 3, 4, 5, 6];

    return (
      <Dropdown
        defaultIndex={0}
        options={availableHours}
        style={styles.hoursDropdown}
        defaultValue={`0${hours[id]}:00` || "01:00"}
        dropdownStyle={styles.hoursDropdownStyle}
        onSelect={(index, value) => this.handleHours(id, value)}
        renderRow={option => (
          <Text style={styles.hoursDropdownOption}>{`0${option}:00`}</Text>
        )}
        renderButtonText={option => `0${option}:00`}
      />
    );
  }

  renderModal() {
    const { activeModal, hours } = this.state;

    if (!activeModal) return null;

    return (
      <Modal
        isVisible
        useNativeDriver
        style={styles.modalContainer}
        backdropColor={theme.COLORS.overlay}
        onBackButtonPress={() => this.setState({ activeModal: null })}
        onBackdropPress={() => this.setState({ activeModal: null })}
        onSwipeComplete={() => this.setState({ activeModal: null })}

      >
        <View style={styles.modal}>
          <View>
            <Text style={{ fontSize: theme.SIZES.font * 1.5 }}>
              {activeModal.title}
            </Text>
          </View>
          <View style={{ paddingVertical: theme.SIZES.base }}>
            <Text
              style={{
                color: theme.COLORS.gray,
                fontSize: theme.SIZES.font * 1.1
              }}
            >
              {activeModal.description + "\n"}
            </Text>
          </View>
          <View style={styles.modalInfo}>

            <View
              style={[styles.parkingIcon, { justifyContent: "flex-start" }]}
            >

              <Text style={{ fontSize: theme.SIZES.icon * 1.15 }}>
                {" "}
                {"Type : " + activeModal.type}

              </Text>
            </View>
          </View>
          <View style={styles.modalInfo}>

            <View
              style={[styles.parkingIcon, { justifyContent: "flex-start" }]}
            >
              <Ionicons
                name="ios-car"
                size={theme.SIZES.icon * 1.3}
                color={theme.COLORS.gray}
              />
              <Text style={{ fontSize: theme.SIZES.icon * 1.15 }}>
                {" "}
                {activeModal.free}/{activeModal.spots}
              </Text>
            </View>
          </View>

        </View>
      </Modal>
    );
  }
  send_history_in = async (item) => {
    let token = await SecureStore.getItemAsync('token');
    if (token) {
      //
      host_name = await ip_server.get_hostname();
      var date = new Date();
      var date_json = {};
      date_json.secondes = date.getSeconds();
      date_json.minutes = date.getMinutes();
      date_json.hours = date.getHours();
      date_json.year = date.getFullYear();
      date_json.month = date.getMonth() + 1;
      date_json.day = date.getDate();
      date = null;

      let data = 'token=' + token + '&_id=' + item._id + '&secondes=' + '' + date_json.secondes + '&minutes=' + date_json.minutes + '&hours=' + date_json.hours + '&year=' + date_json.year
        + '&month=' + date_json.month + '&day=' + date_json.day + '&free=' + item.free;
      let linkLoc = 'http://' + host_name + '/Parking/update/in';
      let reqLoc = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },// this line is important, if this content-type is not set it wont work
        body: data

      };
      fetch(linkLoc, reqLoc)
        .then((res) => { return res.json(); })
        .then(res => {
          console.log(res.msg)
        }).catch(err => {

          console.log(err)

        });
    } else {
      log_out();
      this.props.navigation.navigate('LoginScreen');
    }

  }
  send_history_out = async (item) => {
    let token = await SecureStore.getItemAsync('token');
    if (token) {
      //
      host_name = await ip_server.get_hostname();
      var date = new Date();
      var date_json = {};
      date_json.secondes = date.getSeconds();
      date_json.minutes = date.getMinutes();
      date_json.hours = date.getHours();
      date_json.year = date.getFullYear();
      date_json.month = date.getMonth() + 1;
      date_json.day = date.getDate();
      date = null;
      let data = 'token=' + token + '&_id=' + item._id + '&secondes=' + '' + date_json.secondes + '&minutes=' + date_json.minutes + '&hours=' + date_json.hours + '&year=' + date_json.year
        + '&month=' + date_json.month + '&day=' + date_json.day + '&free=' + item.free;
      let linkLoc = 'http://' + host_name + '/Parking/update/out';
      let reqLoc = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },// this line is important, if this content-type is not set it wont work
        body: data

      };
      fetch(linkLoc, reqLoc)
        .then((res) => { return res.json(); })
        .then(res => {
          console.log(res.msg)
        }).catch(err => {

          console.log(err)

        });
    } else {
      log_out();
      this.props.navigation.navigate('LoginScreen');
    }

  }
  at_start_up = async () => {
    let token = await SecureStore.getItemAsync('token');
    if (this.firstTime == 0) {
      if (token) {
        //
        host_name = await ip_server.get_hostname();

        let data = 'token=' + token;
        let linkLoc = 'http://' + host_name + '/Parking/get';
        let reqLoc = {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },// this line is important, if this content-type is not set it wont work
          body: data

        };
        fetch(linkLoc, reqLoc)
          .then((res) => { return res.json(); })
          .then(res => {
            //console.log(res.parking )
            this.setState({ parkingsSpots: res.parking })
            this.firstTime = 1;
          }).catch(err => {

            console.log(err)

          });
      } else {
        log_out();
        this.props.navigation.navigate('LoginScreen');
      }
    }
  }
  get_current_location = async () => {
    let token = await SecureStore.getItemAsync('token');
    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (token) {
      if (granted) {
        //console.log("aaaaaaaaaa")
        let location = await Location.getCurrentPositionAsync({});
        let tmp_loc = {}
        tmp_loc.latitude = location.coords.latitude;
        tmp_loc.longitude = location.coords.longitude;
        this.setState({ Location: tmp_loc })
        //console.log(this.state.Location)
      }
    }
    else {
      log_out();
      this.propsnavigation.navigate('LoginScreen');
    }
  }
  onSendIncrement(item) {
    free = parseInt(item.free)
    item.free = free + 1;
    this.update(item);
    this.send_history_out(item);
    this.ws.current.send(JSON.stringify(item));
  }
  onSendDecrement(item) {
    free = parseInt(item.free)
    item.free = free - 1;
    this.update(item);
    this.send_history_in(item);
    this.ws.current.send(JSON.stringify(item));
  }
  refresh = async () => {

    this.props.navigation.addListener('focus', async () => {
      this.firstTime = 0;
      if (this.firstTime == 0) {
        this.at_start_up();

        console.log("initiateSocketConnection")
        // enter your websocket url
        let host_name = await ip_server.get_hostname();
        let hots_and_port = host_name.split(':');
        let just_host_name = hots_and_port[0];
        this.ws.current = new WebSocket('ws://' + just_host_name + ':3333/');
        this.ws.current.onopen = () => {
          console.log("connection establish open")
        };
        this.ws.current.onclose = () => {
          console.log("connection establish closed");
        }
        tmp_parking = {};
        this.ws.current.onmessage = e => {
          const response = JSON.parse(e.data);
          //console.log("onmessage=>", JSON.stringify(response));
          for (var i = 0; i < this.state.parkingsSpots.length; i++) {
            if (this.state.parkingsSpots[i]._id === response._id) {

              this.state.parkingsSpots[i].free = response.free;
              this.setState({ parkingsSpots: this.state.parkingsSpots })
            }
          }



        }
        return () => {
          this.ws.current.close();
        };
      }
    });
  }
  update = async (item) => {
    let host_name = await ip_server.get_hostname();
    let link = 'http://' + host_name + '/Parking/update';
    let token = await SecureStore.getItemAsync('token');

    let data = 'token=' + token + '&id=' + item._id + '&name=' + item.title + '&Lat=' + item.coordinate.latitude + '&Long=' + item.coordinate.longitude + '&capacite=' + item.spots
      + '&description=' + item.description + '&free=' + item.free;

    //console.log(data);

    let myInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, // this line is important, if this content-type is not set it wont work
      body: data
    };

    fetch(link, myInit)
      .then((res) => { return res.json(); })
      .then(res => {
        if (res.msg === '0') {
          //console.log("success"); 
        } else {
          //setErrorMsg(res.msg);
        }

      })
      .catch(err => {
        console.log(err);
        first_time = 1;
        navigation.navigate('Parking');

      })
      .finally(() => {

      });
  }
  render() {
    if (this.refreshTime == 0) {
      this.refresh();
      this.refreshTime = 1;
      //this.get_current_location();

    }

    const currentPosition = this.props.currentPosition;
    const parkings = this.state.parkingsSpots
    let token = SecureStore.getItemAsync('token');
    if (token) {

      return (
        <View style={styles.container}>
          {this.renderHeader()}
          <MapView initialRegion={currentPosition} style={styles.map}
            mapType="hybrid"
            showsUserLocation
            followsUserLocation
            showsTraffic
            showsIndoors
            showsIndoorLevelPicker
            showsMyLocationButton

          >
            {this.state.parkingsSpots.map(parking => (
              <Marker
                key={`marker-${parking.id}`}
                coordinate={parking.coordinate}
                onPress={() => {
                  this.setState({ active: parking.id });
                  //console.log([parking]) ;
                  this.setState({ parking: [parking] })
                }}
                icon={{ width: 260, height: 280 }}

              >

                <TouchableWithoutFeedback

                >
                  <View

                  >
                    <Ionicons name="ios-location"
                      style={[
                        this.state.active === parking.id ? styles.active : null
                      ]}
                      color="#7fff00"
                      size={30}
                    >

                    </Ionicons>
                  </View>
                </TouchableWithoutFeedback>
              </Marker>
            ))}

          </MapView>
          {this.state.active ? this.renderParkings() : <></>}
          {this.state.active ? this.renderModal() : <></>}
        </View>
      );
    }
    else {
      log_out();
      this.props.navigation.navigate('LoginScreen');
    }
  }
}

ParkingMap.defaultProps = {
  currentPosition: {
    latitude: 44.80591232649438,
    longitude: -0.6054219633020543,
    latitudeDelta: 0.00522,
    longitudeDelta: 0.00521
  },
  parkings: []
};

export default ParkingMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.white
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: theme.SIZES.base * 2,
    paddingTop: theme.SIZES.base * 4.5,
    paddingBottom: theme.SIZES.base * 1.5
  },
  headerTitle: {
    color: theme.COLORS.gray
  },
  headerLocation: {
    fontSize: theme.SIZES.font,
    fontWeight: "500",
    paddingVertical: theme.SIZES.base / 3
  },
  map: {
    flex: 3
  },
  parkings: {
    position: "absolute",
    right: 0,
    left: 0,
    bottom: 50,
    paddingBottom: theme.SIZES.base * 2
  },
  parking: {
    flexDirection: "row",
    backgroundColor: theme.COLORS.white,
    borderRadius: 6,
    padding: theme.SIZES.base,
    marginHorizontal: theme.SIZES.base * 2,
    width: width - 24 * 2
  },
  buy: {
    flex: 1,
    flexDirection: "row",
    marginLeft: theme.SIZES.base * 4,
    paddingHorizontal: theme.SIZES.base,
    paddingVertical: theme.SIZES.base * 0.5,
    backgroundColor: theme.COLORS.red,
    borderRadius: 6
  },
  buyTotal: {
    flex: 1,
    justifyContent: "space-evenly"
  },
  buyTotalPrice: {
    color: theme.COLORS.white,
    fontSize: theme.SIZES.base * 1.5,
    fontWeight: "400",
    paddingLeft: theme.SIZES.base / 4
  },
  buyBtn: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "flex-end"
  },
  marker: {
    flexDirection: "row",
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.base * 2,
    paddingVertical: 12,
    paddingHorizontal: theme.SIZES.base * 2,
    borderWidth: 1,
    borderColor: theme.COLORS.white
  },
  markerPrice: { color: theme.COLORS.red, fontWeight: "bold" },
  markerStatus: { color: theme.COLORS.gray },
  shadow: {
    shadowColor: theme.COLORS.black,
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  active: {
    borderColor: theme.COLORS.red
  },
  hours: {
    flex: 1,
    flexDirection: "column",
    marginLeft: theme.SIZES.base,
    justifyContent: "space-evenly"
  },
  hoursTitle: {
    fontSize: theme.SIZES.text,
    fontWeight: "400",
    marginRight: -50,

  },
  hoursDropdown: {
    borderRadius: theme.SIZES.base / 2,
    borderColor: theme.COLORS.overlay,
    borderWidth: 1,
    padding: theme.SIZES.base,
    marginRight: theme.SIZES.base / 2
  },
  hoursDropdownOption: {
    padding: 5,
    fontSize: theme.SIZES.font * 0.8
  },
  hoursDropdownStyle: {
    marginLeft: -theme.SIZES.base,
    paddingHorizontal: theme.SIZES.base / 2,
    marginVertical: -(theme.SIZES.base + 1)
  },
  parkingInfoContainer: { flex: 1.5, flexDirection: "row" },
  parkingInfo: {
    justifyContent: "space-evenly",
    marginHorizontal: theme.SIZES.base * 1.5
  },
  parkingIcon: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  modalContainer: {
    margin: 0,
    justifyContent: "flex-end"
  },
  modal: {
    flexDirection: "column",
    height: height * 0.75,
    padding: theme.SIZES.base * 2,
    backgroundColor: theme.COLORS.white,
    borderTopLeftRadius: theme.SIZES.base,
    borderTopRightRadius: theme.SIZES.base
  },
  modalInfo: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: theme.SIZES.base,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: theme.COLORS.overlay,
    borderBottomColor: theme.COLORS.overlay
  },
  modalHours: {
    paddingVertical: height * 0.11
  },
  modalHoursDropdown: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.SIZES.base
  },
  payBtn: {
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.SIZES.base * 1.5,
    backgroundColor: theme.COLORS.red
  },
  payText: {
    fontWeight: "600",
    fontSize: theme.SIZES.base * 1.5,
    color: theme.COLORS.white
  }
});

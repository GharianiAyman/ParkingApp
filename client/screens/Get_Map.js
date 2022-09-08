import React from "react";
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import MapView from "react-native-maps";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as theme from "../theme";

const { Marker } = MapView;
const { height, width } = Dimensions.get("screen");


export default class Get_Map extends React.Component {
  state = {
    active: false,
    coordinate: {}
  }
  item = this.props.route.params.item;
  map_coordinate = {};
  onMapPress = (e) => {
    this.setState({ active: true });
    this.setState({ coordinate: e.nativeEvent.coordinate });
    this.map_coordinate = e.nativeEvent.coordinate;
  }


  renderParking = () => {
    return (
      <TouchableWithoutFeedback
      >
        <View style={[styles.parking, styles.shadow]}>
          <View style={styles.parkingInfoContainer}>
            <TouchableOpacity
              style={styles.buy}
            >
              <View style={styles.buyTotal}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.buyTotalPrice}>details here</Text>
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
  render() {

    return (
      <View style={{ flex: 1 }}>
        <MapView
          mapType="hybrid"
          style={{ flex: 1 }}
          initialRegion={{
            latitude: 44.80591232649438,
            longitude: -0.6054219633020543,
            latitudeDelta: 0.00522,
            longitudeDelta: 0.00521
          }}
          onPress={e => this.onMapPress(e)}
        >
          {this.state.active ?
            <View>
              <Marker
                coordinate={this.state.coordinate}>
                <View>
                  <Ionicons name="ios-location"
                    color="red"
                    size={30}
                  >
                  </Ionicons>
                </View>
              </Marker>
            </View>
            : <></>

          }

        </MapView>
        {this.state.active ?
          <TouchableWithoutFeedback
          >
            <View style={[styles.parking, styles.shadow]}>
              <View style={styles.parkingInfoContainer}>
                <TouchableOpacity
                  style={styles.buy}
                  onPress={() => {
                    if (this.item == null) {
                      const map_coordinate = this.map_coordinate;
                      const item = this.item;
                      this.props.navigation.navigate('AddParking', { item, map_coordinate });
                    }
                    else {
                      const map_coordinate = this.map_coordinate;
                      const item = this.item;
                      this.props.navigation.navigate('UpdateParking', { item, map_coordinate });
                    }

                  }}
                >
                  <View style={styles.buyTotal}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={styles.buyTotalPrice}> Valider </Text>
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
          : <></>
        }
      </View>
    );
  }
}

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
    paddingHorizontal: theme.SIZES.base * 1.5,
    paddingVertical: theme.SIZES.base,
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
    marginLeft: theme.SIZES.base / 2,
    justifyContent: "space-evenly"
  },
  hoursTitle: {
    fontSize: theme.SIZES.text,
    fontWeight: "500"
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
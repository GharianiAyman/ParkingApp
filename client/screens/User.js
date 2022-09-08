import React, { useState } from 'react';
import styles from '../assets/styles';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import * as ip_server from './server_ip';
import * as SecureStore from 'expo-secure-store';
import { Alert, LogBox } from 'react-native';

async function log_out() {
  await SecureStore.deleteItemAsync('token');
}

import {
  ScrollView,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  FlatList
} from 'react-native';
import CardItem from '../components/CardItem';

var datadb = [];

var host_name;

const Parking = () => {
  const navigation = useNavigation();


  // only to oblige refresh
  const [state, setState] = useState({});

  const [dataUpdated, setDataupdated] = useState(false);


  const at_start_up = async () => {



    let token = await SecureStore.getItemAsync('token');
    if (token) {
      //
      host_name = await ip_server.get_hostname();

      let data = 'token=' + token;
      let linkLoc = 'http://' + host_name + '/User/get';
      let reqLoc = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },// this line is important, if this content-type is not set it wont work
        body: data

      };
      fetch(linkLoc, reqLoc)
        .then((res) => { return res.json(); })
        .then(res => {
          datadb = res.User;
          setDataupdated(true);
        }).catch(err => {

          console.log(err)

        });
    } else {
      log_out();
      navigation.navigate('LoginScreen');
    }



  }
  showAlert = (_id) => {
    Alert.alert(
      'Are you sure to delete this item ?',
      ' ',

      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => { delete_user(_id); setState({}); navigation.navigate('Map'); navigation.navigate('User'); } },
      ]
    );
  }
  const delete_user = async (id) => {
    let token = await SecureStore.getItemAsync('token');
    if (token) {
      //
      host_name = await ip_server.get_hostname();

      let data = 'token=' + token + '&id=' + id;
      let linkLoc = 'http://' + host_name + '/User/delete';
      let reqLoc = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },// this line is important, if this content-type is not set it wont work
        body: data

      };
      fetch(linkLoc, reqLoc)
        .then((res) => { return res.json(); })
        .then(res => {
          console.log("deleted");
        }).catch(err => {

          console.log(err)

        });
    } else {
      log_out();
      navigation.navigate('LoginScreen');
    }



  }
  useFocusEffect(
    React.useCallback(() => {
      at_start_up();
      if (state) {
        LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

        // console.log('useFocusEffect');
      }


    })
  );




  return (
    <ImageBackground
      source={require('../assets/images/bg.png')}
      style={styles.bg}
    >
      <View style={styles.containerMatches}>
        <ScrollView  >
          <View style={styles.top}>
            <Text style={styles.title}>Utilsateurs</Text>
            <Ionicons name="refresh-outline" size={34} color="#52575D"
              style={{ marginLeft: 182 }}
              onPress={() => { setState({}); navigation.navigate('User'); }}
            ></Ionicons>
          </View>
          <SafeAreaView style={{ flex: 1 }}>

            {
              dataUpdated && datadb.length > 0 ?
                <FlatList
                  numColumns={1}
                  data={datadb}

                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity>
                      {
                        <CardItem
                          name={item.username}
                          description={" email : " + item.email}
                          actions
                          onPressRight={() => { showAlert(item._id); }}
                          onPressLeft={() => { setState({}); navigation.navigate('UpdateUser', { item },); }}
                        />

                      }

                    </TouchableOpacity>
                  )}
                />
                : <View><Text>No element</Text></View>

            }
          </SafeAreaView>
        </ScrollView>
      </View>
    </ImageBackground>

  );
};

export default Parking;
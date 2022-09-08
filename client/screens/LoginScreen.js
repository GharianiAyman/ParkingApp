import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Modal
} from 'react-native';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import { useNavigation } from '@react-navigation/native';

import { useFocusEffect } from '@react-navigation/native';


import * as SecureStore from 'expo-secure-store';

import * as ip_server from './server_ip';


async function signup(value) {
  await SecureStore.setItemAsync('token', value);
}

var serverIp_txt = '';
var serverPort_txt = '';

var popup_first_time = true;

const LoginScreen = ({}) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [errorMsg, setErrorMsg] = useState('');
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(true);

  const at_start_up = async () => {
    if(popup_first_time){
      popup_first_time = false;
      await ip_server.verify(setModalVisible, serverIp_txt, serverPort_txt);
    }
    // if connected
    let result = await SecureStore.getItemAsync('token');
    if (result) {
      navigation.navigate('Map');
    }
  }
  useFocusEffect(
    React.useCallback(() => {
      at_start_up();
    })
  );



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.text}>Parking App</Text>

      <FormInput
        labelValue={email}
        onChangeText={(userEmail) => setEmail(userEmail)}
        placeholderText="Email"
        iconType="user"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FormInput
        labelValue={password}
        onChangeText={(userPassword) => setPassword(userPassword)}
        placeholderText="Mot de passe"
        iconType="lock"
        secureTextEntry={true}
      />

      <Text style={styles.error_msg}>
        {errorMsg}  
      </Text>

      <FormButton
        buttonTitle="Sign In"
        onPress = {async ()=>{

          setErrorMsg('');

          let host_name = await ip_server.get_hostname();
          let link = 'http://'+host_name+'/users/login';


          let data = 'email='+email+'&password='+password;

          let myInit = {
            method: 'POST',
            headers: {'Content-Type':'application/x-www-form-urlencoded'}, // this line is important, if this content-type is not set it wont work
            body: data
          };

          fetch(link, myInit)
          .then((res)=>{return res.json();})
          .then(res =>{

            if(res.msg === '0'){
              signup(res.token);
              navigation.navigate('Map');
            }else{
              setErrorMsg(res.msg);
            }

          })
          .catch(err =>{
              console.log(err);
          });

        }}
      />

      <TouchableOpacity
        style={styles.forgotButton}
        >
        <Text style={styles.navButtonText}
         onPress={() => navigation.navigate('SignupScreen')}
         >
          Créer un compte
        </Text>
      </TouchableOpacity>

      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={
              () => {
                   setModalVisible(true);
              }
          }
      >
        <View style={styles.popup}>
          <Text>
              Can't find the server.
          </Text>
          <Text>
            Please Type ip and port :
          </Text>
          <TextInput
            style={{height: 40}}
            placeholder="ip"
            onChangeText={newText => serverIp_txt = newText}
            defaultValue={serverIp_txt}
          />
          <TextInput
            style={{height: 40}}
            placeholder="port"
            onChangeText={newText => serverPort_txt = newText}
            defaultValue={serverPort_txt}
          />
          <Button
            title = 'Test DB connection'
            onPress={
              ()=>{
                setModalVisible(false);
                ip_server.verify(setModalVisible, serverIp_txt, serverPort_txt);
              }
            }
          />
          <Button
            title = 'delete registred ip and port'
            onPress={
              ()=>{
                ip_server.restart();
                setModalVisible(false);
                ip_server.verify(setModalVisible, serverIp_txt, serverPort_txt);

              }
            }
          />

        </View>
      </Modal>
      
    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50
  },
  logo: {
    height: 200,
    width: 350,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 28,
    marginBottom: 10,
    color: '#051d5f',
  },
  navButton: {
    marginTop: 15,
  },
  forgotButton: {
    marginVertical: 35,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2e64e5',
  },
  popup : {
    top : 100,
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  error_msg : {
    fontSize: 13,
    fontWeight : 'bold',
    color : 'red'
  }
});

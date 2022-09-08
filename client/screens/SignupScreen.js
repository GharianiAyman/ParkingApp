import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import { useNavigation } from '@react-navigation/native';



import * as SecureStore from 'expo-secure-store';

import * as ip_server from './server_ip';

async function store_token(value) {
  await SecureStore.setItemAsync('token', value);
}

const SignupScreen = ({ }) => {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [errorMsg, setErrorMsg] = useState('');
  const navigation = useNavigation();

  // for test
  const [signUpButtonTitle, setSignUpButtonTitle] = useState("Sign up");

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Créer un compte</Text>
      <FormInput
        labelValue={name}
        onChangeText={(userName) => setName(userName)}
        placeholderText="Nom"
        iconType="user"
        autoCapitalize="none"
        autoCorrect={false}
      />
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

      <FormInput
        labelValue={confirmPassword}
        onChangeText={(userPassword) => setConfirmPassword(userPassword)}
        placeholderText="Confirmer mot de passe"
        iconType="lock"
        secureTextEntry={true}
      />

      <Text style={styles.error_msg}>
        {errorMsg}
      </Text>

      <FormButton
        buttonTitle={signUpButtonTitle}
        onPress={async () => {

          setErrorMsg('');

          if (confirmPassword != password) {
            setErrorMsg('password doesn\'t matche confirmed password.\n')
            return;
          }

          let host_name = await ip_server.get_hostname();
          let link = 'http://' + host_name + '/users/register';

          /*
          
            * Req :
              curl
                -X POST 
                -d 'username=lora'
                -d 'email=lora17@yml.fr'
                -d 'password=kona75mi:-)'
                http://localhost:3000/users/register
            
            * Res :
                {
                  msg : '0' if no err,
                  token : if no err
                }
          */

          let data = 'username=' + name + '&email=' + email + '&password=' + password;

          let myInit = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, // this line is important, if this content-type is not set it wont work
            body: data
          };

          fetch(link, myInit)
            .then((res) => { return res.json(); })
            .then(res => {


              if (res.msg === '0') {
                store_token(res.token);
                navigation.navigate('LoginScreen');
              } else {
                setErrorMsg(res.msg);
              }

            })
            .catch(err => {
              console.log(err);
            })
            .finally(() => {

            });
        }}
      />





      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('LoginScreen')}>
        <Text style={styles.navButtonText}>Avez-vous un compte? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafd',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 28,
    marginBottom: 10,
    color: '#051d5f',
  },
  navButton: {
    marginTop: 15,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2e64e5',
  },
  textPrivate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 35,
    justifyContent: 'center',
  },
  color_textPrivate: {
    fontSize: 13,
    fontWeight: '400',
    color: 'grey',
  },
  error_msg: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'red'
  }
});
export default SignupScreen;
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import SignupScreen from './SignupScreen';
import LoginScreen from './LoginScreen';
import Parking from './Parking';
import Map from './Map';
import AddParking from './AddParking';
import UpdateParking from './UpdateParking';
import UpdateUser from './UpdateUser';
import User from './User';
import Get_Map from './Get_Map';
import Statistics from './Statistics';
import Charts from './Charts';


const Stack = createNativeStackNavigator();
const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Group>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="Charts" component={Charts} />
        <Stack.Screen name="Statistics" component={Statistics} />
        <Stack.Screen name="AddParking" component={AddParking} />        
        <Stack.Screen name="Get_Map" component={Get_Map} />        
        <Stack.Screen name="UpdateParking" component={UpdateParking} />          
        <Stack.Screen name="UpdateUser" component={UpdateUser} />        
        <Stack.Screen name="User" component={User} />
        <Stack.Screen name="Parking" component={Parking} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="Map" component={Map} />
      </Stack.Group>
    </Stack.Navigator>
  )
}

export default StackNavigator;
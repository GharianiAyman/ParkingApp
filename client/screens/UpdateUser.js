import React from "react";
import { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import * as ip_server from './server_ip';
import { useRoute } from '@react-navigation/native';
async function log_out(){
    await SecureStore.deleteItemAsync('token');
}

var first_time = 1;


const AddPrking = ({ }) => {
    
    const navigation = useNavigation();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    const [checkMsg, setCheckMsg] = useState('');

    const [saveButtonTitle, setSaveButtonTitle] = useState('Save');
    const route = useRoute();
    const _id = route.params.item._id; 




    const at_start_up = async () => {
        
       

        if(first_time === 1){
            first_time = 0;
            let token = await SecureStore.getItemAsync('token');
            if (token) {
                
                let host_name = await ip_server.get_hostname();
                let link = 'http://'+host_name+'/User/getOne';

                let data = 'token='+token + '&id='+_id;

                let myInit = {
                    method: 'POST',
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}, // this line is important, if this content-type is not set it wont work
                    body: data
                };

                fetch(link, myInit)
                .then((res)=>{return res.json();})
                .then( res =>{

                    setUsername(res.client.username);
                    if(res.client.hasOwnProperty('email')){
                        setEmail(res.client.email);
                    }

                    
                    
                }).catch(err => {
                    first_time = 1;

                });
                
            }else{
                first_time = 1;
                log_out();
                navigation.navigate('LoginScreen');
            }
        }
    
    }

    useFocusEffect(
        React.useCallback(() => {
            navigation.addListener('focus', async () => {
                first_time = 1 ; 
                at_start_up();
            });
            at_start_up();
        })
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.titleBar}>
                    <Ionicons name="ios-arrow-back" size={24} color="#52575D"
                        onPress={() => {first_time = 1; navigation.goBack();}}
                    ></Ionicons>
                </View>



                <Text style={[styles.subText, styles.recent]}>User Name</Text>
                <View style={{ alignItems: "center" }}>
                    <View style={styles.infoContainer}>
                        <FormInput
                            labelValue={username}
                            onChangeText={(name) => setUsername(name)}
                            placeholderText="name"
                            iconType="edit"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                </View>
                <Text style={[styles.subText, styles.recent]}>Email</Text>
                <View style={{ alignItems: "center" }}>
                    <View style={styles.infoContainer}>
                        <FormInput
                            labelValue={email}
                            onChangeText={(des) => setEmail(des)}
                            placeholderText="email"
                            iconType="mail"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                <Text style={{textAlign : 'center', color : 'red'}}>
                    {checkMsg}
                </Text>

                <View style={{ alignItems: "center" }}>
                    <View style={styles.infoContainer}>
                        <FormButton
                            buttonTitle={saveButtonTitle}
                            onPress = {
                                async ()=>{

                                    if (!username.trim()) {

                                        setCheckMsg('Set all information');
                                        
                                        return;
                                  
                                      }

                                      if (!email.trim()) {

                                        setCheckMsg('Set all information');
                                  
                                        return;
                                  
                                      }
                                      setSaveButtonTitle('Saving ...');

                                    first_time = 1;

                                    let token = await SecureStore.getItemAsync('token');
                                    if (token) {

                                        let host_name = await ip_server.get_hostname();
                                        let link = 'http://'+host_name+'/User/update';


                                        let data = 'token='+token+ '&id='+_id+'&username='+username+'&email='+email;

                                        //console.log(data);

                                        let myInit = {
                                            method: 'POST',
                                            headers: {'Content-Type':'application/x-www-form-urlencoded'}, // this line is important, if this content-type is not set it wont work
                                            body: data
                                        };

                                        fetch(link, myInit)
                                        .then((res)=>{return res.json();})
                                        .then(res =>{
                                            if(res.msg === '0'){
                                                navigation.navigate('User');
                                                console.log("success"); 
                                            }else{
                                                //setErrorMsg(res.msg);
                                            }

                                        })
                                        .catch(err =>{
                                            console.log(err);
                                                first_time = 1;
                                                navigation.navigate('User');
                                            
                                        })
                                        .finally(()=>{

                                        });
                                    }else{
                                        first_time = 1;
                                        log_out();
                                        navigation.navigate('LoginScreen');
                                    }

                                }
                            }
                        />
                        
                    </View>
                </View>
                <Text>

                </Text>


            </ScrollView>
        </SafeAreaView>
    );
}
export default AddPrking;

const styles = StyleSheet.create({
    container: {
        marginTop:22,
        flex: 1,
        backgroundColor: "#FFF"
    },
    text: {
        color: "#52575D"
    },
    image: {
        flex: 1,
        height: undefined,
        width: undefined
    },
    titleBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
        marginHorizontal: 16
    },
    editBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 0,
        marginHorizontal: 320
    },
    subText: {
        fontSize: 12,
        color: "#AEB5BC",
        textTransform: "uppercase",
        fontWeight: "500"
    },
    profileImage: {
        width: 200,
        height: 200,
        borderRadius: 100,
        overflow: "hidden"
    },
    dm: {
        backgroundColor: "#41444B",
        position: "absolute",
        top: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    delete_profile_image: {
        backgroundColor: "#41444B",
        position: "absolute",
        bottom : 20,
        right : 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    edit: {
        backgroundColor: "#41444B",
        position: "absolute",
        bottom: 28,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    active: {
        backgroundColor: "#34FFB9",
        position: "absolute",
        bottom: 28,
        left: 10,
        padding: 4,
        height: 20,
        width: 20,
        borderRadius: 10
    },
    add: {
        backgroundColor: "#41444B",
        position: "absolute",
        bottom: 20,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center"
    },
    infoContainer: {
        alignSelf: "center",
        alignItems: "center",
        marginTop: 16
    },
    statsContainer: {
        flexDirection: "row",
        alignSelf: "center",
        marginTop: 32
    },
    statsBox: {
        alignItems: "center",
        flex: 1
    },
    mediaImageContainer: {
        width: 180,
        height: 200,
        borderRadius: 12,
        overflow: "hidden",
        marginHorizontal: 10
    },
    mediaCount: {
        backgroundColor: "#41444B",
        position: "absolute",
        top: "50%",
        marginTop: -100,
        marginLeft: 150,
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        shadowColor: "rgba(0, 0, 0, 0.38)",
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        shadowOpacity: 1
    },
    recent: {
        marginLeft: 38,
        marginTop: 10,
        marginBottom: 0,
        fontSize: 15
    },
    recentItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16
    },
    activityIndicator: {
        backgroundColor: "#CABFAB",
        padding: 4,
        height: 12,
        width: 12,
        borderRadius: 6,
        marginTop: 3,
        marginRight: 20
    }
});
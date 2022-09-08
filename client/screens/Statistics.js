import React from "react";
import { useContext, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, Button, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import FormButton from '../components/FormButton';
import { Picker } from "@react-native-picker/picker";
import style from '../assets/styles';

import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import * as ip_server from './server_ip';
import DateTimePickerModal from "react-native-modal-datetime-picker";


async function log_out() {
    await SecureStore.deleteItemAsync('token');
}





const Statistics = ({ }) => {
    const navigation = useNavigation();
    const [isFirstDatePickerVisible, setFirstDatePickerVisibility] = useState(false);
    const [isSecondDatePickerVisible, setSecondDatePickerVisibility] = useState(false);
    const [FirstDate, setFirstDate] = useState(new Date());
    const [SecondDate, setSecondDate] = useState(new Date());
    const [index, setIndex] = useState('');
    const [first_time, setFirst_time] = useState(1);
    const [parking, setParking] = useState([]);
    const [checkMsg, setCheckMsg] = useState('');
    const [saveButtonTitle, setSaveButtonTitle] = useState('Analyser');
    const [first_date_change, setfirst_date_change] = useState(0);
    const [second_date_change, setsecond_date_change] = useState(0);
    var first_refresh = 0;
    const showFirstDatePicker = () => {
        setFirstDatePickerVisibility(true);
    };

    const hideFirstDatePicker = () => {
        setFirstDatePickerVisibility(false);
    };

    const handleFirstConfirm = (date) => {
        setFirstDate(date)
        setfirst_date_change(1);
        //console.log("A date has been picked: ", FirstDate);
        hideFirstDatePicker();
    };
    const showSecondDatePicker = () => {
        setSecondDatePickerVisibility(true);
    };

    const hideSecondDatePicker = () => {
        setSecondDatePickerVisibility(false);
    };

    const handleSecondConfirm = (date) => {
        setSecondDate(date)
        setsecond_date_change(1)
        //console.log("A date has been picked: ", SecondDate);
        hideSecondDatePicker();
    };



    const at_start_up = async () => {

        if (first_time === 1) {
            let token = await SecureStore.getItemAsync('token');
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
                        setParking(res.parking)
                        setFirst_time(0);
                    }).catch(err => {

                        console.log(err)

                    });
            } else {
                log_out();
                this.propsnavigation.navigate('LoginScreen');
            }
        }

    }

    useFocusEffect(
        React.useCallback(() => {
            at_start_up();

            navigation.addListener('focus', async () => {
                setFirst_time(1);
            });



        })
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={style.top}>
                    <Text style={style.title}>Statistiques</Text>
                </View>
                <Text style={[styles.subText, styles.recent]}>Nom du parking</Text>
                <View style={{ alignItems: "center" }}>
                    <View style={styles.infoContainer}>
                        <Picker
                            selectedValue={index}
                            style={{ height: 50, width: 350 }}
                            onValueChange={
                                (itemValue, itemIndex) => {
                                    setIndex(itemValue)
                                }
                            }
                        >
                            {Object.keys(parking).map((key) => {
                                return (<Picker.Item label={parking[key].title} value={parking[key]._id} key={key} />) //if you have a bunch of keys value pair
                            })}
                        </Picker>
                    </View>
                </View>
                <Text style={[styles.subText, styles.recent]}>premiére date</Text>
                <View style={styles.infoContainer}>
                    <Button title="cliquer ici pour choisir une date" onPress={showFirstDatePicker} />
                    <DateTimePickerModal
                        isVisible={isFirstDatePickerVisible}
                        mode="datetime"
                        onConfirm={handleFirstConfirm}
                        onCancel={hideFirstDatePicker}

                    />
                </View>
                <Text style={[styles.subText, styles.recent]}>deuxième date</Text>
                <View style={styles.infoContainer}>
                    <Button title="cliquer ici pour choisir une date" onPress={showSecondDatePicker} />
                    <DateTimePickerModal
                        isVisible={isSecondDatePickerVisible}
                        mode="datetime"
                        onConfirm={handleSecondConfirm}
                        onCancel={hideSecondDatePicker}
                    />
                </View>
                <Text style={{ textAlign: 'center', color: 'red' }}>
                    {checkMsg}
                </Text>
                <View style={{ alignItems: "center" }}>
                    <View style={styles.infoContainer}>
                        <FormButton
                            buttonTitle={saveButtonTitle}
                            onPress={
                                async () => {
                                    var current_date = new Date();
                                    //current_date.toISOString
                                    if (!index.trim()) {

                                        setCheckMsg('Set all information');

                                        return;

                                    }
                                    if (FirstDate.getTime() > SecondDate.getTime()) {

                                        setCheckMsg('second date must be bigger then first');

                                        return;

                                    }
                                    if (first_date_change == 0 || second_date_change == 0) {

                                        setCheckMsg('set all informations');

                                        return;

                                    }
                                    if (FirstDate.getTime() > current_date.getTime() || SecondDate.getTime() > current_date.getTime()) {

                                        setCheckMsg('date must be lower then current date');

                                        return;

                                    }
                                    setCheckMsg("")
                                    setFirst_time(1);
                                    let token = await SecureStore.getItemAsync('token');
                                    if (token) {
                                        setfirst_date_change(1);
                                        setsecond_date_change(1);
                                        var first_date_json = {};
                                        first_date_json.secondes = current_date.getSeconds();
                                        first_date_json.minutes = current_date.getMinutes();
                                        first_date_json.hours = current_date.getHours();
                                        first_date_json.year = FirstDate.getFullYear();
                                        first_date_json.month = FirstDate.getMonth() + 1;
                                        first_date_json.day = FirstDate.getDate();
                                        var second_date_json = {};
                                        second_date_json.secondes = current_date.getSeconds();
                                        second_date_json.minutes = current_date.getMinutes();
                                        second_date_json.hours = current_date.getHours();
                                        second_date_json.year = SecondDate.getFullYear();
                                        second_date_json.month = SecondDate.getMonth() + 1;
                                        second_date_json.day = SecondDate.getDate();
                                        setFirst_time(1);
                                        navigation.navigate("Charts", { index, first_date_json, second_date_json });
                                        //console.log(current_date);
                                        //console.log(FirstDate);
                                        //console.log(SecondDate); 


                                    } else {
                                        setFirst_time(1);
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
export default Statistics;

const styles = StyleSheet.create({
    container: {
        marginTop: 0,
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
        marginTop: 44,
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
        bottom: 20,
        right: 0,
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
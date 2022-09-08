import * as React from 'react';
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import * as ip_server from './server_ip';
import { Text, View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import {
    LineChart,
    PieChart,
} from 'react-native-chart-kit';
export default class Charts extends React.Component {
    state = {
        firstTime: 0,
        parking: {
            free_history_id: ["0", "0"],
            free_history_free: [0, 0],
            spots: 0,
            title: "",
            total: 0,
            total_ooccuped: 0,
            pourcentage_occuped: 0,

        }
    }
    at_start_up = async () => {
        index = this.props.route.params.index;
        second_date_json = this.props.route.params.second_date_json;
        first_date_json = this.props.route.params.first_date_json;
        let token = await SecureStore.getItemAsync('token');

        if (this.state.firstTime === 0)
            if (token) {
                //
                host_name = await ip_server.get_hostname();
                let data = 'token=' + token + "&_id=" + index + "&first_date_json=" + JSON.stringify(first_date_json) + "&second_date_json=" + JSON.stringify(second_date_json);
                let linkLoc = 'http://' + host_name + '/Statistics/get';
                let reqLoc = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },// this line is important, if this content-type is not set it wont work
                    body: data

                };
                fetch(linkLoc, reqLoc)
                    .then((res) => { return res.json(); })
                    .then(res => {
                        //console.log(res.parking.free_history)
                        this.setState({ parking: res.parking })
                        this.setState({ firstTime: 1 });
                    }).catch(err => {

                        console.log(err)

                    });
            } else {
                log_out();
                this.props.navigation.navigate('LoginScreen');
            }
    }

    render() {
        this.at_start_up();
        this.props.navigation.addListener('focus', async () => {
            this.setState({ firstTime: 0 });
        });
        return (
            <ScrollView>

                <View style={styles.container}>
                    <View>
                        <View style={styles.titleBar}>
                            <Ionicons name="ios-arrow-back" style={{
                            }} size={24} color="#52575D"
                                onPress={() => { this.props.navigation.goBack(); }}
                            ></Ionicons>
                        </View>
                        <Text
                            style={{
                                textAlign: 'center',
                                fontSize: 18,
                                padding: 16,
                            }}>
                            {this.state.parking.title}
                            {" :\n\n Taux d'occupation :"}
                        </Text>
                        <PieChart data={[
                            {
                                name: '\n % ',
                                occupation: this.state.parking.pourcentage_occuped,
                                color: '#f51818',
                                legendFontColor: '#050505',
                                legendFontSize: 15,
                            },
                            {
                                name: '%',
                                occupation: 100 - this.state.parking.pourcentage_occuped,
                                color: '#62f518',
                                legendFontColor: '#050505',
                                legendFontSize: 15,
                            },
                        ]}
                            width={Dimensions.get('window').width - 16} height={220}
                            chartConfig={{
                                backgroundColor: '#194ad1',
                                backgroundGradientFrom: '#f74871',
                                backgroundGradientTo: '#ffbc47',
                                decimalPlaces: 2,
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: {
                                    borderRadius: 16,
                                },
                            }}
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                            }}
                            accessor="occupation"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    </View>
                </View>
                <View style={styles.container}>
                    <Text
                        style={{
                            textAlign: 'center',
                            fontSize: 18,
                            padding: 16,
                            marginTop: 16,
                        }}>
                        {"Places disponibles en fonction du temps  "}
                    </Text>
                    <View>
                        <LineChart data={{
                            labels: this.state.parking.free_history_id,
                            datasets: [
                                {
                                    data: this.state.parking.free_history_free,
                                    strokeWidth: 1,
                                    withDots: false

                                },
                            ],
                            legend: ["places disponibles"] // optional

                        }}

                            width={Dimensions.get('window').width - 16}
                            height={220}
                            chartConfig={{
                                backgroundGradientFrom: '#FFFFFF',
                                backgroundGradientTo: '#FFFFFF',
                                decimalPlaces: 0,
                                color: (opacity = 0) => `rgba(0, 0, 0, ${opacity})`,
                                style: {
                                    borderRadius: 16,
                                },
                            }}
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                            }}
                            bezier
                        />
                    </View>
                </View>
            </ScrollView>

        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 8,
        paddingTop: 30,
        backgroundColor: '#ecf0f1',
    },
    titleBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
        marginHorizontal: 16
    },
});
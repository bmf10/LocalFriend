import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    Linking,
    ToastAndroid,
    AppState
} from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome5";
import auth from "@react-native-firebase/auth";
import database from "@react-native-firebase/database";
import Geolocation from "@react-native-community/geolocation";
import MapView, { Marker } from 'react-native-maps';
import moment from 'moment'
import { withNavigationFocus } from "react-navigation";


class HomeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            longitude: '' || 0,
            latitude: '' || 0,
            allUser: [],
            modalVisible: false,
            userPress: '',
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
        }
    }

    handleLogout = () => {
        Alert.alert(
            null,
            "Are you sure you want to sign-out?", [{
                text: "Yes", onPress: () => {
                    auth()
                        .signOut()
                        .then(() => {
                            this
                                .props
                                .navigation
                                .navigate('Login')
                        })
                        .catch((e) => console.log(e));
                }
            }, { text: "No" }]
        )
    }

    componentDidMount() {
        this.handleUser();
        this.handleAllUser();
        this.handleLocation();
        this.handleLastSeen();
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.isFocused != this.props.isFocused) {
            if (await this.props.isFocused) {
                this.handleUser();
                this.handleAllUser();
            }
        }
    }

    handleLocation() {
        setInterval(() => {
            const user = auth().currentUser;
            Geolocation.getCurrentPosition((location) => {
                database()
                    .ref('users')
                    .child(user.uid)
                    .update({
                        longitude: location.coords.longitude,
                        latitude: location.coords.latitude,
                        lastSeen: "Online"
                    });
            })
        }, 1000);
    }

    handleLastSeen() {
        AppState.addEventListener('change', state => {
            if (state !== "active") {
                const user = auth().currentUser;
                const date = moment(new Date()).format('dddd D MMM YYYY, h:mm a');
                database()
                    .ref('users')
                    .child(user.uid)
                    .update({
                        lastSeen: date
                    });
            }
        })

    }


    handleUser = () => {
        Geolocation.getCurrentPosition((location) => {
            const user = auth().currentUser;
            const date = moment(new Date()).format('dddd D MMM YYYY, h:mm a');
            if (user.metadata.creationTime > new Date().getTime() - 10000) {
                const data = {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    gender: "Not mentioned",
                    phoneNumber: user.phoneNumber,
                    photoURL: user.photoURL,
                    lastSeen: date,
                    about: "Hi, I just joined the local friend. Nice to meet you! 😁",
                    longitude: location.coords.longitude,
                    latitude: location.coords.latitude
                };
                const key = data.uid
                database()
                    .ref('users')
                    .child(key)
                    .set(data);
            } else {
                database()
                    .ref('users')
                    .child(user.uid)
                    .update({
                        longitude: location.coords.longitude,
                        latitude: location.coords.latitude,
                    });
            }

            this.setState({ longitude: location.coords.longitude, latitude: location.coords.latitude });
        }, err => {
            ToastAndroid.showWithGravity("Please enable location permission", ToastAndroid.LONG, ToastAndroid.CENTER)
        });
    }

    handleAllUser = () => {
        database().ref('/users').on('value', snapshot => {
            const initData = [];
            Object
                .keys(snapshot.val())
                .forEach(index => initData.push(snapshot.val()[index]));
            this.setState({ allUser: initData })
        })
    }

    handleChat = () => {
        this.setState({ modalVisible: false })
        this.props.navigation.navigate('ChatChildScreen', { receiver: this.state.userPress.uid });
    }

    render() {
        const { latitude, longitude, allUser, longitudeDelta, latitudeDelta } = this.state;
        return (
            <View style={styles.container}>
                <MapView
                    onRegionChangeComplete={(region) => this.setState({ latitude: region.latitude, longitude: region.longitude, longitudeDelta: region.longitudeDelta, latitudeDelta: region.latitudeDelta })}
                    style={styles.map}
                    region={{
                        latitude: latitude,
                        longitude: longitude,
                        latitudeDelta: latitudeDelta,
                        longitudeDelta: longitudeDelta
                    }}>
                    {allUser.length > 0
                        ? allUser.map(({
                            photoURL,
                            latitude,
                            longitude
                        }, index) => {
                            return (
                                <Marker onPress={() => this.setState({
                                    modalVisible: true, userPress: allUser[index], latitude: latitude,
                                    longitude: longitude
                                })}
                                    key={index}
                                    coordinate={{
                                        latitude: latitude,
                                        longitude: longitude
                                    }}><Image
                                        style={styles.photoMap}
                                        source={{
                                            uri: photoURL
                                        }} />
                                </Marker>
                            )
                        })
                        : <View />}

                </MapView>
                <TouchableOpacity onPress={this.handleLogout} style={styles.fab}><Icon style={styles.fabIcon} name="sign-out-alt" /></TouchableOpacity>
                <Modal animationType="slide" supportedOrientations="portrait" visible={this.state.modalVisible} transparent={true}>
                    <View style={styles.modal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalHeaderText}>Detail Profile</Text>
                            <TouchableOpacity onPress={() => this.setState({ modalVisible: false })}>
                                <Icon style={styles.modalHeaderClose} name="times" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            <ScrollView>
                                <Image style={styles.modalImage} source={{ uri: this.state.userPress.photoURL }} />
                                <Text style={styles.modalName}>{this.state.userPress.displayName}</Text>
                                <Text style={styles.textHeader}>About Me</Text>
                                <Text style={styles.textBody}>{this.state.userPress.about}</Text>
                                <Text style={styles.textHeader}>Date of Birth</Text>
                                <Text style={styles.textBody}>{this.state.userPress.dob ? this.state.userPress.dob : "Not Mentioned"}</Text>
                                <Text style={styles.textHeader}>Gender</Text>
                                <Text style={styles.textBody}>{this.state.userPress.gender}</Text>
                                <Text style={styles.textHeader}>Phone Number</Text>
                                <Text style={styles.textBody}>{this.state.userPress.phoneNumber ? this.state.userPress.phoneNumber : "Not Mentioned"}</Text>
                                <Text style={styles.textHeader}>Email</Text>
                                <Text style={styles.textBody}>{this.state.userPress.email}</Text>
                                <Text style={styles.textHeader}>Last seen</Text>
                                <Text style={styles.textBody}>{this.state.userPress.lastSeen}</Text>
                            </ScrollView>
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.foot} onPress={() => Linking.openURL('mailto:' + this.state.userPress.email + '?subject= Hello, ' + this.state.userPress.displayName + '&body=Hello, I know you from Local Friend. I want to know you! 🙂')}>
                                <Icon style={styles.footIcon} name="envelope" />
                                <Text style={styles.footLabel}>Email</Text>
                            </TouchableOpacity>
                            <View style={styles.vr} />
                            <TouchableOpacity onPress={this.handleChat} style={styles.foot}>
                                <Icon style={styles.footIcon} name="comments" />
                                <Text style={styles.footLabel}>Chat</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#faf8f0",
        flex: 1
    },
    fab: {
        height: 50,
        width: 50,
        borderColor: "#000",
        borderRadius: 50,
        backgroundColor: "#043353",
        borderWidth: 1,
        justifyContent: "center",
        alignSelf: 'flex-end',
        right: 30,
        top: 30,
        zIndex: 4
    },
    fabIcon: {
        alignSelf: 'center',
        color: '#faf8f0',
        fontSize: 18
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        flex: 1
    },
    photoMap: {
        height: 30,
        width: 30,
        borderRadius: 50,
        borderColor: "#043353",
        borderWidth: 1
    },
    modal: {
        top: "6%",
        left: "10%",
        width: "80%",
        height: "80%",
        backgroundColor: "#faf8f0",
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,

        elevation: 10,
    },
    modalHeader: {
        height: 50,
        width: "100%",
        backgroundColor: "#18a4e0",
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        flexDirection: "row",
        alignItems: "center"
    },
    modalHeaderText: {
        color: "#faf8f0",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 15,
        flex: 1
    },
    modalHeaderClose: {
        fontSize: 25,
        color: "#043353",
        marginRight: 15
    },
    modalBody: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10
    },
    modalImage: {
        height: 120,
        width: 120,
        borderRadius: 100,
        borderColor: "#043353",
        borderWidth: 1,
        alignSelf: "center",
        marginTop: 20
    },
    modalName: {
        marginBottom: 10,
        marginTop: 20,
        alignSelf: 'center',
        fontSize: 20,
        fontWeight: "bold"
    },
    modalFooter: {
        height: 50,
        width: "100%",
        backgroundColor: "#043353",
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        flexDirection: "row",
        justifyContent: "center"
    },
    foot: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
    },
    footIcon: {
        color: "#faf8f0",
        fontSize: 24,
        alignSelf: "center",
    },
    footLabel: {
        fontSize: 10,
        color: "#faf8f0"
    },
    vr: {
        top: 10,
        height: "70%",
        width: 1,
        backgroundColor: "#faf8f0"
    },
    textHeader: {
        marginTop: 5,
        alignSelf: 'center',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
        fontSize: 16
    },
    textBody: {
        alignSelf: "center",
        textAlign: "center",
        marginBottom: 5,
        fontSize: 14
    }
})

export default withNavigationFocus(HomeScreen)
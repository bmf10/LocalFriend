import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import auth from "@react-native-firebase/auth";
import database from "@react-native-firebase/database";
import picture from "../assets/nofriend.png";
import { withNavigationFocus } from "react-navigation";
import Icon from 'react-native-vector-icons/FontAwesome5'

class ChatScreen extends Component {
    state = {
        user: [],
        allUser: [],
        chatList: []
    }

    handleUserLogin = () => {
        const user = auth().currentUser;
        database().ref('users').orderByChild('uid').equalTo(user.uid).once('child_added', (snapshot) => {
            this.setState({
                user: snapshot.val()
            })
        });
    }

    handleChat = () => {
        const user = auth().currentUser;
        database().ref('chat/' + user.uid + '/').on("value", snapshot => {
            const initData = [];
            if (snapshot.val()) {
                Object.keys(snapshot.val()).map(key => {
                    initData.push({
                        uid: key
                    })
                })
            }


            const result = [];

            for (let i = 0; i < initData.length; i++) {
                database().ref('users').orderByChild('uid').equalTo(initData[i].uid).once('value', snapshot1 => {
                    if (snapshot1.val()) {
                        Object.keys(snapshot1.val()).forEach(index => result.push(snapshot1.val()[index]));
                        this.setState({
                            chatList: result
                        })
                    }
                })
            }
        })
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.isFocused != this.props.isFocused) {
            if (await this.props.isFocused) {
                this.handleUserLogin();
            }
        }
    }

    componentDidMount() {
        this.handleUserLogin();
        this.handleChat();
    }

    render() {
        const { allUser, chatList } = this.state;
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Chat</Text>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate("EditScreen")} style={styles.profileEdit}>
                        <Icon style={styles.profileEditIcon} name="user-cog" />
                    </TouchableOpacity>
                </View>
                <ScrollView>
                    <View style={styles.profile}>
                        <Text style={styles.profileTitle}>Your Profile</Text>
                        <View style={styles.profileBody}>
                            <Image
                                style={styles.profileImg}
                                source={{
                                    uri: this.state.user.photoURL
                                }} />
                            <View style={styles.profileDetail}>
                                <Text style={styles.profileName}>{this.state.user.displayName}</Text>
                                <Text style={styles.profileEmail}>{this.state.user.email}</Text>
                                <Text style={styles.verif}>Verified</Text>
                            </View>
                        </View>
                    </View>

                    {chatList.length > 0 ? chatList.map((data) => {
                        return (
                            <TouchableOpacity
                                key={data.uid}
                                onPress={() => {
                                    this.props.navigation.navigate('ChatChildScreen', { receiver: data.uid });
                                }}
                                style={styles.chatList}>
                                <Image
                                    style={styles.chatPict}
                                    source={{
                                        uri: data.photoURL
                                    }} />
                                <Text style={styles.chatUser}>{data.displayName}</Text>
                            </TouchableOpacity>
                        )
                    }) : <Image style={styles.empty} source={picture} />}
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#faf8f0",
        flex: 1
    },
    header: {
        backgroundColor: "#043353",
        height: 60,
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        flexDirection: 'row',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,

        elevation: 2,
    },
    title: {
        fontSize: 20,
        color: "#faf8f0",
        fontWeight: 'bold',
        flex: 1,
        marginLeft: 15
    },
    profile: {
        margin: 10,
        backgroundColor: "#18a4e0",
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 4,
    },
    profileBody: {
        marginTop: 10,
        flexDirection: "row"
    },
    profileTitle: {
        color: "#faf8f0",
        fontSize: 18,
        fontWeight: 'bold',
        alignSelf: "center"
    },
    profileImg: {
        marginLeft: 10,
        marginBottom: 10,
        marginRight: 20,
        height: 55,
        width: 55,
        borderRadius: 55,
        borderColor: "#043353",
        borderWidth: 1,
        alignSelf: 'center'
    },
    profileDetail: {
        flexDirection: 'column'
    },
    profileName: {
        fontSize: 16,
        color: "#faf8f0",
        fontWeight: "bold",
        marginBottom: 5
    },
    profileEmail: {
        fontSize: 15,
        color: "#faf8f0",
        fontWeight: "bold",
        marginBottom: 5
    },
    verif: {
        fontSize: 15,
        color: "lightgreen",
        fontWeight: "bold",
        marginBottom: 10
    },
    chatList: {
        backgroundColor: "#d3dde6",
        height: 60,
        flexDirection: "row",
        borderRadius: 5,
        alignItems: "center",
        marginLeft: 10,
        marginRight: 10,
        marginTop: 2,
        marginBottom: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,

        elevation: 1,
    },
    chatPict: {
        height: 50,
        width: 50,
        borderRadius: 50,
        margin: 5
    },
    chatUser: {
        color: "#043353",
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        flex: 1
    },
    badge: {
        height: 18,
        width: 18,
        borderRadius: 18,
        backgroundColor: "#043353",
        marginRight: 20
    },
    badgeText: {
        color: "#faf8f0",
        alignSelf: "center"
    },
    empty: {
        width: 350,
        height: 350,
        alignSelf: 'center',
    },
    profileEdit: {
        marginRight: 15
    },
    profileEditIcon: {
        color: "#faf8f0",
        fontSize: 20,
    }
})

export default withNavigationFocus(ChatScreen)
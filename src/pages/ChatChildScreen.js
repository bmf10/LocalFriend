import React, { Component } from "react";
import { SafeAreaView, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity
} from 'react-native';

class ChatChildScreen extends Component {
    state = {
        messages: [],
        receiver: this.props.navigation.state.params.receiver,
        receiverDetail: []
    }

    componentDidMount() {
        this.getChat();
        this.handleReceiver();
    }

    getChat() {
        const user = auth().currentUser;
        database()
            .ref('chat/' + user.uid + '/' + this.state.receiver)
            .on("child_added", snapshot => {
                this.setState(previousState => ({
                    messages: GiftedChat.append(previousState.messages, snapshot.val())
                }))
            })
    }

    get user() {
        const user = auth().currentUser
        return { _id: user.uid, name: user.displayName, avatar: user.photoURL }
    }

    async onSend(messages = []) {
        const user = auth().currentUser;

        const message = {
            _id: Math
                .random()
                .toString(36)
                .substring(2),
            text: messages[0].text,
            user: messages[0].user,
            createdAt: database.ServerValue.TIMESTAMP
        };

        await database()
            .ref('chat/' + user.uid + '/' + this.state.receiver)
            .push(message);
        await database()
            .ref('chat/' + this.state.receiver + '/' + user.uid)
            .push(message);
    }

    handleReceiver() {
        database().ref('users').orderByChild('uid').equalTo(this.state.receiver).on("value", (snapshot) => {
            this.setState({ receiverDetail: snapshot.val() })
            const initData = []
            Object.keys(snapshot.val()).map(key => {
                initData.push({
                    data: snapshot.val()[key]
                })
            })
            this.setState({ receiverDetail: initData[0].data })
        })
    }

    renderBubble(props) {
        return (
            <Bubble
                {...props}
                textStyle={{
                    right: {
                        color: '#faf8f0',
                    },
                    left: {
                        color: '#faf8f0'
                    }
                }}
                wrapperStyle={{
                    left: {
                        backgroundColor: '#043353',
                    },
                    right: {
                        backgroundColor: "#18a4e0"
                    }
                }}
            />
        );
    }

    render() {
        const { receiverDetail } = this.state;
        return (
            <SafeAreaView style={{
                flex: 1
            }}>
                <View style={styles.header}>
                    <Image style={styles.image} source={{ uri: receiverDetail.photoURL }} />
                    <View>
                        <Text style={styles.name}>{receiverDetail.displayName}</Text>
                        <View style={styles.body}>
                            {receiverDetail.lastSeen != "Online" ? <View style={styles.dotOffline} /> : <View style={styles.dotOnline} />}
                            <View style={styles.dot} />
                            <Text style={styles.status}>{receiverDetail.lastSeen != "Online" ? "Last Seen: " + receiverDetail.lastSeen : receiverDetail.lastSeen}</Text>
                        </View>
                    </View>
                </View><GiftedChat isTyping={true}
                    renderAvatar={() => null}
                    renderBubble={this.renderBubble}
                    showUserAvatar={true}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={this.user}
                    showAvatarForEveryMessage={true} /></SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: "#043353",
        height: 60,
        alignItems: "center",
        justifyContent: "flex-start",
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
    image: {
        height: 45,
        width: 45,
        borderRadius: 45,
        marginLeft: 10,
    },
    name: {
        color: "#faf8f0",
        fontSize: 16,
        marginLeft: 10,
        fontWeight: "bold"
    },
    status: {
        color: "#faf8f0",
        fontSize: 14,
        marginLeft: 5
    },
    dotOnline: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: "green",
        marginLeft: 10,
        alignSelf: "center"
    },
    dotOffline: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: "red",
        marginLeft: 10,
        alignSelf: "center"
    },
    body: {
        flexDirection: 'row',
    }
})

export default (ChatChildScreen)
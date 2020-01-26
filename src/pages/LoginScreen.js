import React, { Component } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import login from "../assets/login.png";
import { GoogleSigninButton, GoogleSignin } from "react-native-google-signin";
import { firebase } from '@react-native-firebase/auth';

class LoginScreen extends Component {

    componentDidMount() {
        GoogleSignin.configure({
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
            webClientId: '47299005813-90amae4k7175e551ld92666o7mdtopo9.apps.googleusercontent.com',
            offlineAccess: true,
            hostedDomain: '',
            forceConsentPrompt: true,
            accountName: '',
        });
    }

    handleLogin = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const credential = firebase.auth.GoogleAuthProvider.credential(userInfo.idToken, userInfo.accessToken);
            await firebase.auth().signInWithCredential(credential);
            this.props.navigation.navigate('Home');
        } catch (error) {
            console.log(error)
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.image} source={login} />
                <Text style={styles.text}>Let's find your friends. Login Now!</Text>
                <GoogleSigninButton
                    size={GoogleSigninButton.Size.Wide}
                    color={GoogleSigninButton.Color.Light}
                    style={styles.googlebtn}
                    onPress={this.handleLogin}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#043353",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center"
    },
    image: {
        width: 300,
        height: 300,
    },
    text: {
        fontSize: 20,
        color: '#faf8f0',
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: "center"
    },
    googlebtn: {
        marginBottom: 30
    }
})

export default (LoginScreen);
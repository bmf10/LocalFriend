import React, { Component } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import Logo from "../assets/splash.png";
import { firebase } from '@react-native-firebase/auth';

class SplashScreen extends Component {

    state = {
        loading: false
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({
                loading: true
            })
        }, 300)
        this.getCurrentUser();
    }

    getCurrentUser = () => {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                setTimeout(() => {
                    this
                        .props
                        .navigation
                        .navigate('Home')
                }, 1000)
            } else {
                setTimeout(() => {
                    this
                        .props
                        .navigation
                        .navigate('Login')
                }, 1000)
            }
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.image} source={Logo} />
                <Text style={styles.text}>Copyright © 2020 Local Friend</Text>
                <ActivityIndicator animating={this.state.loading} style={styles.loading} size="large" color="#18a4e0" />
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
        width: 350,
        height: 350,
        marginTop: -70,
        marginBottom: 50
    },
    text: {
        alignContent: 'center',
        justifyContent: "center",
        alignItems: "center",
        color: "#18a4e0",
        fontSize: 12,
        textDecorationLine: 'underline'
    },
    loading: {
        marginTop: 30,
    }
})

export default (SplashScreen);